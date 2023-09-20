import JsonRPC from './index.js'
import { EventEmitter } from '../1_socket/index.js'
import { Socket } from '../1_socket/socket.js'
import { TCPServer, TCPServerConfig } from '../1_socket/tcpserver.js'
import { WebServerConfig, WebsocketServer } from '../1_socket/wsserver.js'
import { Logger } from '../3_jet/log.js'
/**
 * JSONRPCServer instance
 */
export class JsonRPCServer extends EventEmitter {
  config: TCPServerConfig & WebServerConfig
  tcpServer!: TCPServer
  wsServer!: WebsocketServer
  connections: Record<string, JsonRPC> = {}
  log: Logger
  batches: boolean
  constructor(
    log: Logger,
    config: TCPServerConfig & WebServerConfig,
    batches = false
  ) {
    super()
    this.config = config
    this.batches = batches
    this.log = log
  }
  listen = () => {
    if (this.config.tcpPort) {
      this.tcpServer = new TCPServer(this.config)
      this.tcpServer.addListener('connection', (sock: Socket) => {
        const jsonRpc = new JsonRPC(this.log, { batches: this.batches }, sock)
        this.connections[sock.id] = jsonRpc
        this.emit('connection', jsonRpc)
      })
      this.tcpServer.addListener('disconnect', (sock: Socket) => {
        this.emit('disconnect', this.connections[sock.id])
        delete this.connections[sock.id]
      })
      this.tcpServer.listen()
    }
    if (this.config.wsPort || this.config.server) {
      this.wsServer = new WebsocketServer(this.config)
      this.wsServer.addListener('connection', (sock: Socket) => {
        const jsonRpc = new JsonRPC(this.log, { batches: this.batches }, sock)
        this.connections[sock.id] = jsonRpc
        this.emit('connection', jsonRpc)
      })
      this.wsServer.addListener('disconnect', (sock: Socket) => {
        this.emit('disconnect', this.connections[sock.id])
        delete this.connections[sock.id]
      })
      this.wsServer.listen()
    }
  }
  close = () => {
    if (this.tcpServer) {
      this.tcpServer.close()
    }
    if (this.wsServer) {
      this.wsServer.close()
    }
  }
}
