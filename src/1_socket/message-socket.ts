/* istanbul ignore file */
import EventEmitter from "events";
import { Socket, connect } from "net";

export class MessageSocket extends EventEmitter {
  last = Buffer.alloc(0);
  len = -1;
  socket: Socket;
  constructor(port: number | Socket, ip: string = "") {
    super();
    if (port instanceof Socket) {
      this.socket = port;
    } else {
      this.socket = connect(port as number, ip);
      this.socket.on("connect", () => {
        this.emit("open");
      });
    }

    this.socket.on("data", (buf: Uint8Array) => {
      let bigBuf = Buffer.concat([this.last, buf]);
      while (true) {
        // eslint-disable-line no-constant-condition
        if (this.len < 0) {
          if (bigBuf.length < 4) {
            this.last = bigBuf;
            return;
          } else {
            this.len = bigBuf.readUInt32BE(0);
            bigBuf = bigBuf.subarray(4);
          }
        }
        if (this.len > 0) {
          if (bigBuf.length < this.len) {
            this.last = bigBuf;
            return;
          } else {
            this.emit("message", bigBuf.toString(undefined, 0, this.len));
            bigBuf = bigBuf.subarray(this.len);
            this.len = -1;
          }
        }
      }
    });

    this.socket.setNoDelay(true);
    this.socket.setKeepAlive(true);

    this.socket.once("close", () => {
      this.emit("close");
    });

    this.socket.once("error", (e: Error) => {
      this.emit("error", e);
    });
  }
  /**
   * Send.
   * @private
   */
  send = (msg: string) => {
    const utf8Length = Buffer.byteLength(msg, "utf8");
    const buf = Buffer.alloc(4 + utf8Length);
    buf.writeUInt32BE(utf8Length, 0);
    buf.write(msg, 4);
    process.nextTick(() => {
      this.socket.write(buf);
      this.emit("sent", msg);
    });
  };
  /**
   * Close.
   * @private
   */
  close = () => {
    this.socket.end();
  };
  /**
   * addEventListener method needed for MessageSocket to be used in the browser.
   * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
   *
   * npm module 'ws' also comes with this method.
   * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
   * That way we can use node-jet with via browserify inside the browser.
   */
  addEventListener = (
    method: string | symbol,
    listener: { (...args: any[]): void; call?: any }
  ) => {
    const onMessage = (data: any, flags: { binary: any }) => {
      listener.call(
        this,
        new MessageEvent(data, flags && flags.binary ? "Binary" : "Text", this)
      );
    };

    const onClose = (code: number, message: any) => {
      listener.call(this, new CloseEvent(code, message, this));
    };

    const onError = (event: any) => {
      event.target = this;
      listener.call(this, event);
    };

    const onOpen = () => {
      listener.call(this, new OpenEvent(this));
    };

    if (typeof listener === "function") {
      if (method === "message") {
        // store a reference so we can return the original function from the
        // addEventListener hook
        onMessage._listener = listener;
        this.on(method, onMessage);
      } else if (method === "close") {
        // store a reference so we can return the original function from the
        // addEventListener hook
        onClose._listener = listener;
        this.on(method, onClose);
      } else if (method === "error") {
        // store a reference so we can return the original function from the
        // addEventListener hook
        onError._listener = listener;
        this.on(method, onError);
      } else if (method === "open") {
        // store a reference so we can return the original function from the
        // addEventListener hook
        onOpen._listener = listener;
        this.on(method, onOpen);
      } else {
        this.on(method, listener);
      }
    }
  };
}

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
class MessageEvent {
  data: any;
  type: any;
  target: any;
  constructor(dataArg: any, typeArg: string, target: any) {
    this.data = dataArg;
    this.type = typeArg;
    this.target = target;
  }
}

/**
 * W3C CloseEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
class CloseEvent {
  wasClean: boolean;
  code: number;
  reason: string;
  target: any;
  constructor(code: number, reason: string, target: any) {
    this.wasClean = typeof code === "undefined" || code === 1000;
    this.code = code;
    this.reason = reason;
    this.target = target;
  }
}

/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
class OpenEvent {
  target: any;
  constructor(target: any) {
    this.target = target;
  }
}

export default MessageSocket;
