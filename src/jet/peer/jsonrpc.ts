"use strict";

import { ConnectionClosed, createTypedError } from "../errors";
import { PeerConfig } from "../peer";
import { errorObject, isDefined as isDef } from "../utils";

const MessageSocket =
  typeof window === "undefined" && require("../message-socket").MessageSocket;
const WebSocket =
  global.WebSocket ||
  (typeof window !== "undefined" && window.WebSocket) ||
  require("ws"); // eslint-disable-line no-use-before-define

/**
 * Helper shorthands.
 */
const encode = JSON.stringify;
const decode = JSON.parse;

/**
 * Adds a function ("hook") to callbacks[callbackName]
 *
 * "hook" is executed before the original
 * callbacks[callbackName] function if defined,
 * or installs "hook" as callbacks[callbackName].
 * @private
 */
export const addHook = (callbacks, callbackName, hook) => {
  if (callbacks[callbackName]) {
    const orig = callbacks[callbackName];
    callbacks[callbackName] = (result) => {
      hook(result);
      orig(result);
    };
  } else {
    callbacks[callbackName] = hook;
  }
};

/**
 * JsonRPC constructor.
 * @private
 */
export class JsonRPC {
  _isOpen = false;
  sock: WebSocket | any;
  config: PeerConfig;
  messages: Array<Object>;
  willFlush: Boolean;
  requestDispatchers: Object;
  responseDispatchers: Object;
  id: number;
  constructor(config) {
    this.config = config;
    this.messages = [];
    this.willFlush = false;
    this.requestDispatchers = {};
    this.responseDispatchers = {};
    this.id = 0;
  }
  _onOpen = () => {
    this._isOpen = true;
  };

  _onClose = () => {
    const err = new ConnectionClosed("");
    for (const id in this.responseDispatchers) {
      const callbacks = this.responseDispatchers[id];
      /* istanbul ignore else */
      if (callbacks.error) {
        callbacks.error(err);
      }
    }
    this._isOpen = false;
    this.responseDispatchers = {};
  };

  connect = (): Promise<void> => {
    const config = this.config;
    const url =
      config.url ||
      (typeof window !== "undefined" &&
        `ws://${window.location.host}:${config.port || 2315}`);
    return new Promise((resolve, reject) => {
      this.sock = url
        ? new WebSocket(url, "jet")
        : new MessageSocket(config.port || 11122, config.ip);
      this.sock.addEventListener("error", () => {}); // swallow errors, closed event is emitted too
      this.sock.addEventListener("message", this._dispatchMessage);
      this.sock.addEventListener("open", () => {
        this._onOpen();
        return resolve();
      });
      this.sock.addEventListener("close", () => {
        if (this._isOpen) {
          this._isOpen = false;
          this._onClose();
          return resolve();
        } else {
          const err = new ConnectionClosed("");
          return reject(err);
        }
      });
    });
  };

  /**
   * Close.
   */
  close = () => {
    if (this._isOpen) {
      this.flush();
      this.sock.close();
    }
  };

  /**
   * _dispatchMessage
   *
   * @api private
   */
  _dispatchMessage = (event) => {
    const message = event.data;
    let decoded;
    try {
      decoded = decode(message);
    } catch (err) {
      /* istanbul ignore else */
      if (this.config.onReceive) {
        this.config.onReceive(message, null);
      }
      throw err;
    }

    this.willFlush = true;
    /* istanbul ignore else */
    if ((this.config as any).onReceive) {
      (this.config as any).onReceive(message, decoded);
    }
    if (Array.isArray(decoded)) {
      decoded.forEach((singleMessage) => {
        this._dispatchSingleMessage(singleMessage);
      });
    } else {
      this._dispatchSingleMessage(decoded);
    }
    this.flush();
  };

  /**
   * _dispatchSingleMessage
   *
   * @api private
   */
  _dispatchSingleMessage = (message) => {
    if (message.method && message.params) {
      this._dispatchRequest(message);
    } else if (
      typeof message.result !== "undefined" ||
      typeof message.error !== "undefined"
    ) {
      this._dispatchResponse(message);
    }
  };

  /**
   * _dispatchResponse
   *
   * @api private
   */
  _dispatchResponse = (message) => {
    const mid = message.id;
    const callbacks = this.responseDispatchers[mid];
    delete this.responseDispatchers[mid];
    /* istanbul ignore else */
    if (callbacks) {
      /* istanbul ignore else */
      if (typeof message.result !== "undefined" && callbacks.success) {
        callbacks.success(message.result);
      } else if (isDef(message.error) && callbacks.error) {
        const err = createTypedError(message.error);
        callbacks.error(err || message.error);
      }
    }
  };

  /**
   * _dispatchRequest.
   * Handles both method calls and fetchers (notifications)
   *
   * @api private
   */
  _dispatchRequest = (message) => {
    const dispatcher = this.requestDispatchers[message.method];

    try {
      dispatcher(message);
    } catch (err) {
      /* istanbul ignore if */
      if (isDef(message.id)) {
        this.queue({
          id: message.id,
          error: errorObject(err),
        });
      }
    }
  };

  /**
   * Queue.
   */
  queue = (message) => {
    this.messages.push(message);
  };

  /**
   * Flush.
   */
  flush = () => {
    let encoded;
    if (this.messages.length === 1) {
      encoded = encode(this.messages[0]);
    } else if (this.messages.length > 1) {
      encoded = encode(this.messages);
    }
    if (encoded) {
      /* istanbul ignore else */
      if (this.config.onSend) {
        this.config.onSend(encoded, this.messages);
      }
      this.sock.send(encoded);
      this.messages.length = 0;
    }
    this.willFlush = false;
  };

  /**
   * AddRequestDispatcher.
   */
  addRequestDispatcher = (id, dispatch) => {
    this.requestDispatchers[id] = dispatch;
  };

  /**
   * RemoveRequestDispatcher.
   */
  removeRequestDispatcher = (id) => {
    delete this.requestDispatchers[id];
  };

  /**
   * HasRequestDispatcher.
   */
  hasRequestDispatcher = (id) => {
    return isDef(this.requestDispatchers[id]);
  };

  /**
   * Service.
   */
  service = (
    method,
    params,
    complete:
      | ((completed: boolean, result?: Object) => void)
      | undefined = undefined,
    asNotification = true
  ): Promise<Object | null> => {
    return new Promise((resolve, reject) => {
      if (!this._isOpen) {
        reject(new ConnectionClosed(""));
      } else {
        let rpcId;
        // Only make a Request, if callbacks are specified.
        // Make complete call in case of success.
        // If no id is specified in the message, no Response
        // is expected, aka Notification.
        if (!asNotification) {
          rpcId = this.id;
          this.id = this.id + 1;
          const callbacks = {
            success: resolve,
            error: reject,
          };
          /* istanbul ignore else */
          if (complete) {
            addHook(callbacks, "success", (result) => {
              complete(true, result);
            });
            addHook(callbacks, "error", () => {
              complete(false);
            });
          }
          this.responseDispatchers[rpcId] = callbacks;
        } else {
          // There will be no response, so call complete either way
          // and hope everything is ok
          if (complete) {
            complete(true);
          }
        }
        const message = {
          id: rpcId,
          method: method,
          params: params,
        };
        if (this.willFlush) {
          this.queue(message);
        } else {
          const encoded = encode(message);
          if (this.config.onSend) {
            this.config.onSend(encoded, [message]);
          }
          this.sock.send(encode(message));
        }
        if (asNotification) {
          resolve(null);
        }
      }
    });
  };

  /**
   * Batch.
   */
  batch = (action) => {
    this.willFlush = true;
    action();
    this.flush();
  };
}

export default JsonRPC;
