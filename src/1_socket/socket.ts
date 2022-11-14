/* istanbul ignore file */
import { WebSocket as ws } from 'ws'
import MessageSocket from './message-socket'
import { isBrowser, isNodeJs, socketEvents } from '.'

export class Socket {
  id: string = ''
  sock?: WebSocket | MessageSocket | ws
  type = ''
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
      this.sock = new ws(url, 'jet') as any
      this.type = 'ws'
    } else {
      this.sock = new MessageSocket(port || 11122, ip)
      this.type = 'ms'
    }
  }
  addNativeSocket = (sock: WebSocket | MessageSocket | ws) => {
    this.sock = sock
    this.type = sock.constructor.name === 'MessageSocket' ? 'ms' : 'ws'
  }
  close = () => this.sock?.close()

  addEventListener = (event: socketEvents, cb: any) => {
    if ((this.type === 'ws' && isBrowser) || this.type === 'ms') {
      ;(this.sock as WebSocket).addEventListener(event, cb)
    } else if (this.type === 'ws' && isNodeJs) {
      ;(this.sock as ws).addEventListener(event as any, cb)
    } else {
      console.log('Could not detect socket type')
    }
  }
  send = (message: string) => {
    this.sock?.send(message)
  }
}
