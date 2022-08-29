/* istanbul ignore file */
import EventEmitter from "events";
import { Server, createServer } from "net";
import MessageSocket from "./message-socket";
import { Socket } from "./socket";

export interface TCPServerConfig {
  tcpPort?: number;
}
export class TCPServer extends EventEmitter {
  config: TCPServerConfig;
  tcpServer!: Server;
  connectionId: number = 1;
  constructor(config: TCPServerConfig) {
    super();
    this.config = config;
  }
  listen = () => {
    this.tcpServer = createServer((peerSocket: any) => {
      //   this.log("TCP Peer connected", peerSocket.address());
      const sock = new Socket();
      sock.addNativeSocket(new MessageSocket(peerSocket));
      sock.id = `ws_${this.connectionId}`;
      this.connectionId++;
      peerSocket.addListener("close", () => {
        this.emit("disconnect", sock);
      });
      this.emit("connection", sock);
    });
    this.tcpServer.listen(this.config.tcpPort);
  };
  close = () => {
    this.tcpServer.close();
  };
}
