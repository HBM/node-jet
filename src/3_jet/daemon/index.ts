"use strict";

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
  MethodRequest,
  RemoveRequest,
  SetRequest,
  UnFetchRequest,
  UpdateRequest,
} from "../messages";
import { invalidParams } from "../errors";

const version = "2.2.0";

interface Features {
  batches: boolean;
  authentication: boolean;
  fetch: "full"|"simple";
  asNotification: boolean;
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
      asNotification: options.features?.asNotification || false
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
  jsonRPCServer!: JsonRPCServer;
  constructor(options: DaemonOptions & InfoOptions = defaultOptions) {
    super();
    this.users = options.users || {};
    this.infoObject = new InfoObject(options);
    this.log = new Logger(options.log);
    this.router = new Router(this);
  }
  /*
  Add as Notification: The message is acknowledged,then all the peers are informed about the new state
  Add synchronous: First all Peers are informed about the new value then message is acknowledged
  */
  add = (msg: AddRequest, peer: JsonRPC): Promise<object> => {
    if (this.router.hasRoute(msg.params.path)) {
      return Promise.reject(invalidParams("Path already registered"));
    }
    if (this.infoObject.features.asNotification) {
      this.emit("add", msg, peer);
      return Promise.resolve({});
    } else {
      return this.router.handleAdd(msg, peer);
    }
  };
  /*
  Change as Notification: The message is acknowledged,then all the peers are informed about the value change
  change synchronous: First all Peers are informed about the new value then the message is acknowledged
  */
  change = (msg: UpdateRequest) => {
    if (this.infoObject.features.asNotification) {
      this.emit("update", msg);
      return Promise.resolve({});
    }else{
      return this.router.handleChange(msg)
    }
  };
   /*
  Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
  Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
  */
  fetch = (msg: FetchRequest, peer: JsonRPC) => {
    if (this.infoObject.features.asNotification) {
      this.emit("fetch", msg,peer);
      return Promise.resolve({});
    }else{
      return this.router.handleFetch(msg,peer)
    }
  }
  /*
  Unfetch synchronous: Unfetch fires and no more updates are send with the given fetch_id. Message is acknowledged
  */
  unfetch = (msg: UnFetchRequest) => {
    // if (this.infoObject.features.asNotification) {
    //   this.emit("unfetch", msg);
    //   return Promise.resolve({});
    // }else{
      return this.router.handleUnfetch(msg)
    // }
  }
  /*
  Get synchronous: Only synchronous implementation-> all the values are added to an array array ist send as response
  */
  get = (msg: GetRequest) => this.router.handleGet(msg)

  /*
  remove synchronous: Only synchronous implementation-> state is removed then message is acknowledged
  */  
  remove = (msg: RemoveRequest) => {
    if (!this.router.hasRoute(msg.params.path)) {
      return Promise.reject(invalidParams("Path not registered"));
    }
    return this.router.handleRemove(msg.params.path)
  };
  /*
  Call and Set requests: Call and set requests are always forwarded synchronous
  */
  forward = (msg: SetRequest|CallRequest) => this.router.forward(msg.params.path, msg);

  /*
  Info requests: Info requests are always synchronous
  */
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
    message: MethodRequest,
    peer: JsonRPC
  ): Promise<object> => {
    this.log.debug(`${method} request`);
    switch (method) {
      //Daemon requests
      case "configure":
        //TODO what can be configured??
        return Promise.resolve({});
      case "info":
        return this.info();
      case "add":
        return this.add(castMessage<AddRequest>(message), peer);
      case "remove":
        return this.remove(castMessage<RemoveRequest>(message));
      case "fetch":
        return this.fetch(castMessage<FetchRequest>(message), peer);
      case "unfetch":
        return this.unfetch(castMessage<UnFetchRequest>(message));
      case "change":
        return this.change(castMessage<UpdateRequest>(message));
      //Requests that need to be forwarded
      case "get":
        return this.get(castMessage<GetRequest>(message));
      case "set":
        return this.forward(castMessage<SetRequest>(message));
      case "call":
        return this.forward(castMessage<CallRequest>(message));
    }
    return Promise.reject("Unknown method");
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
    this.jsonRPCServer = new JsonRPCServer(this.log,listenOptions);
    this.jsonRPCServer.addListener("connection", (newPeer: JsonRPC) => {
      this.log.info("Peer connected");
      newPeer.addListener("message", (method: EventType, msg: MethodRequest) => {
        this.handleMessage(method, msg, newPeer)
          .then((response) => {
            newPeer.respond(msg.id, response, true)
          })
          .catch((ex) => newPeer.respond(msg.id, ex, false));
      });
    });
    this.jsonRPCServer.addListener("disconnect", (listener: JsonRPC) => {
      this.log.info("Peer disconnected");
      const routes = this.router.filterRoutesByPeer(listener);
      this.router.deleteRoutes(routes);
      this.router.deleteFetcher(listener)
   
    });
    this.jsonRPCServer.listen();
    this.log.info("Daemon started");
  };

  close = () => {
    this.jsonRPCServer.close()
  };
}

export default Daemon;
