"use strict";

import { InfoOptions } from "../daemon";
import { AccessType, ValueType } from "../types";

import JsonRPC, { JsonRpcConfig } from "../../2_jsonrpc";
import EventEmitter from "events";
import { Socket } from "../../1_socket";
import Method from "./method";
import State from "./state";
import Fetcher from "./fetcher";
import { CallRequest } from "../messages";
import { logger, Logger } from "../log";

const fallbackDaemonInfo: InfoOptions = {
  name: "unknown-daemon",
  version: "0.0.0",
  protocolVersion: "1.0.0",
  features: {
    fetch: "full",
    authentication: false,
    batches: true,
  },
};
export interface JsonParams {
  path?: string | Record<string, string | string[]>;
  args?: object;
  timeout?: number;
  user?: string;
  password?: string;
  value?: ValueType;
  valueAsResult?: boolean;
  id?: string;
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

// const genPeerId = (sock: Socket): string => {
//   if (sock instanceof netImpl.Socket) {
//     return sock.remoteAddress + ":" + sock.remotePort;
//   } else {
//     // this is a websocket
//     try {
//       sock = sock._sender._socket;
//       return `${sock.remoteAddress}:${sock.remotePort}`;
//     } catch (e) {
//       return uuidv4();
//     }
//   }
// };

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
export class Peer extends EventEmitter.EventEmitter {
  _id: string = "";
  name: string = "";
  config: PeerConfig;
  jsonrpc: JsonRPC;
  daemonInfo: InfoOptions = fallbackDaemonInfo;
  access?: AccessType;
  routes: Record<string, Method | State> = {};
  log: Logger;
  constructor(config?: PeerConfig, sock?: Socket) {
    super();
    this.config = config || {};
    this.log = new Logger(this.config.log);
    this.jsonrpc = new JsonRPC(config, sock);
    this.jsonrpc.addListener("message", (method: string, m: any) => {
      this.log.debug(`${method} request`);
      let state: State;
      switch (method) {
        case "get":
          state = this.routes[m.params.path] as State;
          this.jsonrpc.respond(
            m.id,
            { path: state._path, value: state._value },
            true
          );
          break;
        case "set":
          state = this.routes[m.params.path] as State;
          state.value(m.params.value);
          this.jsonrpc.respond(m.id, {}, true);
          break;
        case "call":
          const method = this.routes[m.params.path] as Method;
          method.call(m.params.args);
          this.jsonrpc.respond(m.id, {}, true);
          break;
      }
    });
  }

  unfetch = (_fetcher: Fetcher) => {
    //TODO
  };
  fetch = (fetcher: Fetcher) => {
    this.jsonrpc.addListener("message", (method: string, m: any) => {
      if (fetcher.message.id === method) {
        fetcher.emit("data", m.params);
      }
    });
    return this.jsonrpc.send(
      "fetch",
      fetcher.message.params,
      fetcher.message.id
    );
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
   *   onsole.log('can process JSON-RPC batches', daemonInfo.features.batches) // boolean
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
  connect = () =>
    this.jsonrpc
      .connect()
      .then(() => this.info())
      .then((daemonInfo) => {
        this.daemonInfo = daemonInfo || fallbackDaemonInfo;
        if (this.config.user) {
          this.authenticate(this.config.user, this.config.password)
            .then((access) => {
              this.access = access || {};
              return Promise.resolve();
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        } else {
          return Promise.resolve();
        }
      })
      .catch((err) => {
        return Promise.reject(err);
      });

  /**
   * Close the connection to the Daemon. All associated States and Methods are automatically
   * removed by the Daemon.
   *
   * @returns {external:Promise}
   *
   */
  close = () => this.jsonrpc.close();

  /**
   * Batch operations wrapper. Issue multiple commands to the Daemon
   * in one message batch. Only required for performance critical actions.
   *
   * @param {function} action A function performing multiple peer actions.
   *
   */
  batch = (action: () => void) => this.jsonrpc.batch(action);

  /**
   * Get {State}s and/or {Method}s defined by a Peer.
   *
   * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
   * @returns {external:Promise}
   */
  get = (expression: JsonParams) => this.jsonrpc.send("get", expression);

  isState = (stateOrMethod: State | Method): stateOrMethod is State => {
    return "_value" in stateOrMethod;
  };
  /**
   * Adds a state or method to the Daemon.
   *
   * @param {(State|Method)} content To content to be added.
   * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
   */
  add = (stateOrMethod: Method | State) => {
    if (this.isState(stateOrMethod)) {
      const params = {
        path: stateOrMethod._path,
        value: stateOrMethod._value,
        access: stateOrMethod._access,
        fetchOnly: false,
      };
      return this.jsonrpc.send("add", params).then(() => {
        stateOrMethod.addListener("set", (newValue) => {
          this.jsonrpc.send("change", {
            path: stateOrMethod._path,
            value: newValue,
          });
        });
        this.routes[stateOrMethod._path] = stateOrMethod;
      });
    } else {
      const params = {
        path: stateOrMethod._path,
        access: stateOrMethod._access,
      };
      return this.jsonrpc.send("add", params).then(() => {
        this.routes[stateOrMethod._path] = stateOrMethod;
      });
    }
  };

  //TODO
  /**
   * Remove a state or method from the Daemon.
   *
   * @param {State|Method} content The content to be removed.
   * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
   */
  remove = (stateOrMethod: Method | State) => {
    this.jsonrpc.send("remove", { path: stateOrMethod.path() });
  };

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
    callparams: CallRequest,
    options: { timeout?: number } = {}
  ): Promise<Object | null> => {
    const params = {
      path: path,
      args: callparams || [],
      timeout: options.timeout, // optional
    } as JsonParams;
    return this.jsonrpc.send("call", params);
  };

  /**
   * Info
   * @private
   */
  info = () => this.jsonrpc.send<InfoOptions>("info", {});

  /**
   * Authenticate
   * @private
   */
  authenticate = (user: string, password: string | undefined) =>
    this.jsonrpc.send<AccessType>("authenticate", {
      user: user,
      password: password,
    });
  /**
   * Config
   *
   * @private
   */
  configure = (params: JsonParams) => this.jsonrpc.send("config", params);

  /**
   * Set a {State} to another value.
   *
   * @param {string} path The unique path to the {State}.
   * @param {*} value The desired new value of the {State}.
   * @param {object} [options] Optional settings
   * @param {number} [options.timeout]
   *
   */
  set = (
    path: string,
    value: ValueType,
    options: {
      timeout?: number;
      valueAsResult?: boolean;
      skipResult?: boolean;
    } = {}
  ) => {
    const params = {
      path: path,
      value: value,
      timeout: options.timeout, // optional
      valueAsResult: options.valueAsResult, // optional
    } as JsonParams;
    return this.jsonrpc.send("set", params);
  };
}

export default Peer;
