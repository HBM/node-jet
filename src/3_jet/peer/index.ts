import { InfoOptions } from '../daemon/index.js'
import { fetchSimpleId, PublishMessage, ValueType } from '../types.js'
import JsonRPC, { JsonRpcConfig } from '../../2_jsonrpc/index.js'
import Method from './method.js'
import State from './state.js'
import Fetcher from './fetcher.js'
import { logger, Logger } from '../log.js'
import { isState } from '../utils.js'
import { invalidMethod, InvalidParamError, NotFound } from '../errors.js'
import { Socket } from '../../1_socket/socket.js'
import { Subscription } from '../daemon/subscription.js'
import { EventEmitter } from '../../1_socket/index.js'
import { nanoid } from 'nanoid'
import { MethodParams, PathParams, SetParams } from '../messages.js'
import { access } from '../daemon/route.js'

const fallbackDaemonInfo: InfoOptions = {
  name: 'unknown-daemon',
  version: '0.0.0',
  protocolVersion: '1.0.0',
  features: {
    fetch: 'full',
    batches: true,
    asNotification: false
  }
}

export interface JsonParams<T = ValueType> {
  method?: string
  access?: access
  path?: string | Record<string, string | string[]>
  args?: object
  timeout?: number
  value?: T
  user?: string
  password?: string
  groups?: string[]
  id?: string
}
export type publishEvent = 'Add' | 'Remove' | 'Change'
export interface PublishParams<T = ValueType> {
  event?: publishEvent
  path: string
  value?: T
}

export interface PeerConfig extends JsonRpcConfig {
  url?: string
  ip?: string
  port?: number
  name?: string
  log?: logger
}

/**
 * Create a Jet Peer instance.
 * @class
 * @classdesc A Peer instance is required for all actions related to Jet.
 * A Peer connected to a Daemon is able to add content (States/Methods)
 * or to consume content (by fetching or by calling set).
 * The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
 * When specifying the url field, the peer uses the Websocket protocol as transport.
 * If no config is provided, the Peer connects to the local ('localhost') Daemon using
 * the trivial protocol.
 * Browsers do only support the Websocket transport and must be provided with a config with url field.
 *
 * @param {PeerConfig} [config] A peer configuration
 * @param {string} [config.url] The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
 * @param {string} [config.ip=localhost] The Jet Daemon TCP trivial protocol ip
 * @param {number} [config.port=11122] The Jet Daemon TCP trivial protocol port
 * @param {string} [config.user] The user name used for authentication
 * @param {string} [config.password] The user's password used for auhtentication
 * @returns {Peer} The newly created Peer instance.
 *
 * @example
 * var peer = new jet.Peer({url: 'ws://jetbus.io:8080'})
 */

export class Peer extends EventEmitter {
  #config: PeerConfig
  #jsonrpc: JsonRPC
  //All requests are send immediately except the batch function is called
  #sendImmediate = true
  #daemonInfo: InfoOptions = fallbackDaemonInfo
  #routes: Record<string, Method | State<ValueType>> = {}
  #fetcher: Record<string, Fetcher> = {}
  #log: Logger
  cache: Record<string, PublishMessage<ValueType>> = {}
  constructor(config?: PeerConfig, sock?: Socket) {
    super()
    this.#config = config || {}
    this.#log = new Logger(this.#config.log)
    this.#jsonrpc = new JsonRPC(this.#log, config, sock)
    this.#jsonrpc.addListener(
      'get',
      (_peer: JsonRPC, id: string, m: PathParams) => {
        if (m.path in this.#routes) {
          const state = this.#routes[m.path] as State<ValueType>
          if (!isState(state)) {
            const error = new invalidMethod(
              `Tried to get value of ${m.path} which is a method`
            )
            this.#log.error(error.toString())
            this.#jsonrpc.respond(id, error, false)
          } else {
            this.#jsonrpc.respond(id, state.toJson(), true)
          }
        } else {
          this.#jsonrpc.respond(id, new NotFound(m.path), false)
        }
      }
    )
    this.#jsonrpc.addListener(
      'set',
      (_peer: JsonRPC, id: string, m: SetParams) => {
        if (m.path in this.#routes) {
          const state = this.#routes[m.path]
          if (!isState(state)) {
            const error = new invalidMethod(
              `Tried to set ${m.path} which is a method`
            )
            this.#log.error(error.toString())
            this.#jsonrpc.respond(id, error, false)
            return
          }
          try {
            state.emit('set', m.value)
            state.value(m.value)
            this.#jsonrpc.respond(id, state.toJson(), true)
          } catch (err) {
            this.#jsonrpc.respond(
              id,
              new InvalidParamError(
                'InvalidParam',
                'Failed to set value',
                err && typeof err == 'object' ? err.toString() : undefined
              ),
              false
            )
          }
        } else {
          const error = new NotFound(m.path)
          this.#log.error(error.toString())
          this.#jsonrpc.respond(id, error, false)
        }
      }
    )
    this.#jsonrpc.addListener(
      'call',
      (_peer: JsonRPC, id: string, m: MethodParams) => {
        if (m.path in this.#routes) {
          const method = this.#routes[m.path]
          if (isState(method)) {
            const error = new invalidMethod(
              `Tried to call ${m.path} which is a state`
            )
            this.#log.error(error.toString())
            this.#jsonrpc.respond(id, error, false)
            return
          }
          try {
            method.call(m.args)
            this.#jsonrpc.respond(id, {}, true)
          } catch (err) {
            this.#jsonrpc.respond(
              id,
              new InvalidParamError(
                'InvalidParam',
                'Failed to call method',
                err && typeof err == 'object' ? err.toString() : undefined
              ),
              false
            )
          }
        } else {
          const error = new NotFound(m.path)
          this.#log.error(error.toString())
          this.#jsonrpc.respond(id, error, false)
        }
      }
    )
    this.#jsonrpc.addListener(
      fetchSimpleId,
      (_peer: JsonRPC, _id: string, m: PublishMessage<ValueType>) => {
        this.cache[m.path] = m
        Object.values(this.#fetcher).forEach((fetcher) => {
          if (fetcher.matches(m.path, m.value)) {
            fetcher.emit('data', m)
          }
        })
      }
    )
  }

  isConnected = () => this.#jsonrpc._isOpen

  unfetch = (fetcher: Fetcher) => {
    const [id] = Object.entries(this.#fetcher).find(
      ([, f]) => f === fetcher
    ) || [null, null]
    if (!id) return Promise.reject('Could not find fetcher')
    if (!this.fetchFull()) {
      if (Object.keys(this.#fetcher).length === 2) {
        const param = { id: fetchSimpleId }
        return this.#jsonrpc
          .sendRequest('unfetch', param, this.#sendImmediate)
          .then(() => delete this.#fetcher[id])
          .then(() => Promise.resolve())
      } else {
        delete this.#fetcher[id]
        return Promise.resolve()
      }
    } else {
      return this.#jsonrpc
        .sendRequest('unfetch', { id }, this.#sendImmediate)
        .then(() => {
          delete this.#fetcher[id]
          return Promise.resolve()
        })
    }
  }
  fetchFull = () => this.#daemonInfo.features?.fetch === 'full'

  fetch = (fetcher: Fetcher) => {
    //check if daemon accepts path and value rules for fetching
    // otherwise rules must be applied on peer side
    const fetchFull = this.fetchFull()
    const fetcherId = `f_${nanoid(5)}`
    this.#fetcher[fetcherId] = fetcher

    if (fetchFull) {
      const params = {
        ...fetcher.message,
        id: fetcherId
      }
      this.#jsonrpc.addListener(
        fetcherId,
        (_peer: JsonRPC, _id: string, args: PathParams) => {
          if (fetcherId in this.#fetcher)
            this.#fetcher[fetcherId].emit('data', args)
        }
      )
      return this.#jsonrpc
        .sendRequest('fetch', params, this.#sendImmediate)
        .then(() => Promise.resolve())
    }
    const sub = new Subscription(fetcher.message)
    Object.values(this.cache)
      .filter(
        (entry) => sub.matchesPath(entry.path) && sub.matchesValue(entry.value)
      )
      .forEach((entry) => {
        fetcher.emit('data', entry)
      })
    if (!(fetchSimpleId in this.#fetcher)) {
      //create dummy fetcher
      this.#fetcher[fetchSimpleId] = new Fetcher()
      const params = { id: fetchSimpleId, path: { startsWith: '' } }
      return this.#jsonrpc
        .sendRequest('fetch', params, this.#sendImmediate)
        .then(() => Promise.resolve())
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Actually connect the peer to the Jet Daemon
   * After the connect Promise has been resolved, the peer provides `peer.daemonInfo` object.
   *
   * ```javascript
   * peer.connect().then(function() {
   *   var daemonInfo = peer.daemonInfo
   *   console.log('name', daemonInfo.name) // string
   *   console.log('version', daemonInfo.version) // string
   *   console.log('protocolVersion', daemonInfo.protocolVersion) // number
   *   console.log('can process JSON-RPC batches', daemonInfo.features.batches) // boolean
   *   console.log('supports authentication', daemonInfo.features.authentication) // boolean
   *   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
   * })
   * ```
   *
   * @returns {external:Promise} A Promise which gets resolved once connected to the Daemon, or gets rejected with either:
   * - [jet.ConnectionClosed](#module:errors~ConnectionClosed)
   *
   * @example
   * var peer = new jet.Peer({url: 'ws://jetbus.io:8012'})
   * peer.connect().then(function() {
   *   console.log('connected')
   * }).catch(function(err) {
   *   console.log('connect failed', err)
   * })
   */
  authenticate = (user: string, password: string) => {
    return this.#jsonrpc.sendRequest(
      'authenticate',
      { user, password },
      this.#sendImmediate
    )
  }

  addUser = (user: string, password: string, groups: string[]) => {
    return this.#jsonrpc.sendRequest(
      'addUser',
      { user, password, groups },
      this.#sendImmediate
    )
  }
  connect = (controller: AbortController = new AbortController()) =>
    this.#jsonrpc
      .connect(controller)
      .then(() => this.info())
      .then((daemonInfo) => {
        this.#daemonInfo = daemonInfo || fallbackDaemonInfo
        this.#jsonrpc.config.batches =
          !this.#daemonInfo.features?.batches || true
        return Promise.resolve()
      })

  /**
   * Close the connection to the Daemon. All associated States and Methods are automatically
   * removed by the Daemon.
   *
   * @returns {external:Promise}
   *
   */
  close = () => this.#jsonrpc.close()

  /**
   * Batch operations wrapper. Issue multiple commands to the Daemon
   * in one message batch. Only required for performance critical actions.
   *
   * @param {function} action A function performing multiple peer actions.
   *
   */
  batch = (action: () => void) => {
    if (!this.#daemonInfo.features?.batches)
      throw 'Daemon does not support batches'
    this.#sendImmediate = false
    action()
    this.#sendImmediate = true
    return this.#jsonrpc.send()
  }

  /**
   * Get {State}s and/or {Method}s defined by a Peer.
   *
   * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
   * @returns {external:Promise}
   */
  get = <T extends ValueType>(expression: JsonParams) =>
    this.#jsonrpc.sendRequest<{ path: string; value: T }[]>(
      'get',
      expression,
      this.#sendImmediate
    )

  /**
   * Adds a state or method to the Daemon.
   *
   * @param {(State|Method)} content The content to be added.
   * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
   */
  add = <T extends ValueType>(stateOrMethod: Method | State<T>) => {
    if (isState(stateOrMethod)) {
      stateOrMethod.addListener('change', (newValue: ValueType) => {
        this.#jsonrpc.sendRequest(
          'change',
          {
            path: stateOrMethod._path,
            value: newValue
          },
          this.#sendImmediate
        )
      })
    }
    return this.#jsonrpc
      .sendRequest('add', stateOrMethod.toJson(), this.#sendImmediate)
      .then(() => {
        this.#routes[stateOrMethod._path] =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stateOrMethod as any as State<ValueType>
        return Promise.resolve()
      })
  }

  /**
   * Remove a state or method from the Daemon.
   *
   * @param {State|Method} content The content to be removed.
   * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
   */
  remove = <T extends ValueType>(stateOrMethod: Method | State<T>) =>
    this.#jsonrpc
      .sendRequest(
        'remove',
        { path: stateOrMethod.path() },
        this.#sendImmediate
      )
      .then(() => Promise.resolve())

  /**
   * Call a {Method} defined by another Peer.
   *
   * @param {string} path The unique path of the {Method}.
   * @param {Array} args The arguments provided to the {Method}.
   * @param {object} [options] Options.
   * @param {number} [options.timeout] A timeout for invoking the {Method} after which a timeout error rejects the promise.
   * @returns {external:Promise}
   */
  call = (
    path: string,
    callparams: Array<ValueType> | Record<string, ValueType>
  ): Promise<object> => {
    const params = { path: path } as JsonParams
    if (callparams) params.args = callparams
    return this.#jsonrpc.sendRequest<object>(
      'call',
      params,
      this.#sendImmediate
    )
  }

  /**
   * Info
   * @private
   */
  info = () =>
    this.#jsonrpc.sendRequest<InfoOptions>('info', {}, this.#sendImmediate)

  /**
   * Authenticate
   * @private
   */
  // #authenticate = (user: string, password: string | undefined) =>
  //   this.#jsonrpc.send<AccessType>("authenticate", {
  //     user: user,
  //     password: password,
  //   });
  /**
   * Config
   *
   * @private
   */
  configure = (params: JsonParams) =>
    this.#jsonrpc.sendRequest('config', params, this.#sendImmediate)

  /**
   * Set a {State} to another value.
   *
   * @param {string} path The unique path to the {State}.
   * @param {*} value The desired new value of the {State}.
   * @param {object} [options] Optional settings
   * @param {number} [options.timeout]
   *
   */
  set = (path: string, value: ValueType) =>
    this.#jsonrpc.sendRequest('set', { path, value }, this.#sendImmediate)
}

export default Peer
