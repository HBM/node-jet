/* istanbul ignore file */
import { Server, createServer } from 'net'
import { EventEmitter } from '.'
import MessageSocket from './message-socket'
import { Socket } from './socket'
import { Socket as natSocket } from 'net'

export interface TCPServerConfig {
  tcpPort?: number
}
/**
 * Class implementation of a TCP server. This implementation only runs in a node.js environment
 */
export class TCPServer extends EventEmitter {
  config: TCPServerConfig
  tcpServer!: Server
  connectionId = 1
  /**
   * Constructor to create a TCP Server instance
   */
  constructor(config: TCPServerConfig) {
    super()
    this.config = config
  }
  /**
   * This function starts a TCP server listening on the port specified in the config
   */
  listen() {
    this.tcpServer = createServer((peerSocket: natSocket) => {
      const sock = new Socket(new MessageSocket(peerSocket))
      sock.id = `ws_${this.connectionId}`
      this.connectionId++
      peerSocket.addListener('close', () => {
        this.emit('disconnect', sock)
      })
      this.emit('connection', sock)
    })
    this.tcpServer.listen(this.config.tcpPort)
  }
  /**
   * Function to stop the TCP server
   */
  close() {
    this.tcpServer.close()
  }
}
