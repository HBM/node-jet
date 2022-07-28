"use strict";

import { EventType } from "../types";
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
import { methodNotFound, NotFound, Occupied } from "../errors";
import { createPathMatcher } from "./path_matcher";
import { Subscriber } from "./subscriber";
import { Route } from "./route";

const version = "2.2.0";

interface Features {
  batches: boolean;
  authentication: boolean;
  fetch: "full" | "simple";
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
      asNotification: options.features?.asNotification || false,
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
  jsonRPCServer!: JsonRPCServer;
  routes: Record<string, Route> = {};
  fetcher: Subscriber[] = [];
  constructor(options: DaemonOptions & InfoOptions = defaultOptions) {
    super();
    this.users = options.users || {};
    this.infoObject = new InfoObject(options);
    this.log = new Logger(options.log);
  }
  hasRoute = (route: string) => route in this.routes;
  asNotification = () => this.infoObject.features.asNotification;
  simpleFetch = () => this.infoObject.features.fetch === "simple";
  /*
  Add as Notification: The message is acknowledged,then all the peers are informed about the new state
  Add synchronous: First all Peers are informed about the new value then message is acknowledged
  */
  add = (msg: AddRequest, peer: JsonRPC) => {
    const path = msg.params.path;
    this.routes[path] = new Route(peer, path, msg.params.value);
    if (msg.params.value) {
      this.fetcher.forEach((fetchRule) => {
        if (this.simpleFetch() || fetchRule.matchesPath(path)) {
          this.routes[path].addSubscriber(fetchRule);
        }
      });
    }
  };
  /*
  Change as Notification: The message is acknowledged,then all the peers are informed about the value change
  change synchronous: First all Peers are informed about the new value then the message is acknowledged
  */
  change = (msg: UpdateRequest) => {
    this.routes[msg.params.path].updateValue(msg.params.value);
  };

  /*
  Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
  Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
  */
  fetch = (msg: FetchRequest, peer: JsonRPC) => {
    if (this.simpleFetch() && this.fetcher.find((sub) => sub.owner === peer)) {
      return Promise.reject("Only one fetcher per peer in simple fetch Mode");
    }

    const sub = new Subscriber(msg, peer);
    this.addListener("notify", () => {
      sub.flush();
    });
    this.fetcher.push(sub);
    Object.keys(this.routes)
      .filter(
        (route) =>
          this.routes[route].value && //check if state
          (this.simpleFetch() || sub.matchesPath(route)) //check if simpleFetch or pathrule matches
      )
      .forEach((route: string) => {
        this.routes[route].addSubscriber(sub);
      });
  };

  /*
  Unfetch synchronous: Unfetch fires and no more updates are send with the given fetch_id. Message is acknowledged
  */
  unfetch = (msg: UnFetchRequest) => {
    this.fetcher = this.fetcher.filter((fetch) => fetch.id !== msg.params.id);
    Object.values(this.routes).forEach((route) =>
      route.removeSubscriber(msg.params.id)
    );
  };

  /*
  Get synchronous: Only synchronous implementation-> all the values are added to an array array ist send as response
  */
  get = (msg: GetRequest) => {
    const matcher = createPathMatcher(msg.params);
    return Object.keys(this.routes)
      .filter((route) => matcher(route))
      .map((route: string) => {
        return { path: route, value: this.routes[route].value };
      });
  };

  /*
  remove synchronous: Only synchronous implementation-> state is removed then message is acknowledged
  */
  remove = (msg: RemoveRequest) => {
    const route = msg.params.path;
    this.routes[route].publish("Remove");
  };
  /*
  Call and Set requests: Call and set requests are always forwarded synchronous
  */
  forward = (msg: SetRequest | CallRequest) =>
    this.routes[msg.params.path].owner.send(msg.method, msg.params);

  /*
  Info requests: Info requests are always synchronous
  */
  info = () => this.infoObject;

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
  respond = (peer: JsonRPC, msgId: string, res: any) =>
    peer.respond(msgId, res, true);

  respondAndNotify = (peer: JsonRPC, msgId: string, res: any) => {
    if (this.asNotification()) {
      peer.respond(msgId, res, true);
      this.emit("notify");
    } else {
      this.emit("notify");
      peer.respond(msgId, res, true);
    }
  };
  handleMessage = (method: EventType, msg: MethodRequest, peer: JsonRPC) => {
    this.log.debug(`${method} request`);
    switch (method) {
      case "remove":
      case "set":
      case "call":
      case "change":
        const req = castMessage<RemoveRequest>(msg);
        if (!this.hasRoute(req.params.path)) {
          peer.respond(msg.id, new NotFound(), false);
          return;
        }
        break;
    }
    switch (method) {
      case "configure":
        //TODO what can be configured??
        peer.respond(msg.id, {}, true);
        break;
      case "info":
        peer.respond(msg.id, this.info(), true);
        return;
      case "add":
        const addReq = castMessage<RemoveRequest>(msg);
        if (this.hasRoute(addReq.params.path)) {
          peer.respond(msg.id, new Occupied(), false);
        } else {
          this.add(castMessage<AddRequest>(msg), peer);
          this.respondAndNotify(peer, msg.id, {});
        }
        break;
      case "remove":
        const rmvRequest = castMessage<RemoveRequest>(msg);
        this.remove(rmvRequest);
        this.respondAndNotify(peer, msg.id, {});
        delete this.routes[rmvRequest.params.path];
        break;
      case "fetch":
        const req = castMessage<FetchRequest>(msg);
        this.fetch(req, peer).then(() =>
          this.respondAndNotify(peer, msg.id, {})
        );

        break;
      case "change":
        this.change(castMessage<UpdateRequest>(msg));
        this.respondAndNotify(peer, msg.id, {});
        break;

      case "unfetch":
        this.unfetch(castMessage<UnFetchRequest>(msg));
        this.respond(peer, msg.id, {});
        break;

      //Requests that need to be forwarded
      case "get":
        this.respond(peer, msg.id, this.get(castMessage<GetRequest>(msg)));
        break;
      case "set":
        this.forward(castMessage<SetRequest>(msg))
          .then((response) => peer.respond(msg.id, response, true))
          .catch((ex) => peer.respond(msg.id, ex, false));
        break;
      case "call":
        this.forward(castMessage<CallRequest>(msg))
          .then((response) => peer.respond(msg.id, response, true))
          .catch((ex) => peer.respond(msg.id, ex, false));
        break;
      default:
        peer.respond(msg.id, methodNotFound(method), false);
    }
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
  filterRoutesByPeer = (peer: JsonRPC): string[] =>
    Object.entries(this.routes)
      .filter(([_path, route]) => route.owner === peer)
      .map((el) => el[0]);

  listen = (
    listenOptions: TCPServerConfig & WebServerConfig = defaultListenOptions
  ) => {
    this.jsonRPCServer = new JsonRPCServer(this.log, listenOptions);
    this.jsonRPCServer.addListener("connection", (newPeer: JsonRPC) => {
      this.log.info("Peer connected");
      newPeer.addListener(
        "message",
        (method: EventType, msg: MethodRequest) => {
          this.handleMessage(method, msg, newPeer);
        }
      );
    });
    this.jsonRPCServer.addListener("disconnect", (peer: JsonRPC) => {
      this.log.info("Peer disconnected");
      this.filterRoutesByPeer(peer).forEach((route) => {
        this.routes[route].publish("Remove");
        delete this.routes[route];
      });
      this.fetcher = this.fetcher.filter((fetcher) => fetcher.owner === peer);
    });
    this.jsonRPCServer.listen();
    this.log.info("Daemon started");
  };

  close = () => {
    this.jsonRPCServer.close();
  };
}

export default Daemon;
