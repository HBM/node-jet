"use strict";

import {
  ConnectionClosed,
  createTypedError,
  invalidRequest,
  methodNotFound,
} from "../3_jet/errors";
import { JsonParams } from "../3_jet/peer";
import EventEmitter from "events";
import {
  castMessage,
  ErrorMessage,
  Message,
  MethodRequest,
  ResultMessage,
} from "../3_jet/messages";
import { logger, Logger } from "../3_jet/log";
import { Socket } from "../1_socket/socket";
/**
 * Helper shorthands.
 */
const encode = JSON.stringify;
const decode = JSON.parse;

export type resultCallback =
  | ((_success: boolean, _result?: any) => void)
  | undefined;

const isResultMessage = (msg: Message): msg is ResultMessage => {
  return "result" in msg;
};
const isErrorMessage = (msg: Message): msg is ErrorMessage => {
  return "error" in msg;
};
export interface JsonRpcConfig {
  batches?: boolean;
  url?: string;
  port?: number;
  ip?: string;
  log?: logger;
}
/**
 * JsonRPC constructor.
 * @private
 */
export class JsonRPC extends EventEmitter {
  sock!: Socket;
  config: JsonRpcConfig;
  messages: Array<Message> = [];
  fakeContext: any;
  messageId = 1;
  _isOpen = false;
  openRequests: Record<string, { resolve: Function; reject: Function }> = {};
  batchPromises: Promise<object>[] = [];
  requestId: string = "";
  resolveDisconnect!: (value: void | PromiseLike<void>) => void;
  rejectDisconnect!: (reason?: any) => void;
  disconnectPromise!: Promise<void>;
  resolveConnect!: (value: void | PromiseLike<void>) => void;
  rejectConnect!: (reason?: any) => void;
  connectPromise!: Promise<void>;
  logger: Logger;
  abortController!: AbortController;
  sendImmedeate: boolean;
  constructor(logger: Logger, config?: JsonRpcConfig, sock?: Socket) {
    super();
    this.config = config || {};
    this.sendImmedeate = config?.batches ? false : true;
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
      this.createDisonnectPromise();
      if (this.abortController.signal.aborted) {
        this.logger.warn("user requested abort");
        this.close();
        this.rejectConnect();
      } else {
        this.resolveConnect();
      }
    });
    this.sock.addEventListener("close", () => {
      this._isOpen = false;
      this.resolveDisconnect();
      this.createConnectPromise();
    });
  };

  connect = (
    controller: AbortController = new AbortController()
  ): Promise<void> => {
    if (this._isOpen) {
      return Promise.resolve();
    }
    this.abortController = controller;
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
    this.send();
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
    this.logger.sock(`Received message: ${message}`);
    try {
      const decoded = decode(message);
      if (Array.isArray(decoded)) {
        decoded.forEach((singleMessage) => {
          this._dispatchSingleMessage(singleMessage);
        });
      } else {
        this._dispatchSingleMessage(decoded);
      }

      this.send().catch((ex) => {
        this.logger.error(ex);
      });
    } catch (err: any) {
      console.log(err, message);
      this.respond("", invalidRequest("Invalid format"), false);
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
    if (this.listenerCount(message.method) === 0) {
      this.logger.error(`Method ${message.method} is unknown`);
      this.respond(message.id, methodNotFound(message.method), false);
    } else {
      this.emit(message.method, this, message.id, message.params);
    }
  };

  /**
   * Queue.
   */
  queue = <T extends Message>(message: T, id = "") => {
    // console.log("Queuing", id, message);
    if (!this._isOpen) {
      return Promise.reject(new ConnectionClosed("Connection is closed"));
    }
    if (id) {
      this.messages.push({ id: "_", method: id, params: message } as Message);
    } else {
      this.messages.push(message);
    }
    if (this.sendImmedeate) {
      this.send();
    }
  };

  /**
   * Send.
   */
  send = () => {
    if (this.messages.length > 0) {
      const encoded = encode(
        this.messages.length === 1 ? this.messages[0] : this.messages
      );
      this.logger.sock(`Sending message:  ${encoded}`);
      this.sock.send(encoded);
      this.messages = [];
    }
    return Promise.all(this.batchPromises).then((res) => {
      this.batchPromises = [];
      return Promise.resolve(res);
    });
  };

  respond = (id: string, params: object, success: boolean) => {
    // const msg = encode({ id: id, [success ? "result" : "error"]: params });
    // this.logger.sock(`Responding message:  ${msg}`);
    this.queue({ id: id, [success ? "result" : "error"]: params });
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
  sendRequest = <T extends object>(
    method: string,
    params: JsonParams,
    immedeate: boolean | undefined = undefined
  ): Promise<T> => {
    const promise = new Promise<T>((resolve, reject) => {
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
        this.queue(message);
        if (immedeate) {
          this.send();
        }
      }
    });
    this.batchPromises.push(promise);
    if (immedeate || this.sendImmedeate) return promise;
    else {
      return Promise.resolve({} as T);
    }
  };
}

export default JsonRPC;
