"use strict";

import { Logger, logger } from "../log";
import { FetchOptions, PathParams } from "../messages";
import { createPathMatcher } from "./path_matcher";
import { Subscription } from "./subscription";
import { Route } from "./route";
import {
  ConnectionInUse,
  JsonRPCError,
  notAllowed,
  NotFound,
  Occupied,
} from "../errors";
import JsonRPC from "../../2_jsonrpc";
import { JsonRPCServer } from "../../2_jsonrpc/server";
import { WebServerConfig } from "../../1_socket/wsserver";
import { TCPServerConfig } from "../../1_socket/tcpserver";
import { EventEmitter } from "../../1_socket";

const version = "2.2.0";

interface Features {
  batches?: boolean;
  fetch?: "full" | "simple";
  asNotification?: boolean;
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
      batches: options.features?.batches || false,
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

export class Daemon extends EventEmitter {
  infoObject: InfoObject;
  log: Logger;
  jsonRPCServer!: JsonRPCServer;
  routes: Record<string, Route> = {};
  subscriber: Subscription[] = [];
  constructor(options: DaemonOptions & InfoOptions = defaultOptions) {
    super();
    this.infoObject = new InfoObject(options);
    this.log = new Logger(options.log);
  }
  asNotification = () => this.infoObject.features.asNotification;
  simpleFetch = () => this.infoObject.features.fetch === "simple";
  respond = (peer: JsonRPC, id: string) => {
    if (this.asNotification()) {
      peer.respond(id, {}, true);
      this.emit("notify");
    } else {
      this.emit("notify");
      peer.respond(id, {}, true);
    }
  };
  /*
  Add as Notification: The message is acknowledged,then all the peers are informed about the new state
  Add synchronous: First all Peers are informed about the new value then message is acknowledged
  */
  add = (peer: JsonRPC, id: string, params: PathParams) => {
    const path = params.path;
    if (path in this.routes) {
      peer.respond(id, new Occupied(path), false);
      return;
    }
    this.routes[path] = new Route(peer, path, params.value);
    if (params.value) {
      this.subscriber.forEach((fetchRule) => {
        if (this.simpleFetch() || fetchRule.matchesPath(path)) {
          fetchRule.addRoute(this.routes[path]);
        }
      });
    }
    this.respond(peer, id);
  };
  /*
  Change as Notification: The message is acknowledged,then all the peers are informed about the value change
  change synchronous: First all Peers are informed about the new value then the message is acknowledged
  */
  change = (peer: JsonRPC, id: string, msg: PathParams) => {
    if (msg.path in this.routes) {
      this.routes[msg.path].updateValue(msg.value!);
      this.respond(peer, id);
    } else {
      peer.respond(id, new NotFound(), false);
    }
  };

  /*
  Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
  Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
  */
  fetch = (peer: JsonRPC, id: string, msg: FetchOptions) => {
    if (
      this.simpleFetch() &&
      this.subscriber.find((sub) => sub.owner === peer)
    ) {
      peer.respond(
        id,
        new ConnectionInUse("Only one fetcher per peer in simple fetch Mode"),
        false
      );
      return;
    }
    if (this.subscriber.find((sub) => sub.id === msg.id)) {
      peer.respond(id, new Occupied("FetchId already in use"), false);
      return;
    }
    try {
      const sub = new Subscription(msg, peer);
      this.addListener("notify", sub.send);
      this.subscriber.push(sub);

      sub.setRoutes(
        Object.values(this.routes).filter(
          (route) =>
            this.routes[route.path].value !== undefined && //check if state
            (this.simpleFetch() || sub.matchesPath(route.path)) //check if simpleFetch or pathrule matches
        )
      );
      this.respond(peer, id);
    } catch (err) {
      peer.respond(id, err as JsonRPCError, false);
    }
  };

  /*
  Unfetch synchronous: Unfetch fires and no more updates are send with the given fetch_id. Message is acknowledged
  */
  unfetch = (peer: JsonRPC, id: string, params: any) => {
    const subIdx = this.subscriber.findIndex((fetch) => fetch.id === params.id);
    if (subIdx < 0) {
      peer.respond(
        id,
        new NotFound(`No Subscription with id ${params.id} found`),
        false
      );
      return;
    }
    if (this.subscriber[subIdx].owner !== peer) {
      peer.respond(
        id,
        new notAllowed(`Peer does not own subscription with id ${params.id}`),
        false
      );
      return;
    }
    this.subscriber[subIdx].close();
    this.subscriber.splice(subIdx, 1);
    peer.respond(id, {}, true);
  };

  /*
  Get synchronous: Only synchronous implementation-> all the values are added to an array and send as response
  */
  get = (peer: JsonRPC, id: string, params: any) => {
    const matcher = createPathMatcher(params);
    const resp = Object.keys(this.routes)
      .filter((route) => matcher(route))
      .map((route: string) => {
        return { path: route, value: this.routes[route].value };
      });
    peer.respond(id, resp, true);
  };

  /*
  remove synchronous: Only synchronous implementation-> state is removed then message is acknowledged
  */
  remove = (peer: JsonRPC, id: string, params: any) => {
    const route = params.path;
    if (!(route in this.routes)) {
      peer.respond(id, new NotFound(route), false);
      return;
    }
    this.routes[route].remove();
    delete this.routes[route];
    this.respond(peer, id);
  };
  /*
  Call and Set requests: Call and set requests are always forwarded synchronous
  */
  forward = (method: "set" | "call", params: PathParams) => {
    if (!(params.path in this.routes)) {
      return Promise.reject(new NotFound(params.path));
    }
    return this.routes[params.path].owner.sendRequest(method, params, true);
  };

  /*
  Info requests: Info requests are always synchronous
  */
  info = (peer: JsonRPC, id: string, _params: any) => {
    peer.respond(id, this.infoObject, true);
  };

  configure = (peer: JsonRPC, id: string, _params: any) => {
    peer.respond(id, {}, true);
  };

  /**
   * Connection event.
   *
   * @event Daemon#connection
   * @type {Peer} The new connected Peer
   *
   */

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
    this.jsonRPCServer = new JsonRPCServer(
      this.log,
      listenOptions,
      this.infoObject.features.batches
    );
    this.jsonRPCServer.addListener("connection", (newPeer: JsonRPC) => {
      this.log.info("Peer connected");

      newPeer.addListener("info", this.info);
      newPeer.addListener("configure", this.configure);

      newPeer.addListener("add", this.add);
      newPeer.addListener("change", this.change);
      newPeer.addListener("remove", this.remove);

      newPeer.addListener("get", this.get);
      newPeer.addListener("fetch", this.fetch);
      newPeer.addListener("unfetch", this.unfetch);

      newPeer.addListener(
        "set",
        (_peer: JsonRPC, id: string, params: PathParams) =>
          this.forward("set", params)
            .then((res) => {
              newPeer.respond(id, res, true);
              newPeer.send();
            })
            .catch((err) => {
              newPeer.respond(id, err, false);
              newPeer.send();
            })
      );
      newPeer.addListener(
        "call",
        (_peer: JsonRPC, id: string, params: PathParams) =>
          this.forward("call", params)
            .then((res) => {
              newPeer.respond(id, res, true);
              newPeer.send();
            })
            .catch((err) => {
              newPeer.respond(id, err, false);
              newPeer.send();
            })
      );
    });

    this.jsonRPCServer.addListener("disconnect", (peer: JsonRPC) => {
      this.filterRoutesByPeer(peer).forEach((route) => {
        this.log.warn("Removing route that was owned by peer");
        this.routes[route].remove();
        delete this.routes[route];
      });

      this.subscriber = this.subscriber.filter((fetcher) => {
        if (fetcher.owner !== peer) {
          return true;
        }
        fetcher.close();
        return false;
      });
    });
    this.jsonRPCServer.listen();
    this.log.info("Daemon started");
  };

  close = () => {
    this.jsonRPCServer.close();
  };
}

export default Daemon;