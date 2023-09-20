/* istanbul ignore file */
import { WebSocket as ws } from 'ws'
import MessageSocket from './message-socket.js'
import { isBrowser, isNodeJs } from './index.js'

/** Socket instance.
 * @class
 * @classdesc Class used as Interface to communicate between the native socket connection and the json rpc layer.
 */
export class Socket {
  id = ''
  sock?: WebSocket | MessageSocket | ws
  type = ''

  constructor(socket?: WebSocket | MessageSocket | ws) {
    if (socket) {
      this.sock = socket
      this.type = socket.constructor.name === 'MessageSocket' ? 'ms' : 'ws'
    }
  }
  /**
   * Method to connect to Server
   * @param url url to connect to
   * @param ip Ip address to connect to only valid in combination with port
   * @param port Port used to connect
   */
  connect = (
    url: string | undefined = undefined,
    ip: string | undefined = undefined,
    port: number | undefined = undefined
  ) => {
    if (isBrowser) {
      this.sock = new WebSocket(
        url || `ws://${window.location.host}:${port || 2315}`,
        'jet'
      )
      this.type = 'ws'
    } else if (isNodeJs && url) {
      this.sock = new ws(url, 'jet')
      this.type = 'ws'
    } else {
      this.sock = new MessageSocket(port || 11122, ip)
      this.type = 'ms'
    }
  }

  /**
   * Closes the native socket connection
   */
  close = () => {
    if (this.sock) this.sock.close()
  }

  /**
   * Listening to socket events to socket events
   * @param event  "close": CloseEvent;"error": Event;"message": MessageEvent;"open": Event;
   * @param cb callback that is invoked when event is triggered
   * @emits CloseEvent in case of closing of the native socket
   * @emits Event in case of established socket connection
   * @emits MessageEvent in case of received message
   * @emits Event in case of error
   */
  addEventListener = <K extends keyof WebSocketEventMap>(
    event: K,
    cb: (this: WebSocket, ev: WebSocketEventMap[K]) => void
  ) => {
    if ((this.type === 'ws' && isBrowser) || this.type === 'ms') {
      ;(this.sock as WebSocket).addEventListener(event, cb)
    } else if (this.type === 'ws' && isNodeJs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.sock as ws).addEventListener(event as any, cb as any)
    } else {
      throw Error('Could not detect socket type')
    }
  }
  /**
   * sending a message via the native socket
   * @param message //string that represents the message to send
   */
  send = (message: string) => {
    this.sock?.send(message)
  }
}
