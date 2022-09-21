"use strict";

import { InfoOptions } from "../daemon";
import { AccessType, fetchSimpleId, PublishMessage, ValueType } from "../types";

import JsonRPC, { JsonRpcConfig } from "../../2_jsonrpc";
import EventEmitter from "events";
import Method from "./method";
import State from "./state";
import Fetcher from "./fetcher";
import { logger, Logger } from "../log";
import { isState } from "../utils";
import { NotFound } from "../errors";
import { Socket } from "../../1_socket/socket";
import { Subscription } from "../daemon/subscription";

const fallbackDaemonInfo: InfoOptions = {
  name: "unknown-daemon",
  version: "0.0.0",
  protocolVersion: "1.0.0",
  features: {
    fetch: "full",
    batches: true,
    asNotification: false,
  },
};
export interface JsonParams<T = ValueType> {
  method?: string;
  path?: string | Record<string, string | string[]>;
  args?: object;
  timeout?: number;
  user?: string;
  password?: string;
  value?: T;
  valueAsResult?: boolean;
  id?: string;
  access?: AccessType;
}
export type publishEvent = "Add" | "Remove" | "Change";
export interface PublishParams<T = ValueType> {
  event?: publishEvent;
  path: string;
  value?: T;
}

export interface PeerConfig extends JsonRpcConfig {
  url?: string;
  ip?: string;
  port?: number;
  name?: string;
  user?: string;
  password?: string;
  log?: logger;
  rejectUnauthorized?: boolean; // Defaults to true
}

/**
 * Create a Jet Peer instance.
 * @class
 * @classdesc A Peer instance is required for all actions related to Jet.
 * A Peer connected to a Daemon is able to add content (States/Methods)
 * or to consume content (by fetching or by calling set).
 * The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
 * When specifying the url field, the peer uses the Websocket protocol as transport.
 * If no config is provided, the Peer connects to the local ('localhost') Daemon using
 * the trivial protocol.
 * Browsers do only support the Websocket transport and must be provided with a config with url field.
 *
 * @param {PeerConfig} [config] A peer configuration
 * @param {string} [config.url] The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
 * @param {string} [config.ip=localhost] The Jet Daemon TCP trivial protocol ip
 * @param {number} [config.port=11122] The Jet Daemon TCP trivial protocol port
 * @param {string} [config.user] The user name used for authentication
 * @param {string} [config.password] The user's password used for auhtentication
 * @param {Boolean} [config.rejectUnauthorized=false] Allow self signed server certificates when using
 * @returns {Peer} The newly created Peer instance.
 *
 * @example
 * var peer = new jet.Peer({url: 'ws://jetbus.io:8080'})
 */

export class Peer extends EventEmitter {
  #fetchId = 1;
  #config: PeerConfig;
  #jsonrpc: JsonRPC;
  #daemonInfo: InfoOptions = fallbackDaemonInfo;
  #routes: Record<string, Method | State> = {};
  #fetcher: Record<string, Fetcher> = {};
  #log: Logger;
  cache: Record<string, PublishMessage> = {};
  constructor(config?: PeerConfig, sock?: Socket) {
    super();
    this.#config = config || {};
    this.#log = new Logger(this.#config.log);
    this.#jsonrpc = new JsonRPC(this.#log, config, sock);
    this.#jsonrpc.addListener("get", (_peer, id: string, m: any) => {
      const state = this.#routes[m.path] as State;
      if (state) {
        this.#jsonrpc.respond(id, state.toJson(), true);
      } else {
        this.#jsonrpc.respond(id, new NotFound(), false);
      }
    });
    this.#jsonrpc.addListener("set", (_peer, id: string, m: any) => {
      const state = this.#routes[m.path] as State;
      if (state) {
        state.value(m.value);
        state.emit("set", m.value);
        this.#jsonrpc.respond(id, state.toJson(), true);
      } else {
        this.#jsonrpc.respond(id, new NotFound(), false);
      }
    });
    this.#jsonrpc.addListener("call", (_peer, id: string, m: any) => {
      const method = this.#routes[m.path] as Method;
      if (method) {
        method.call(m.args);
        this.#jsonrpc.respond(id, {}, true);
      } else {
        this.#jsonrpc.respond(id, new NotFound(), false);
      }
    });
    this.#jsonrpc.addListener(
      fetchSimpleId,
      (_peer, _id, m: PublishMessage) => {
        this.cache[m.path] = m;
        Object.values(this.#fetcher).forEach((fetcher) => {
          if (fetcher.matches(m.path, m.value)) {
            fetcher.emit("data", m);
          }
        });
      }
    );
  }

  isConnected = () => this.#jsonrpc._isOpen;

  unfetch = (fetcher: Fetcher): Promise<any> => {
    const [id, _f] = Object.entries(this.#fetcher).find(
      ([_id, f]) => f === fetcher
    ) || [null, null];
    if (!id) return Promise.reject("Could not find fetcher");
    if (!this.fetchFull()) {
      if (Object.keys(this.#fetcher).length === 2) {
        const param = { id: fetchSimpleId };
        console.log("sending unfetch");
        return this.#jsonrpc
          .sendRequest("unfetch", param)
          .then(() => console.log("Unfetched"))
          .then(() => delete this.#fetcher[id])
          .then(() => Promise.resolve());
      } else {
        delete this.#fetcher[id];
        return Promise.resolve({});
      }
    } else {
      return this.#jsonrpc
        .sendRequest<object[]>("unfetch", { id })
        .then((res) => {
          delete this.#fetcher[id];
          return Promise.resolve(res);
        });
    }
  };
  fetchFull = () => this.#daemonInfo.features?.fetch === "full";

  fetch = (fetcher: Fetcher): Promise<any> => {
    //check if daemon accespts path and value rules for fetching
    // otherwise rules must be applied on peer side
    const fetchFull = this.fetchFull();
    const fetcherId = `___f___${this.#fetchId}`;
    this.#fetchId++;
    this.#fetcher[fetcherId] = fetcher;

    if (fetchFull) {
      const params = {
        ...fetcher.message,
        id: fetcherId,
      };
      this.#jsonrpc.addListener(fetcherId, (_peer, _id, args) => {
        if (fetcherId in this.#fetcher)
          this.#fetcher[fetcherId].emit("data", args);
      });
      return this.#jsonrpc.sendRequest<object[]>("fetch", params);
    }
    const sub = new Subscription(fetcher.message);
    Object.values(this.cache)
      .filter(
        (entry) => sub.matchesPath(entry.path) && sub.matchesValue(entry.value)
      )
      .forEach((entry) => {
        fetcher.emit("data", entry);
      });
    if (!(fetchSimpleId in this.#fetcher)) {
      //create dummy fetcher to
      this.#fetcher[fetchSimpleId] = new Fetcher();
      const params = { id: fetchSimpleId, path: { startsWith: "" } };
      return this.#jsonrpc.sendRequest<object[]>("fetch", params);
    } else {
      return Promise.resolve({});
    }
  };

  /**
   * Actually connect the peer to the Jet Daemon
   * After the connect Promise has been resolved, the peer provides `peer.daemonInfo` object.
   *
   * ```javascript
   * peer.connect().then(function() {
   *   var daemonInfo = peer.daemonInfo
   *   console.log('name', daemonInfo.name) // string
   *   console.log('version', daemonInfo.version) // string
   *   console.log('protocolVersion', daemonInfo.protocolVersion) // number
   *   console.log('can process JSON-RPC batches', daemonInfo.features.batches) // boolean
   *   console.log('supports authentication', daemonInfo.features.authentication) // boolean
   *   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
   * })
   * ```
   *
   * @returns {external:Promise} A Promise which gets resolved once connected to the Daemon, or gets rejected with either:
   * - [jet.ConnectionClosed](#module:errors~ConnectionClosed)
   * - [jet.InvalidUser](#module:errors~InvalidUser)
   * - [jet.InvalidPassword](#module:errors~InvalidPassword)
   *
   * @example
   * var peer = new jet.Peer({url: 'ws://jetbus.io:8012'})
   * peer.connect().then(function() {
   *   console.log('connected')
   * }).catch(function(err) {
   *   console.log('connect failed', err)
   * })
   */
  connect = (controller: AbortController = new AbortController()) =>
    this.#jsonrpc
      .connect(controller)
      .then(() => this.#info())
      .then((daemonInfo) => {
        this.#daemonInfo = daemonInfo || fallbackDaemonInfo;
        this.#jsonrpc.sendImmedeate =
          !this.#daemonInfo.features?.batches || true;
        return Promise.resolve();
      });

  /**
   * Close the connection to the Daemon. All associated States and Methods are automatically
   * removed by the Daemon.
   *
   * @returns {external:Promise}
   *
   */
  close = () => this.#jsonrpc.close();

  /**
   * Batch operations wrapper. Issue multiple commands to the Daemon
   * in one message batch. Only required for performance critical actions.
   *
   * @param {function} action A function performing multiple peer actions.
   *
   */
  batch = (action: () => void) => {
    if (this.#daemonInfo.features?.batches) {
      this.#jsonrpc.sendImmedeate = false;
    }
    action();
    this.#jsonrpc.sendImmedeate = true;
    return this.#jsonrpc.send();
  };

  /**
   * Get {State}s and/or {Method}s defined by a Peer.
   *
   * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
   * @returns {external:Promise}
   */
  get = (expression: JsonParams) =>
    this.#jsonrpc.sendRequest("get", expression);

  /**
   * Adds a state or method to the Daemon.
   *
   * @param {(State|Method)} content To content to be added.
   * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
   */
  add = (stateOrMethod: Method | State) => {
    if (isState(stateOrMethod)) {
      stateOrMethod.addListener("change", (newValue) => {
        this.#jsonrpc.sendRequest("change", {
          path: stateOrMethod._path,
          value: newValue,
        });
      });
    }
    return this.#jsonrpc.sendRequest("add", stateOrMethod.toJson()).then(() => {
      this.#routes[stateOrMethod._path] = stateOrMethod;
      return Promise.resolve();
    });
  };

  //TODO
  /**
   * Remove a state or method from the Daemon.
   *
   * @param {State|Method} content The content to be removed.
   * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
   */
  remove = (stateOrMethod: Method | State) =>
    this.#jsonrpc.sendRequest("remove", { path: stateOrMethod.path() });

  /**
   * Call a {Method} defined by another Peer.
   *
   * @param {string} path The unique path of the {Method}.
   * @param {Array} args The arguments provided to the {Method}.
   * @param {object} [options] Options.
   * @param {number} [options.timeout] A timeout for invoking the {Method} after which a timeout error rejects the promise.
   * @returns {external:Promise}
   */
  call = (
    path: string,
    callparams: Array<ValueType> | Record<string, ValueType>,
    options: { timeout?: number } = {}
  ): Promise<Object | null> => {
    const params = { path: path } as JsonParams;
    if (options.timeout) params.timeout = options.timeout;
    if (callparams) params.args = callparams;
    return this.#jsonrpc.sendRequest("call", params);
  };

  /**
   * Info
   * @private
   */
  #info = () => this.#jsonrpc.sendRequest<InfoOptions>("info", {});

  /**
   * Authenticate
   * @private
   */
  // #authenticate = (user: string, password: string | undefined) =>
  //   this.#jsonrpc.send<AccessType>("authenticate", {
  //     user: user,
  //     password: password,
  //   });
  /**
   * Config
   *
   * @private
   */
  configure = (params: JsonParams) =>
    this.#jsonrpc.sendRequest("config", params);

  /**
   * Set a {State} to another value.
   *
   * @param {string} path The unique path to the {State}.
   * @param {*} value The desired new value of the {State}.
   * @param {object} [options] Optional settings
   * @param {number} [options.timeout]
   *
   */
  set = (path: string, value: ValueType) =>
    this.#jsonrpc.sendRequest("set", { path, value });
}

export default Peer;
