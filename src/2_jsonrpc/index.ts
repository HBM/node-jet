import {
  ConnectionClosed,
  type JsonRPCError,
  methodNotFoundError,
  ParseError
} from '../3_jet/errors.js'
import type { JsonParams } from '../3_jet/peer/index.js'
import {
  castMessage,
  type ErrorMessage,
  type Message,
  type MessageParams,
  type MethodRequest,
  type ResultMessage
} from '../3_jet/messages.js'
import type { logger, Logger } from '../3_jet/log.js'
import { Socket } from '../1_socket/socket.js'
import { EventEmitter } from '../1_socket/index.js'
import type { ValueType } from '../3_jet/types.js'
/**
 * Helper shorthands.
 */
const encode = JSON.stringify
const decode = JSON.parse

export type resultCallback =
  | ((_success: boolean, _result?: object) => void)
  | undefined

const isResultMessage = (msg: Message): msg is ResultMessage => 'result' in msg
const isErrorMessage = (msg: Message): msg is ErrorMessage => 'error' in msg
export interface JsonRpcConfig {
  batches?: boolean
  url?: string
  port?: number
  ip?: string
  log?: logger
}
/**
 * JsonRPC Instance
 * class used to interpret jsonrpc messages. This class can parse incoming socket messages to jsonrpc messages and fires events
 */

export class JsonRPC extends EventEmitter {
  sock!: Socket
  config: JsonRpcConfig
  messages: Message[] = []
  messageId = 1
  user = ''
  _isOpen = false
  openRequests: Record<
    string,
    {
      resolve: (value: ValueType | PromiseLike<ValueType>) => void
      reject: (value: JsonRPCError | PromiseLike<JsonRPCError>) => void
    }
  > = {}
  requestId = ''
  resolveDisconnect!: (value: void | PromiseLike<void>) => void

  rejectDisconnect!: (reason?: any) => void
  disconnectPromise!: Promise<void>
  resolveConnect!: (value: void | PromiseLike<void>) => void

  rejectConnect!: (reason?: any) => void
  connectPromise!: Promise<void>
  logger: Logger
  abortController!: AbortController

  constructor(logger: Logger, config?: JsonRpcConfig, sock?: Socket) {
    super()
    this.config = config || {}
    this.createDisconnectPromise()
    this.createConnectPromise()
    this.logger = logger
    if (sock) {
      this.sock = sock
      this._isOpen = true
      this.subscribeToSocketEvents()
    }
  }
  /**
   * Method called before disconnecting from the device to initialize Promise, that is only resolved when disconnected
   */
  createDisconnectPromise = () => {
    this.disconnectPromise = new Promise<void>((resolve, reject) => {
      this.resolveDisconnect = resolve
      this.rejectDisconnect = reject
    })
  }
  /**
   * Method called before connecting to the device to initialize Promise, that is only resolved when a connection is established
   */
  createConnectPromise = () => {
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.resolveConnect = resolve
      this.rejectConnect = reject
    })
  }
  /**
   * Method called to subscribe to all relevant socket events
   */
  subscribeToSocketEvents = () => {
    this.sock.addEventListener('error', this._handleError)
    this.sock.addEventListener('message', this._handleMessage)
    this.sock.addEventListener('open', () => {
      this._isOpen = true
      this.createDisconnectPromise()
      if (this.abortController.signal.aborted) {
        this.logger.warn('user requested abort')
        this.close()
        this.rejectConnect()
      } else {
        this.resolveConnect()
      }
    })
    this.sock.addEventListener('close', () => {
      this._isOpen = false
      this.resolveDisconnect()
      this.createConnectPromise()
    })
  }
  /**
   * Method to connect to a Server instance. Either TCP Server or Webserver
   * @params controller: an AbortController that can be used to abort the connection
   */
  connect = async (
    controller: AbortController = new AbortController()
  ): Promise<void> => {
    if (this._isOpen) {
      await Promise.resolve()
      return
    }
    this.abortController = controller
    const { config } = this
    this.sock = new Socket()
    this.sock.connect(config.url, config.ip, config.port || 11122)
    this.subscribeToSocketEvents()
    await this.connectPromise
  }

  /**
   * Close.
   */
  close = async (): Promise<void> => {
    if (!this._isOpen) {
      await Promise.resolve()
      return
    }
    this.send()
    this.sock.close()
    await this.disconnectPromise
  }

  _handleError = (err: Event) => {
    this.logger.error(`Error in socket connection: ${err}`)
    if (!this._isOpen) {
      this.rejectConnect(err)
    }
  }

  _convertMessage = async (message: Blob | string): Promise<string> => {
    if (message instanceof Blob) {
      return await message
        .arrayBuffer()
        .then((buf) => new TextDecoder().decode(buf))
    }
    return await Promise.resolve(message)
  }
  /**
   * _dispatchMessage
   *
   * @api private
   */
  _handleMessage = (event: MessageEvent) => {
    this._convertMessage(event.data).then((message) => {
      this.logger.sock(`Received message: ${message}`)
      let decoded
      try {
        decoded = decode(message)
        if (Array.isArray(decoded)) {
          for (let i = 0; i < decoded.length; i++) {
            this._dispatchSingleMessage(decoded[i])
          }
        } else {
          this._dispatchSingleMessage(decoded)
        }
        this.send()
      } catch (err: any) {
        const decodedId = decoded?.id || ''
        this.respond(decodedId, new ParseError(message), false)
        this.logger.error(err)
      }
    })
  }

  /**
   * _dispatchSingleMessage
   *
   * @api private
   */
  _dispatchSingleMessage = (
    message: MethodRequest | ResultMessage | ErrorMessage
  ) => {
    if (isResultMessage(message) || isErrorMessage(message)) {
      this._dispatchResponse(message)
    } else this._dispatchRequest(castMessage<MethodRequest>(message))
  }

  /**
   * _dispatchResponse
   *
   * @api private
   */
  _dispatchResponse = (message: ResultMessage | ErrorMessage) => {
    const mid = message.id
    if (isResultMessage(message)) this.successCb(mid, message.result)
    if (isErrorMessage(message)) this.errorCb(mid, message.error)
  }

  /**
   * _dispatchRequest.
   * Handles both method calls and fetchers (notifications)
   *
   * @api private
   */
  _dispatchRequest = (message: MethodRequest) => {
    if (this.listenerCount(message.method) === 0) {
      this.logger.error(`Method ${message.method} is unknown`)
      this.respond(message.id, new methodNotFoundError(message.method), false)
    } else this.emit(message.method, this, message.id, message.params)
  }

  /**
   * Queue.
   */
  queue = async <T extends MessageParams | Message>(message: T, id = '') => {
    if (!this._isOpen) return await Promise.reject(new ConnectionClosed())
    if (id) this.messages.push({ method: id, params: message } as Message)
    else this.messages.push(message as Message)
    if (!this.config.batches) this.send()
  }

  /**
   * Send.
   */
  send = () => {
    if (this.messages.length > 0) {
      const encoded = encode(
        this.messages.length === 1 ? this.messages[0] : this.messages
      )
      this.logger.sock(`Sending message:  ${encoded}`)
      this.sock.send(encoded)
      this.messages = []
    }
  }

  /**
   * Responding a request
   * @param id the request id to respond to
   * @param params the result of the request
   * @param success if the request was fulfilled
   */
  respond = (id: string, params: ValueType, success: boolean) => {
    this.queue({ id, [success ? 'result' : 'error']: params })
  }

  successCb = (id: string, result: ValueType) => {
    if (id in this.openRequests) {
      this.openRequests[id].resolve(result)
      delete this.openRequests[id]
    }
  }
  errorCb = (id: string, error: JsonRPCError) => {
    if (id in this.openRequests) {
      this.openRequests[id].reject(error)
      delete this.openRequests[id]
    }
  }
  /**
   * Method to send a request to a JSONRPC Server.
   */
  sendRequest = async <T extends ValueType>(
    method: string,
    params: JsonParams,
    // Jet Peer uses send immediate to call all functions without delay
    sendImmediate = false
  ): Promise<T> =>
    await new Promise<T>((resolve, reject) => {
      if (!this._isOpen) reject(new ConnectionClosed())
      else {
        const rpcId = this.messageId.toString()
        this.messageId++
        this.openRequests[rpcId] = {
          resolve: resolve as (
            value: ValueType | PromiseLike<ValueType>
          ) => void,
          reject
        }
        this.queue({
          id: rpcId.toString(),
          method,
          params
        })
        if (sendImmediate) this.send()
      }
    })
}

export default JsonRPC
