"use strict";

import { ConnectionClosed, createTypedError } from "../3_jet/errors";
import { JsonParams, PublishParams } from "../3_jet/peer";
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
  openRequests: Record<string, { resolve: Function; reject: Function }> = {};
  resolveDisconnect!: (value: void | PromiseLike<void>) => void;
  rejectDisconnect!: (reason?: any) => void;
  disconnectPromise!: Promise<void>;
  resolveConnect!: (value: void | PromiseLike<void>) => void;
  rejectConnect!: (reason?: any) => void;
  connectPromise!: Promise<void>;
  logger: Logger;
  constructor(logger: Logger, config?: JsonRpcConfig, sock?: Socket) {
    super();
    this.config = config || {};
    this.createDisonnectPromise();
    this.createConnectPromise();
    this.logger = logger;
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
    });
  };

  connect = (): Promise<void> => {
    if (this._isOpen) {
      return Promise.resolve();
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
    if (!this._isOpen) {
      return Promise.resolve();
    }
    this.flush();
    this.sock.close();
    return this.disconnectPromise;
  };

  _handleError = (err: any) => {
    this.logger.error(`Error in socket connection:${err}`);
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
    } catch (err: any) {
      this.logger.error(err);
    }
  };

  /**
   * _dispatchSingleMessage
   *
   * @api private
   */
  _dispatchSingleMessage = (
    message: MethodRequest | ResultMessage | ErrorMessage
  ) => {
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
      this.successCb(mid, message.result as any);
    }
    if (isErrorMessage(message)) {
      const err =
        typeof message.error === "string"
          ? message.error
          : createTypedError(message.error);
      this.errorCb(mid, err);
    }
  };

  /**
   * _dispatchRequest.
   * Handles both method calls and fetchers (notifications)
   *
   * @api private
   */
  _dispatchRequest = (message: MethodRequest) => {
    console.log(message.method);
    if (this.listenerCount(message.method) === 0) {
      this.logger.error(`Method ${message.method} is unknown`);
    }
    this.emit(message.method, message.params);
    this.emit("beforeAck", message.params);
    this.respond(message.id);
    this.emit("afterAck", message.params);
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
        this.logger.sock(`Sending message ${encoded}`);
        this.sock.send(encoded);
        this.messages = [];
      }
    }
    this.willFlush = false;
  };

  respond = (id: string, params: object, success: boolean) => {
    this.sock.send(encode({ id: id, [success ? "result" : "error"]: params }));
  };

  successCb = (id: string, result: any) => {
    if (id in this.openRequests) {
      this.openRequests[id].resolve(result);
      delete this.openRequests[id];
    }
  };
  errorCb = (id: string, error: any) => {
    if (id in this.openRequests) {
      this.openRequests[id].reject(error);
      delete this.openRequests[id];
    }
  };
  /**
   * Service.
   */
  send = <T extends object>(method: string, params: JsonParams): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!this._isOpen) {
        reject(new ConnectionClosed("Connection is closed"));
      } else {
        const rpcId = this.messageId.toString();
        this.messageId++;
        this.openRequests[rpcId] = { resolve, reject };
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
      }
    });
  };
  notify = <T extends object>(
    fetchId: string,
    params: PublishParams
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!this._isOpen) {
        reject(new ConnectionClosed("Connection is closed"));
      } else {
        const message: MethodRequest = {
          id: "_",
          method: fetchId,
          params: params,
        };
        if (this.willFlush) {
          this.queue(message);
        } else {
          const encoded = encode(message);
          this.logger.sock(`Sending message:${encoded}`);
          this.sock.send(encoded);
        }
        resolve({} as T); //Publish messages are not acknowledged
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
