import { WebSocket as ws } from "ws";
import * as net from "net";
import MessageSocket from "./message-socket";

const isNodeJs = typeof window === "undefined";
const isBrowser = typeof window !== "undefined";

export const WebSocketImpl = isNodeJs ? ws : WebSocket;

type socketEvents = "open" | "close" | "error" | "message";
export class Socket {
  id: string = "";
  sock?: WebSocket | MessageSocket | ws;
  type = "";
  constructor() {}
  connect = (
    url: string | undefined = undefined,
    ip: string | undefined = undefined,
    port: number | undefined = undefined
  ) => {
    if (isBrowser) {
      this.sock = new WebSocket(
        url || `ws://${window.location.host}:${port || 2315}`,
        "jet"
      );
      this.type = WebSocket.name;
    } else if (isNodeJs && url) {
      this.sock = new ws(url, "jet") as any;
      this.type = ws.name;
    } else {
      this.sock = new MessageSocket(port || 11122, ip);
      this.type = MessageSocket.name;
    }
  };
  addNativeSocket = (sock: WebSocket | MessageSocket | ws) => {
    this.sock = sock;
    this.type = sock.constructor.name;
  };
  close = () => this.sock?.close();

  addEventListener = (event: socketEvents, cb: any) => {
    switch (this.type) {
      case ws.name:
        (this.sock as ws).addEventListener(event as any, cb);
        break;
      // case WebSocket.name:
      case MessageSocket.name:
        (this.sock as WebSocket).addEventListener(event, cb);
        break;
      default:
        console.log("Cant add listeners to closed sockets");
    }
  };
  send = (message: string) => {
    this.sock?.send(message);
  };
}
export const netImpl = net || { Socket: function () {} };
