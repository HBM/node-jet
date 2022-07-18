"use strict";

import { invalidParams } from "../utils";
import { EventType } from "../types";
import { Router } from "./router";
import EventEmitter from "events";
import { JsonRPCServer } from "../../2_jsonrpc/server";
import { TCPServerConfig, WebServerConfig } from "../../1_socket/server";
import JsonRPC from "../../2_jsonrpc";
import { Logger, logger } from "../log";
import {
  AddRequest,
  CallRequest,
  castMessage,
  FetchRequest,
  GetRequest,
  Message,
  RemoveRequest,
  SetRequest,
  UpdateRequest,
} from "../messages";

const version = "2.2.0";

interface Features {
  batches: boolean;
  authentication: boolean;
  fetch: string;
}
export interface InfoOptions {
  protocolVersion?: string;
  version?: string;
  name?: string;
  features?: Features;
}

const defaultListenOptions = {
  tcpPort: 11122,
  wsPort: 11123,
};

class InfoObject implements InfoOptions {
  name: string;
  version: string;
  protocolVersion: string;
  features: Features;
  constructor(options: InfoOptions) {
    this.name = options.name || "node-jet";
    this.version = version;
    this.protocolVersion = "1.1.0";
    this.features = {
      batches: true,
      authentication: true,
      fetch: options.features?.fetch || "full",
    };
  }
}

/**
 * Creates a Daemon instance
 *
 * @classdesc
 * In most cases you need one Jet Daemon instance running.
 * All Peers connect to it as in typical master(Daemon) slave(Peer)
 * architectures.
 *
 * ```javascript
 * var jet = require('node-jet')
 * var daemon = new jet.Daemon()
 * ```
 *
 * If you want to use authentication / login, you must provide a user object.
 *
 * ```javascript
 * var daemon = new jet.Daemon({
 *   users: {
 *    john: {
 *      password: '12345',
 *      auth: {
 *        fetchGroups: ['users', 'public'],
 *        setGroups: ['users'],
 *        callGroups: ['users']
 *      }
 *    }
 *  },
 *  bob: {
 *    ...
 *  }
 * })
 * ```
 *
 * @class
 * @name Daemon
 * @param {Object} [options] Options for the daemon creation
 * @param {Object} [options.users] Access restrictions and passwords for each user
 * @returns {Daemon} The newly created Daemon instance.
 *
 */
interface User {
  password?: string;
  auth?: any;
}
// interface ParamObject {
//   value: object;
// }

interface DaemonOptions {
  log?: logger;
  users?: Record<string, User>;
}

const defaultOptions: DaemonOptions = {
  users: {},
};

export class Daemon extends EventEmitter.EventEmitter {
  users: Record<string, User>;
  infoObject: InfoObject;
  log: Logger;
  router: Router;
  fetchSimpleId = "fetch_all";
  jsonRPCServer!: JsonRPCServer;
  asNotification = false;
  constructor(options: DaemonOptions & InfoOptions = defaultOptions) {
    super();
    this.users = options.users || {};
    this.infoObject = new InfoObject(options);
    this.log = new Logger(options.log);
    this.router = new Router(this);
  }

  add = (msg: AddRequest, peer: JsonRPC): Promise<object> => {
    if (this.asNotification) {
      this.emit("add", msg, peer);
      return Promise.resolve({});
    } else {
      if (this.router.hasRoute(msg.params.path)) {
        return Promise.reject(invalidParams("Path already registered"));
      }
      this.router.handleAdd(msg, peer);
      return Promise.resolve({});
    }
  };
  change = (msg: UpdateRequest) => {
    this.emit("update", msg);
    return Promise.resolve({});
  };
  fetch = (msg: FetchRequest, peer: JsonRPC) => {
    this.emit("fetch", msg, peer);
    return Promise.resolve({});
  };
  remove = (msg: RemoveRequest) => {
    if (!this.router.hasRoute(msg.params.path)) {
      return Promise.reject(invalidParams("Path not registered"));
    }
    this.emit("remove", msg.params.path);
    return Promise.resolve({});
  };
  forward = (msg: GetRequest) => this.router.forward(msg.params.path, msg);

  info = () => Promise.resolve(this.infoObject);

  // authenticate = (peer: any, message: Message) => {
  //   const params = checked<object>(message, "params", "object");
  //   const user = checked<string>(params, "user", "string");
  //   const password = checked<string>(params, "password", "string");

  //   if (peer.hasFetchers()) {
  //     throw invalidParams({
  //       alreadyFetching: true,
  //     });
  //   }

  //   if (!this.users[user]) {
  //     throw invalidParams({
  //       invalidUser: true,
  //     });
  //   }

  //   if (this.users[user].password !== password) {
  //     throw invalidParams({
  //       invalidPassword: true,
  //     });
  //   }

  //   peer.auth = this.users[user].auth;
  //   return peer.auth;
  // };

  /**
   * Connection event.
   *
   * @event Daemon#connection
   * @type {Peer} The new connected Peer
   *
   */

  handleMessage = (
    method: EventType,
    message: Message,
    peer: JsonRPC
  ): Promise<object> => {
    this.log.debug(`${method} request`);
    switch (method) {
      //Daemon requests
      case "configure":
        //TODO what can be configured??
        return Promise.resolve({});
        break;
      case "info":
        return this.info();
        break;
      case "add":
        return this.add(castMessage<AddRequest>(message), peer);
      case "remove":
        return this.remove(castMessage<RemoveRequest>(message));
      case "fetch":
        return this.fetch(castMessage<FetchRequest>(message), peer);
      case "change":
        return this.change(castMessage<UpdateRequest>(message));
      //Requests that need to be forwarded
      case "get":
        return this.forward(castMessage<GetRequest>(message));
      case "set":
        return this.forward(castMessage<SetRequest>(message));
      case "call":
        return this.forward(castMessage<CallRequest>(message));
    }
    return Promise.resolve({});
  };

  /**
   * Starts listening on the specified ports (on all interfaces). options must be an object.
   *
   * `options.wsPort` and `options.server` must not be used simultaneously. `options.tcpPort` and `options.wsPort` /
   * `options.server` can both be defined to support the "trivial" and the websocket protocol at the same time.
   * Browser Peers can only connect via Websocket.
   *
   * This shows how to use custom ports:
   * ```javascript
   * var jet = require('node-jet')
   * var daemon = new jet.Daemon()
   * daemon.listen({
   *   tcpPort: 1234,
   *   wsPort: 4321
   * })
   *
   * ```
   *
   * This shows how to attach to an http webserver:
   * ```javascript
   * var http = require('http')
   * var jet = require('node-jet')
   *
   * var httpServer = http.createServer(function(req, res) {
   *   // serve your stuff
   * })
   * httpServer.listen(80)
   *
   * var daemon = new jet.Daemon()
   * daemon.listen({
   *   server: httpServer
   * })
   * ```
   *
   * @function listen
   * @memberof Daemon
   * @param [options] The listen options
   * @param [options.tcpPort=11122] The port for the "trivial" tcp protocol
   * @param [options.wsPort=11123] The port for the Websocket protocol
   * @param [options.server] An existing http or https server to hook onto providing Websocket protocol.
   * @fires Daemon#connection
   * @fires Daemon#disconnect
   *
   */

  listen = (
    listenOptions: TCPServerConfig & WebServerConfig = defaultListenOptions
  ) => {
    this.jsonRPCServer = new JsonRPCServer(listenOptions);
    this.jsonRPCServer.addListener("connection", (newPeer: JsonRPC) => {
      this.log.info("Peer connected");
      newPeer.addListener("message", (method: EventType, msg: Message) => {
        this.handleMessage(method, msg, newPeer)
          .then((response) => {
            newPeer.respond(msg.id, response, true);
          })
          .catch((ex) => newPeer.respond(msg.id, ex, false));
      });
    });
    this.jsonRPCServer.addListener("disconnect", (listener: JsonRPC) => {
      this.log.info("Peer disconnected");
      const routes = this.router.filterRoutesByPeer(listener);
      this.router.deleteRoutes(routes);
    });
    this.jsonRPCServer.listen();
    this.log.info("Daemon started");
  };

  close = () => {
    //TODO
  };
}

export default Daemon;
