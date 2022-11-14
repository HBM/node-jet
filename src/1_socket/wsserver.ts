/* istanbul ignore file */
import { EventEmitter, WebSocketImpl } from ".";
import { WebSocket, WebSocketServer as WsServer } from "ws";
import { Server as HTTPServer } from "http";
import { Socket } from "./socket";

export interface WebServerConfig {
  url?: string;
  wsPort?: number;
  server?: HTTPServer;
  wsGetAuthentication?: any;
  wsPingInterval?: number;
}

export class WebsocketServer extends EventEmitter {
  config: WebServerConfig;
  wsServer!: WsServer;
  connectionId = 1;
  constructor(config: WebServerConfig) {
    super();
    this.config = config;
  }
  listen = () => {
    // this.log(
    //   "Starting Websocket Server",
    //   listenOptions.wsPort || listenOptions.server?.address()
    // );
    this.wsServer = new WsServer({
      port: this.config.wsPort,
      server: this.config.server,
      verifyClient: this.config.wsGetAuthentication
        ? (info: { req: any }) => {
            const auth = this.config.wsGetAuthentication(info);
            if (typeof auth === "object") {
              info.req._jetAuth = auth;
              return true;
            }
            return false;
          }
        : undefined,
      handleProtocols: (protocols: Set<string>) => {
        if (protocols.has("jet")) {
          return "jet";
        } else {
          return false;
        }
      },
    });
    this.wsServer.on("connection", (ws: WebSocket, _req: any) => {
      const sock = new Socket();
      sock.addNativeSocket(ws);
      sock.id = `ws_${this.connectionId}`;
      this.connectionId++;
      const pingMs = this.config.wsPingInterval || 5000;
      let pingInterval: NodeJS.Timeout;
      if (pingMs) {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocketImpl.OPEN) {
            ws.ping();
          }
        }, pingMs);
      }
      ws.addListener("close", () => {
        clearInterval(pingInterval);
        this.emit("disconnect", sock);
      });
      ws.addListener("disconnect", () => {
        this.emit("disconnect", sock);
      });

      this.emit("connection", sock);
    });
  };
  close = () => {
    this.wsServer.close();
  };
}
