"use strict";

import { ConnectionClosed, createTypedError } from "../3_jet/errors";
import { JsonParams } from "../3_jet/peer";
import { errorObject, isDefined as isDef } from "../3_jet/utils";
import { Socket } from "../1_socket";
import EventEmitter from "events";
import {
  castMessage,
  ErrorMessage,
  Message,
  MethodRequest,
  ResultMessage,
} from "../3_jet/messages";
import { logger, Logger } from "../3_jet/log";
/**
 * Helper shorthands.
 */
const encode = JSON.stringify;
const decode = JSON.parse;

export type resultCallback =
  | ((_success: boolean, _result?: any) => void)
  | undefined;

type MessageCallback = (asString: string, decoded: object) => void;

const isResultMessage = (msg: Message): msg is ResultMessage => {
  return "result" in msg;
};
const isErrorMessage = (msg: Message): msg is ErrorMessage => {
  return "error" in msg;
};
export interface JsonRpcConfig {
  onSend?: MessageCallback;
  onReceive?: MessageCallback;
  url?: string;
  port?: number;
  ip?: string;
  log?: logger;
}
/**
 * JsonRPC constructor.
 * @private
 */
export class JsonRPC extends EventEmitter.EventEmitter {
  sock!: Socket;
  config: JsonRpcConfig;
  messages: Array<Message> = [];
  willFlush = false;
  fakeContext: any;
  messageId = 1;
  _isOpen = false;
  resolveDisconnect!: (value: void | PromiseLike<void>) => void;
  rejectDisconnect!: (reason?: any) => void;
  disconnectPromise!: Promise<void>;
  resolveConnect!: (value: void | PromiseLike<void>) => void;
  rejectConnect!: (reason?: any) => void;
  connectPromise!: Promise<void>;
  logger: Logger;
  constructor(config?: JsonRpcConfig, sock?: Socket) {
    super();
    this.config = config || {};
    this.logger = new Logger(this.config.log);
    this.createDisonnectPromise();
    this.createConnectPromise();
    if (sock) {
      this.sock = sock;
      this._isOpen = true;
      this.subscribeToSocketEvents();
    }
  }

  createDisonnectPromise = () => {
    this.disconnectPromise = new Promise<void>((resolve, reject) => {
      this.resolveDisconnect = resolve;
      this.rejectDisconnect = reject;
    });
  };
  createConnectPromise = () => {
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.resolveConnect = resolve;
      this.rejectConnect = reject;
    });
  };
  subscribeToSocketEvents = () => {
    this.sock.addEventListener("error", this._handleError);
    this.sock.addEventListener("message", this._handleMessage);
    this.sock.addEventListener("open", () => {
      this._isOpen = true;
      this.resolveConnect();
      this.createDisonnectPromise();
    });
    this.sock.addEventListener("close", () => {
      this._isOpen = false;
      this.resolveDisconnect();
      this.createConnectPromise();
      // this.rejectConnect("Socket closed");
    });
  };

  connect = (): Promise<void> => {
    if (this._isOpen) {
      return Promise.reject("Already open");
    }
    const config = this.config;
    this.sock = new Socket();
    this.sock.connect(config.url, config.ip, config.port || 11122);
    this.subscribeToSocketEvents();
    return this.connectPromise;
  };

  /**
   * Close.
   */
  close = (): Promise<void> => {
    if (this._isOpen) {
      this.flush();
      this.sock.close();
      return this.disconnectPromise;
    }
    return Promise.reject("Not open");
  };

  _handleError = (err: any) => {
    console.log("Error in connection", err);
  };
  /**
   * _dispatchMessage
   *
   * @api private
   */
  _handleMessage = (event: { data: any }) => {
    const message = event.data;
    this.logger.sock(`Received message:${message}`);
    try {
      const decoded = decode(message);

      if (Array.isArray(decoded)) {
        this.willFlush = true;
        decoded.forEach((singleMessage) => {
          this._dispatchSingleMessage(singleMessage);
        });
        this.flush();
      } else {
        this.willFlush = false;
        this._dispatchSingleMessage(decoded);
      }
    } catch (err) {
      throw err;
    }
  };

  /**
   * _dispatchSingleMessage
   *
   * @api private
   */
  _dispatchSingleMessage = (message: Message) => {
    if (isResultMessage(message) || isErrorMessage(message)) {
      this._dispatchResponse(message);
    } else {
      this._dispatchRequest(castMessage<MethodRequest>(message));
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
      this.emit("success", mid, message.result as any);
    }
    if (isErrorMessage(message)) {
      const err =
        typeof message.error === "string"
          ? message.error
          : createTypedError(message.error);
      this.emit("error", mid, err);
    }
  };

  /**
   * _dispatchRequest.
   * Handles both method calls and fetchers (notifications)
   *
   * @api private
   */
  _dispatchRequest = (message: MethodRequest) => {
    try {
      this.emit("message", message.method, message);
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
    if (this.messages.length > 0) {
      const encoded = encode(
        this.messages.length === 1 ? this.messages[0] : this.messages
      );
      if (encoded) {
        if (this.config.onSend) {
          // this.config.onSend(encoded, this.messages);
        }
        this.logger.sock(`Sending message ${encoded}`);
        this.sock.send(encoded);
        this.messages = [];
      }
    }
    this.willFlush = false;
  };

  respond = (id: string, params: object, success: boolean) => {
    if (success) {
      this.sock.send(encode({ id: id.toString(), result: params }));
    } else {
      this.sock.send(encode({ id: id.toString(), error: params }));
    }
  };
  /**
   * Service.
   */
  send = <T extends object>(
    method: string,
    params: JsonParams,
    id: string | undefined = undefined
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!this._isOpen) {
        reject(new ConnectionClosed(""));
      } else {
        try {
          const rpcId = id ? id : this.messageId.toString();
          this.messageId++;
          const success = (id: string, result: T) => {
            if (id === rpcId) {
              resolve(result);
              this.removeListener("success", success);
              this.removeListener("error", errorCb);
            }
          };
          const errorCb = (id: string, error: any) => {
            if (id === rpcId) {
              reject(error);
            }
            this.removeListener("success", success);
            this.removeListener("error", errorCb);
          };
          this.addListener("success", success);
          this.addListener("error", errorCb);

          const message: MethodRequest = {
            id: rpcId.toString(),
            method: method,
            params: params,
          };
          if (this.willFlush) {
            this.queue(message);
          } else {
            const encoded = encode(message);
            this.logger.sock(`Sending message:${encoded}`);
            this.sock.send(encoded);
          }
        } catch (ex) {
          console.log("exception", ex);
        }
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
