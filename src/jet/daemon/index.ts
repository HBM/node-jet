"use strict";

import { checked, errorObject, invalidParams, isDefined } from "../utils";
import { hasAccess, Message } from "./access";
import MessageSocket from "../message-socket";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import * as net from "net";

import {
  addCore,
  changeCore,
  fetchCore,
  removeCore,
  unfetchCore,
} from "../fetch-common";
import { Router } from "./router";
import { MessageFunction, Peers, PeerType } from "./peers";
import { jetElements } from "../element";
import { JsonRPC } from "./jsonrpc";
import { create, Notification } from "../fetcher";
import EventEmitter from "events";
import { noop } from "../../browser";

const version = "2.2.0";

interface Features {
  batches: any;
  authentication: boolean;
  fetch: string;
}
export interface InfoOptions {
  protocolVersion?: string;
  version?: string;
  name?: string;
  features?: Features;
}
export interface LisenOptions {
  tcpPort?: number;
  wsPort?: number;
  server?: any;
  wsGetAuthentication?: any;
  wsPingInterval?: any;
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
interface ParamObject {
  value: object;
}
interface DaemonOptions {
  log?: any;
  users?: Record<string, User>;
}

const defaultOptions: DaemonOptions = {
  log: console.log,
  users: {},
};

export class Daemon extends EventEmitter.EventEmitter {
  wsServer!: WebSocketServer;
  tcpServer!: net.Server;
  users: Record<string, User>;
  router: Router;
  elements: jetElements;
  infoObject: InfoObject;
  peers: Peers;
  fetchSimpleId = "fetch_all";
  constructor(options: DaemonOptions & InfoOptions = defaultOptions) {
    super();
    const { log = noop, users = {} } = options;
    this.users = users;
    this.router = new Router(log);
    this.elements = new jetElements(null);
    this.infoObject = new InfoObject(options);
    const services = {
      add: this.safe(this.add),
      remove: this.safe(this.remove),
      call: this.safeForward(this.route),
      set: this.safeForward(this.route),
      change: this.safe(this.change),
      config: this.safe(this.config),
      info: this.safe(this.info),
      fetch: undefined as any,
      unfetch: undefined as any,
      get: this.safe(this.get),
      authenticate: this.safe(this.authenticate),
      echo: this.safe((_: any, message: { params: any }) => {
        return message.params;
      }),
    };

    if (this.infoObject.features.fetch === "full") {
      services.fetch = this.safeForward(this.fetch);
      services.unfetch = this.safe(this.unfetch);
    } else {
      services.fetch = this.safeForward(this.fetchSimple);
      services.unfetch = this.safe(this.unfetchSimple);
    }
    const jsonrpc = new JsonRPC(services, this.router);
    this.peers = new Peers(jsonrpc, this.elements);
  }

  // dispatches the 'change' jet call.
  // updates the internal cache (element table)
  // and publishes a change event.
  change = (peer: PeerType, message: Message) => {
    const params = checked<ParamObject>(message, "params", "ParamObject");
    changeCore(peer, this.elements, params);
  };

 

  // dispatches the 'fetch' (simple variant) jet call.
  // sets up simple fetching for this peer (fetch all (with access), unsorted).
  fetchSimple = (peer: PeerType, message: Message) => {

    if (peer.fetchingSimple === true) {
      throw invalidParams("already fetching");
    }
    const queueNotification = (nparams: any) => {
      peer.sendMessage({
        id: "",
        method: this.fetchSimpleId,
        params: nparams,
      });
    };
    // create a "fetch all" fetcher
    const fetcher = create({}, queueNotification);
    peer.fetchingSimple = true;
    if (isDefined(message.id)) {
      peer.sendMessage({
        id: message.id,
        result: this.fetchSimpleId,
      });
    }
    peer.addFetcher(this.fetchSimpleId, fetcher);
    this.elements.addFetcher(peer.id + this.fetchSimpleId, fetcher, peer);
  };

  // dispatchers the 'unfetch' (simple variant) jet call.
  // removes all ressources associated with the fetcher.
  unfetchSimple = (peer: PeerType, _: Message) => {
    if (!peer.fetchingSimple) {
      throw invalidParams("not fetching");
    }
    const fetchId = this.fetchSimpleId;
    const fetchPeerId = peer.id + fetchId;

    peer.removeFetcher(fetchId);
    this.elements.removeFetcher(fetchPeerId);
  };

  get = (peer: PeerType, message: Message) => {
    const params = checked<any>(message, "params", "object");
    params.id = uuidv4();
    let queueNotification;
    let result;

    if (params.sort) {
      queueNotification = (nparams: Notification) => {
        result = nparams.changes;
      };
    } else {
      result = [];
      queueNotification = (nparams: Notification) => {
        result.push(nparams);
      };
    }

    const queueSuccess = () => {};

    fetchCore(peer, this.elements, params, queueNotification, queueSuccess);
    unfetchCore(peer, this.elements, params);
    return result;
  };

  // dispatches the 'fetch' jet call.
  // creates a fetch operation and optionally a sorter.
  // all elements are inputed as "fake" add events. The
  // fetcher is only asociated with the element if
  // it "shows interest".
  fetch = (
    peer: {
      sendMessage: MessageFunction;
    },
    message: Message
  ) => {
    const params = checked<object>(message, "params", "object");
    const fetchId = checked<string>(params, "id", "string");

    const queueNotification = (nparams: object) => {
      peer.sendMessage({
        id: fetchId,
        method: fetchId,
        params: nparams,
      });
    };

    const queueSuccess = () => {
      if (isDefined(message.id)) {
        peer.sendMessage({
          id: message.id,
          result: true,
        });
      }
    };
    fetchCore(peer, this.elements, params, queueNotification, queueSuccess);
  };

  // dispatchers the 'unfetch' jet call.
  // removes all ressources associated with the fetcher.
  unfetch = (peer: PeerType, message: Message) => {
    const params = message.params;
    unfetchCore(peer, this.elements, params);
  };

  // route / forwards a peer request or notification ("call","set") to the peer
  // of the corresponding element specified by "params.path".
  // creates an entry in the "route" table if it is a request and sets up a timer
  // which will respond a response timeout error to the requestor if
  // no corresponding response is received.
  route = (peer: PeerType, message: Message) => {
    const params = message.params;
    const path = checked<string>(params, "path", "string");
    const element = this.elements.get(path);
    if (message.method && !hasAccess(message.method, peer, element)) {
      throw invalidParams({
        noAccess: path,
      });
    } else if (element.fetchOnly) {
      throw invalidParams({
        fetchOnly: path,
      });
    }
    const req: Message = {
      id: "" ,
    };
    if (isDefined(message.id)) {
      req.id = this.router.request(message, peer, element);
    }
    req.method = path;

    if (message.method === "set") {
      req.params = {
        value: params.value,
        valueAsResult: params.valueAsResult,
      };
    } else {
      req.params = params.args;
    }
    element.peer.sendMessage(req);
  };

  add = (peer: PeerType, message: Message) => {
    const params = checked<object>(message, "params", "object");

    addCore(
      peer,
      this.peers.eachPeerFetcherWithAccess(),
      this.elements,
      params
    );
  };

  remove = (peer: PeerType, message: Message) => {
    const params = checked<object>(message, "params", "object");
    removeCore(peer, this.elements, params);
  };

  config = (peer: PeerType, message: Message) => {
    const params = message.params;
    const name = params.name;
    delete params.name;

    if (Object.keys(params).length > 0) {
      throw invalidParams("unsupported config field");
    }

    if (name) {
      peer.name = name;
    }
  };

  info = () => {
    return this.infoObject;
  };

  authenticate = (
    peer: { hasFetchers: () => any; auth: any },
    message: Message
  ) => {
    const params = checked<object>(message, "params", "object");
    const user = checked<string>(params, "user", "string");
    const password = checked<string>(params, "password", "string");

    if (peer.hasFetchers()) {
      throw invalidParams({
        alreadyFetching: true,
      });
    }

    if (!this.users[user]) {
      throw invalidParams({
        invalidUser: true,
      });
    }

    if (this.users[user].password !== password) {
      throw invalidParams({
        invalidPassword: true,
      });
    }

    peer.auth = this.users[user].auth;
    return peer.auth;
  };

  safe = (f: any) => {
    return (peer: PeerType, message: Message) => {
      try {
        const result = f(peer, message) || true;
        if (isDefined(message.id)) {
          peer.sendMessage({
            id: message.id,
            result: result,
          });
        }
      } catch (err) {
        if (isDefined(message.id)) {
          peer.sendMessage({
            id: message.id,
            error: errorObject(err),
          });
        }
      }
    };
  }

  safeForward = (f: any) => {
    return (peer: PeerType, message: Message) => {
      try {
        f(peer, message);
      } catch (err) {
        if (message.id) {
          peer.sendMessage({
            id: message.id,
            error: errorObject(err),
          });
        }
      }
    };
  }

  /**
   * Connection event.
   *
   * @event Daemon#connection
   * @type {Peer} The new connected Peer
   *
   */

  /**
   * Disconnect event.
   *
   * @event Daemon#disconnect
   * @type {Peer} The disconnected Peer instance.
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

  listen = (listenOptions: LisenOptions = defaultListenOptions) => {
    if (listenOptions.tcpPort) {
      this.tcpServer = net.createServer((peerSocket) => {
        const sock = new MessageSocket(peerSocket);
        const peer = this.peers.add(sock);
        peer.on("disconnect", () => {
          this.emit("disconnect", peer);
        });
        this.emit("connection", peer);
      });
      this.tcpServer.listen(listenOptions.tcpPort);
    }
    if (listenOptions.wsPort || listenOptions.server) {
      this.wsServer = new WebSocketServer({
        port: listenOptions.wsPort,
        server: listenOptions.server,
        verifyClient: listenOptions.wsGetAuthentication
          ? (info: { req: any }) => {
              const auth = listenOptions.wsGetAuthentication(info);
              if (typeof auth === "object") {
                info.req._jetAuth = auth;
                return true;
              }
              return false;
            }
          : undefined,
        handleProtocols: (protocols: Set<string>) => {
          if (protocols.has("jet")) {
            return "jet";
          } else {
            return false;
          }
        },
      });
      this.wsServer.on(
        "connection",
        (ws: { readyState: any; ping: () => void }, req: any) => {
          const peer = this.peers.add(ws as any);
          peer.auth = req._jetAuth;
          const pingMs = listenOptions.wsPingInterval || 5000;
          let pingInterval: NodeJS.Timeout;
          if (pingMs) {
            pingInterval = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
              }
            }, pingMs);
          }
          peer.on("close", () => {
            clearInterval(pingInterval);
          });
          peer.on("disconnect", () => {
            this.emit("disconnect", peer);
          });
          this.emit("connection", peer);
        }
      );
    }
  };

  close = () => {
    this.tcpServer.close();
    this.wsServer.close();
  };
}

export default Daemon;
