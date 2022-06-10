import EventEmitter from "events";
import * as net from "net";

/**
 * MessageSocket constructor function.
 * @private
 */
export class MessageSocket extends EventEmitter.EventEmitter {
  last = Buffer.alloc(0);
  len = -1;
  socket;
  constructor(port, ip = undefined) {
    super();
    if (port instanceof net.Socket) {
      this.socket = port;
    } else {
      this.socket = net.connect(port, ip);
      this.socket.on("connect", () => {
        this.emit("open");
      });
    }

    this.socket.on("data", (buf) => {
      let bigBuf = Buffer.concat([this.last, buf]);
      while (true) {
        // eslint-disable-line no-constant-condition
        if (this.len < 0) {
          if (bigBuf.length < 4) {
            this.last = bigBuf;
            return;
          } else {
            this.len = bigBuf.readUInt32BE(0);
            bigBuf = bigBuf.slice(4);
          }
        }
        if (this.len > 0) {
          if (bigBuf.length < this.len) {
            this.last = bigBuf;
            return;
          } else {
            console.log(
              "MSGSocket",
              "Received data",
              bigBuf.toString(undefined, 0, this.len)
            );
            this.emit("message", bigBuf.toString(undefined, 0, this.len));
            bigBuf = bigBuf.slice(this.len);
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

    this.socket.once("error", (e) => {
      this.emit("error", e);
    });
  }
  /**
   * Send.
   * @private
   */
  send = (msg) => {
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
  addEventListener = (method, listener) => {
    const target = this;

    function onMessage(data, flags) {
      listener.call(
        target,
        new MessageEvent(
          data,
          flags && flags.binary ? "Binary" : "Text",
          target
        )
      );
    }

    function onClose(code, message) {
      listener.call(target, new CloseEvent(code, message, target));
    }

    function onError(event) {
      event.target = target;
      listener.call(target, event);
    }

    function onOpen() {
      listener.call(target, new OpenEvent(target));
    }

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
  data;
  type;
  target;
  constructor(dataArg, typeArg, target) {
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
function CloseEvent(code, reason, target) {
  // @ts-ignore
  this.wasClean = typeof code === "undefined" || code === 1000;
  // @ts-ignore
  this.code = code;
  // @ts-ignore
  this.reason = reason;
  // @ts-ignore
  this.target = target;
}

/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function OpenEvent(target) {
  // @ts-ignore
  this.target = target;
}

export default MessageSocket;
