/* istanbul ignore file */
import { EventEmitter, WebSocketImpl } from '.'
import { WebSocket, WebSocketServer as WsServer } from 'ws'
import { Server as HTTPServer } from 'http'
import { Socket } from './socket'

export interface WebServerConfig {
  url?: string
  wsPort?: number
  server?: HTTPServer
  wsPingInterval?: number
}

/**
 * Class implementation of a WS server. This implementation only runs in a node.js environment
 */
export class WebsocketServer extends EventEmitter {
  config: WebServerConfig
  wsServer!: WsServer
  connectionId = 1
  constructor(config: WebServerConfig) {
    super()
    this.config = config
  }
  /**
   * method to start listening on incoming websocket connections. Incoming websocket connections are validated if they accept jet protocol
   */
  listen() {
    this.wsServer = new WsServer({
      port: this.config.wsPort,
      server: this.config.server,
      handleProtocols: (protocols: Set<string>) => {
        if (protocols.has('jet')) {
          return 'jet'
        } else {
          return false
        }
      }
    })
    this.wsServer.on('connection', (ws: WebSocket) => {
      const sock = new Socket(ws)
      sock.id = `ws_${this.connectionId}`
      this.connectionId++
      const pingMs = this.config.wsPingInterval || 5000
      let pingInterval: NodeJS.Timeout
      if (pingMs) {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocketImpl.OPEN) {
            ws.ping()
          }
        }, pingMs)
      }
      ws.addListener('close', () => {
        clearInterval(pingInterval)
        this.emit('disconnect', sock)
      })
      ws.addListener('disconnect', () => {
        this.emit('disconnect', sock)
      })

      this.emit('connection', sock)
    })
  }
  /** Method to stop Websocket server */
  close() {
    this.wsServer.close()
  }
}
