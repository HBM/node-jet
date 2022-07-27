import EventEmitter from "events";
import JsonRPC from ".";
import { Socket } from "../1_socket";
import {
  TCPServer,
  TCPServerConfig,
  WebServerConfig,
  WebsocketServer,
} from "../1_socket/server";
import { Logger } from "../3_jet/log";

export class JsonRPCServer extends EventEmitter.EventEmitter {
  config: TCPServerConfig & WebServerConfig;
  tcpServer!: TCPServer;
  wsServer!: WebsocketServer;
  connections: Record<string, JsonRPC> = {};
  log: Logger;
  constructor(log:Logger,config: TCPServerConfig & WebServerConfig) {
    super();
    this.config = config;
    this.log= log
  }
  listen = () => {
    if (this.config.tcpPort) {
      this.tcpServer = new TCPServer(this.config);
      this.tcpServer.addListener("connection", (sock: Socket) => {
        const jsonRpc = new JsonRPC(this.log,{}, sock);
        this.connections[sock.id] = jsonRpc;
        this.emit("connection", jsonRpc);
      });
      this.tcpServer.addListener("disconnect", (sock: Socket) => {
        this.emit("disconnect", this.connections[sock.id]);
        delete this.connections[sock.id];
      });
      this.tcpServer.listen();
    }
    if (this.config.wsPort || this.config.server) {
      this.wsServer = new WebsocketServer(this.config);
      this.wsServer.addListener("connection", (sock: Socket) => {
        const jsonRpc = new JsonRPC(this.log,{}, sock);
        this.emit("connection", jsonRpc);
      });
      this.wsServer.addListener("disconnect", (sock: Socket) => {
        this.emit("disconnect", this.connections[sock.id]);
        delete this.connections[sock.id];
      });
      this.wsServer.listen();
    }
  };
  close = ()=>{
    if(this.tcpServer){
      this.tcpServer.close()
    }
    if(this.wsServer){
      this.wsServer.close()
    }
  }
}
