// @ts-nocheck
"use strict";

import { Method, State } from "../../browser";
import { InfoOptions } from "../daemon";
import { AccessType, ParamType, ValueType } from "../element";
import { Fetcher, iFetcher } from "./fetch";
import JsonRPC from "./jsonrpc";

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
  path?: string;
  args?: object;
  timeout?: number;
  user?: string;
  password?: string;
  value?: ValueType;
  valueAsResult?: boolean;
  id?: string;
}

export interface PeerConfig {
  url?: string;
  ip?: string;
  port?: number;
  name?: string;
  user?: string;
  password?: string;
  onSend?: Function;
  onReceive?: Function;
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
export class Peer {
  config: PeerConfig;
  jsonrpc: JsonRPC;
  daemonInfo?: InfoOptions ;
  connected = false;
  access: AccessType;
  constructor(config: PeerConfig) {
    this.config = config || {};
    this.jsonrpc = new JsonRPC(config);
    this.daemonInfo = fallbackDaemonInfo;
  }

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
  connect = () => {
    if (this.connected) {
      return Promise.reject("Already connected");
    }
    return this.jsonrpc
      .connect()
      .then(() => this.info())
      .then((daemonInfo) => {
        this.daemonInfo = daemonInfo;
        if (this.config.user) {
          this.authenticate(this.config.user, this.config.password)
            .then((access) => {
              this.access = access;
              this.connected = true;
              return Promise.resolve();
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        } else {
          this.connected = true;
          return Promise.resolve();
        }
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  /**
   * Tells if the peer is connected to the daemon
   */
  isConnected = () => this.connected === true;
  /**
   * Close the connection to the Daemon. All associated States and Methods are automatically
   * removed by the Daemon.
   *
   * @returns {external:Promise}
   *
   */
  close = () => {
    this.connected = false;
    return this.jsonrpc.close();
  };

  /**
   * Returns if the connection to the Daemon has been closed
   *
   * @returns {external:Promise}
   *
   */
  closed = () => !this.jsonrpc._isOpen;

  /**
   * Batch operations wrapper. Issue multiple commands to the Daemon
   * in one message batch. Only required for performance critical actions.
   *
   * @param {function} action A function performing multiple peer actions.
   *
   */
  batch = (action: () => void) => {
    this.jsonrpc.batch(action);
  };

  /**
   * Sends a fetch request to the daemon containing the fetch rules
   * defined by `fetcher`.
   *
   * @param {FetchChainer} fetcher A configured fetcher.
   * @param {asNotification} When set we do not want to wait on a result response before handling received add/change events.
   * @returns {external:Promise} Gets resolved as soon as the Daemon has registered the fetch expression.
   */
  fetch = (
    fetcher: Fetcher,
    asNotification = false
  ) => {
    if (this.connected) {
      fetcher.jsonrpc = this.jsonrpc;
      // @ts-ignore
      fetcher.variant = this.daemonInfo.features.fetch;
      return fetcher.fetch(asNotification);
    }
  };
  /**
   * Sends a unfetch request to the daemon
   *
   * @param {FetchChainer} fetcher A previously fetched fetcher.
   * @returns {external:Promise} Gets resolved as soon as the Daemon has unregistered the fetch expression.
   *
   */
  unfetch = (fetcher: iFetcher) => fetcher.unfetch();

  /**
   * Get {State}s and/or {Method}s defined by a Peer.
   *
   * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
   * @returns {external:Promise}
   */
  get = (expression: JsonParams) => this.jsonrpc.service("get", expression);

  /**
   * Adds a state or method to the Daemon.
   *
   * @param {(State|Method)} content To content to be added.
   * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
   */
  add = (stateOrMethod: Method | State) => {
    stateOrMethod.jsonrpc = this.jsonrpc;
    return stateOrMethod.add();
  };

  /**
   * Remove a state or method from the Daemon.
   *
   * @param {State|Method} content The content to be removed.
   * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
   */
  remove = (stateOrMethod: Method | State) => stateOrMethod.remove();

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
    callparams: ParamType,
    options: { timeout?: number; skipResult?: boolean } = {}
  ): Promise<Object | null> => {
    const params = {
      path: path,
      args: callparams || [],
      timeout: options.timeout, // optional
    } as JsonParams;
    const jsonrpc = this.jsonrpc;
    if (this.isConnected())
      return jsonrpc.service("call", params, undefined, options.skipResult);
    else return Promise.reject();
  };

  /**
   * Info
   * @private
   */
  info = () => this.jsonrpc.service("info", {}) as InfoOptions;

  /**
   * Authenticate
   * @private
   */
  authenticate = (user: string, password: string | undefined) =>
    this.jsonrpc.service("authenticate", {
      user: user,
      password: password,
    });
  /**
   * Config
   *
   * @private
   */
  configure = (params: JsonParams) => {
    return this.jsonrpc.service("config", params);
  };

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
    options: { timeout?: number; valueAsResult?: boolean; skipResult?: boolean } ={}
  ) => {
    const params = {
      path: path,
      value: value,
      timeout: options.timeout, // optional
      valueAsResult: options.valueAsResult, // optional
    } as JsonParams;
    return this.jsonrpc.service("set", params, undefined, options.skipResult);
  };
}

export default Peer;
