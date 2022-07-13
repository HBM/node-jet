"use strict";

import {
  isErrorMessage,
  isResultMessage,
  isServiceMessage,
  Message,
  ServiceMessage,
} from "../daemon/access";
import { ConnectionClosed, createTypedError } from "../errors";
import { JsonParams, PeerConfig } from "../peer";
import { errorObject, isDefined as isDef } from "../utils";
import { WebSocketImpl } from "../environment";
import { MessageSocket } from "../message-socket";
import { ValueType } from "../element";
import EventEmitter from "events";
/**
 * Helper shorthands.
 */
const encode = JSON.stringify;
const decode = JSON.parse;

export type resultCallback =
  | ((_success: boolean, _result?: any) => void)
  | undefined;
/**
 * Adds a function ("hook") to callbacks[callbackName]
 *
 * "hook" is executed before the original
 * callbacks[callbackName] function if defined,
 * or installs "hook" as callbacks[callbackName].
 * @private
 */
export const addHook = (
  callbacks: {
    [x: string]: any;
    success?: (value: ValueType) => void;
    error?: (reason?: string) => void;
  },
  callbackName: string,
  hook: Function
) => {
  if (callbacks[callbackName]) {
    const orig = callbacks[callbackName];
    callbacks[callbackName] = (result: any) => {
      hook(result);
      orig(result);
    };
  } else {
    callbacks[callbackName] = hook;
  }
};

type MessageCallback = (asString: string, decoded: object) => void;
interface JsonRpcConfig {
  onSend?: MessageCallback;
  onReceive?: MessageCallback;
  url?: string;
  port?: number;
  ip?: string;
}
/**
 * JsonRPC constructor.
 * @private
 */
export class JsonRPC extends EventEmitter.EventEmitter {
  sock!: WebSocket | MessageSocket;
  config: JsonRpcConfig;
  messages: Array<Message> = [];
  willFlush = false;
  fakeContext: any;
  messageId = 1;
  _isOpen = false;
  constructor();
  constructor(config?: JsonRpcConfig);
  constructor(config?: JsonRpcConfig, sock?: WebSocket | MessageSocket) {
    super();
    this.config = config || {};
    if (sock) {
      this.sock = sock;
      this._isOpen = true;
    }
  }

  connect = (): Promise<void> => {
    const config = this.config;
    const url =
      config.url ||
      (typeof window !== "undefined" &&
        `ws://${window.location.host}:${config.port || 2315}`);
    return new Promise((resolve, reject) => {
      this.sock = url
        ? (new WebSocketImpl(url, "jet") as any)
        : new MessageSocket(config.port || 11122, config.ip);
      this.sock.addEventListener("error", this._handleError);
      this.sock.addEventListener("message", this._handleMessage);
      this.sock.addEventListener("open", () => {
        this._isOpen = true;
        return resolve();
      });
      this.sock.addEventListener("close", () => {
        if (this._isOpen) {
          this._isOpen = false;
          this.flush();
          this.sock.close();
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
  //   close = () => {
  //     if (this._isOpen) {
  //       this.flush();
  //       this.sock.close();
  //     }
  //   };

  _handleError = () => {
    console.log("Error in connection");
  };
  /**
   * _dispatchMessage
   *
   * @api private
   */
  _handleMessage = (event: { data: any }) => {
    const message = event.data;
    try {
      const decoded = decode(message);
      this.willFlush = true;
      if (this.config.onReceive) {
        this.config.onReceive(message, decoded);
      }
      if (Array.isArray(decoded)) {
        decoded.forEach((singleMessage) => {
          this._dispatchSingleMessage(singleMessage);
        });
      } else {
        this._dispatchSingleMessage(decoded);
      }
      this.flush();
    } catch (err) {
      if (this.config.onReceive) {
        this.config.onReceive(message, err as any);
      }
      throw err;
    }
  };

  /**
   * _dispatchSingleMessage
   *
   * @api private
   */
  _dispatchSingleMessage = (message: Message) => {
    if (isServiceMessage(message)) {
      this._dispatchRequest(message);
    } else if (isResultMessage(message) || isErrorMessage(message)) {
      this._dispatchResponse(message);
    }
  };

  /**
   * _dispatchResponse
   *
   * @api private
   */
  _dispatchResponse = (message: Message) => {
    const mid = message.id;
    if (isResultMessage(message)) {
      this.emit("sucess", mid, message.result);
    }
    if (isErrorMessage(message)) {
      const err = createTypedError(message.error);
      this.emit("error", mid, err || message.error);
    }
  };

  /**
   * _dispatchRequest.
   * Handles both method calls and fetchers (notifications)
   *
   * @api private
   */
  _dispatchRequest = (message: ServiceMessage) => {
    try {
      this.emit(message.method, message);
    } catch (err) {
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
  queue = <T extends Message>(message: T) => {
    this.messages.push(message);
  };

  /**
   * Flush.
   */
  flush = () => {
    const encoded = encode(
      this.messages.length === 1 ? this.messages[0] : this.messages
    );
    if (encoded) {
      if (this.config.onSend) {
        this.config.onSend(encoded, this.messages);
      }
      this.sock.send(encoded);
      this.messages = [];
    }
    this.willFlush = false;
  };

  /**
   * Service.
   */
  send = <T extends object>(
    method: string,
    params: JsonParams
  ): Promise<T | null> => {
    return new Promise((resolve, reject) => {
      if (!this._isOpen) {
        reject(new ConnectionClosed(""));
      } else {
        const rpcId = this.messageId;
        const success = (id: number, result: T) => {
          if (id === rpcId) {
            resolve(result);
            this.removeListener("success", success);
          }
          const errorCb = (id: number, error: any) => {
            if (id === rpcId) {
              reject(error);
            }
            this.removeListener("success", errorCb);
          };
          this.addListener("success", success);
          this.addListener("error", errorCb);
          this.messageId++;
          const message: ServiceMessage = {
            id: rpcId.toString(),
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
        };
      }
    });
  };

  /**
   * Batch.
   */
  batch = (action: () => void) => {
    this.willFlush = true;
    action();
    this.flush();
  };
}

export default JsonRPC;
