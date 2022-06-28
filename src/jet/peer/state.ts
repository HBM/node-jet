"use strict";

import { isDefined, errorObject } from "../utils";
import JsonRPC from "./jsonrpc";

/**
 * Create a Jet State instance
 * @class
 * @classdesc A Jet State associates a unique path with any piece of
 * cohesive data. The data may represent a Database entry, the configuration
 * of a certain part of software or observations of "real" things (through sensors).
 * A State can change its value at any time. It also can provide "behaviour" by providing
 * a "set" event handler. This event handler can do whatever seems appropriate (validation etc) and may
 * result in an auto-posted state change.
 *
 * @param {string} path A unique name, which identifies this State, e.g. 'persons/#23A51'
 * @param {*} initialValue The initial value of the state.
 * @param {object} [access] Access rights for this state. Per default unrestricted access to all Peers.
 *
 */
export const noop = () => {};
export class State {
  _path: any;
  _value: any;
  _access: null;
  _dispatcher: any;
  _isAddedPromise: any;
  _isAddedPromiseResolve!: (value: unknown) => void;
  _isAddedPromiseReject!: (arg0: string) => void;
  jsonrpc!: JsonRPC;
  constructor(path: any, initialValue: any, access = null) {
    this._path = path;
    this._value = initialValue;
    this._access = access;
    this._dispatcher = noop;
    this._isAddedPromise = new Promise((resolve, reject) => {
      this._isAddedPromiseResolve = resolve;
      this._isAddedPromiseReject = reject;
    });
  }

  /**
   * Set callback which accepts any value passed in,
   * automatically assigning it to the state and automatically
   * posting a change event to the Jet Daemon.
   *
   */
  acceptAny = (_: any) => {};

  /**
   * Get the state's unchangable path.
   *
   * @returns {string} The state's path.
   *
   */
  path = () => {
    return this._path;
  };

  /**
   * Replies to a 'set' request. Either set `response.value` or `response.error`.
   * Only required for asynchronous working {State~setCallback}.
   *
   * @function State~reply
   * @param {object} response The response to send to the invoker of the 'set' callback.
   * @param {*} [response.value] The new State's value.
   * @param {Boolean} [response.dontNotify=false] If set to true, no state change is posted.
   * @param {string|object} [response.error] A error message or error object.
   *
   */

  /**
   * A callback handling a remotely issued 'set' request.
   * The callback is free to do whatever is appropriate.
   *
   * ```javascript
   * // a synchronous set callback
   * var john = new State('persons/#12324', {age: 24, name: 'john'})
   * john.on('set', function(newValue) { // callback takes one arg -> synchronous
   *   var prev = this.value()
   *   if (newValue.age !== undefined && newValue.age < prev.age) {
   *     throw 'invalid age'
   *   }
   *   return {
   *     value: {
   *       age: newValue.age || prev.age,
   *       name: newValue.name || prev.name
   *     }
   *   }
   * })
   *
   * ```
   *
   * ```javascript
   * var john = new State('persons/#12324', {age: 24, name: 'john'})
   * john.on('set', function(newValue, reply) { // callback takes two args -> asynchronous
   *   setTimeout(function() {
   *     var prev = this.value()
   *       if (newValue.age !== undefined && newValue.age < prev.age) {
   *         reply({
   *           error: 'invalid age'
   *         })
   *       } else {
   *         reply({
   *           value: {
   *             age: newValue.age || prev.age,
   *             name: newValue.age || prev.age
   *           }
   *         })
   *      }
   *   }, 100)
   * })
   * ```
   *
   * @callback State~setCallback
   * @param {*} newValue The requested new value.
   * @param {State~reply} [reply] If the callback takes two params, the callback is treated to work asynchronously.
   *   To respond to the 'set' request, call reply.
   * @returns {undefined|object} Returning undefined implicitly accepts the
   * requested newValue, assigns it to the state and posts a state change event.
   * Returning an object provides more distinct behaviour using this optional fields
   *   - `value` The new value (defaults to `newValue`), which can be different than the requested one (any type).
   *     Will be assigned to the state and a state change is posted.
   *   - `dontNotify` {Boolean} If set to true, will not automatically post a state change.
   *
   */

  /**
   * Registers an event handler. The only supported event is 'set'.
   *
   * @param {string} event Must be 'set'.
   * @param {State~setCallback} setCallback A callback which is invoked to handle a remotely invoked 'set' request.
   *
   */
  on = (event: string, cb: string | any[]) => {
    if (event === "set") {
      if (cb.length === 1) {
        this._dispatcher = this.createSyncDispatcher(cb);
      } else {
        this._dispatcher = this.createAsyncDispatcher(cb);
      }
      return this;
    } else {
      throw new Error("event not available");
    }
  };

  createSyncDispatcher = (cb: any) => {
    const dispatcher = (message: {
      params: { value: any; valueAsResult: any };
      id: number;
    }) => {
      const value = message.params.value;
      try {
        const result = cb.call(this, value) || {};
        if (isDefined(result.value)) {
          this._value = result.value;
        } else {
          this._value = value;
        }
        /* istanbul ignore else */
        if (isDefined(message.id)) {
          const resp = { id: 0, result: undefined as any };
          resp.id = message.id;
          if (message.params.valueAsResult) {
            resp.result = this._value;
          } else {
            resp.result = true;
          }
          this.jsonrpc.queue(resp);
        }
        /* istanbul ignore else */
        if (!result.dontNotify) {
          this.jsonrpc.queue({
            method: "change",
            id: message.id,
            params: {
              path: this._path,
              value: this._value,
            },
          });
        }
      } catch (err) {
        /* istanbul ignore else */
        if (isDefined(message.id)) {
          this.jsonrpc.queue({
            id: message.id,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatcher;
  };

  createAsyncDispatcher = (cb: any) => {
    const dispatch = (message: {
      params: { value: any; valueAsResult: any };
      id: any;
    }) => {
      const value = message.params.value;
      const mid = message.id;
      const reply = (resp: { value?: any; error?: any; dontNotify?: any }) => {
        resp = resp || {};
        if (isDefined(resp.value)) {
          this._value = resp.value;
        } else {
          this._value = value;
        }
        if (isDefined(mid)) {
          const response = {
            id: mid,
            result: undefined as any,
            error: undefined,
          };
          if (!isDefined(resp.error)) {
            if (message.params.valueAsResult) {
              response.result = this._value;
            } else {
              response.result = true;
            }
          } else {
            response.error = errorObject(resp.error);
          }
          this.jsonrpc.queue(response);
        }
        if (!isDefined(resp.error) && !isDefined(resp.dontNotify)) {
          this.jsonrpc.queue({
            method: "change",
            id: message.id,
            params: {
              path: this._path,
              value: this._value,
            },
          });
        }
        this.jsonrpc.flush();
      };
      try {
        cb.call(this, value, reply);
      } catch (err) {
        if (isDefined(mid)) {
          this.jsonrpc.queue({
            id: mid,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatch;
  };

  add = () => {
    const addDispatcher = (success: any) => {
      if (success) {
        this.jsonrpc.addRequestDispatcher(this._path, this._dispatcher);
        this._isAddedPromiseResolve(null);
      } else {
        this._isAddedPromise.catch(() => {});
        this._isAddedPromiseReject("add failed");
      }
    };
    const params = {
      path: this._path,
      value: this._value,
      access: this._access,
      fetchOnly: false,
    };
    if (this._dispatcher === noop) {
      params.fetchOnly = true;
    }
    return this.jsonrpc.service("add", params, addDispatcher);
  };

  remove = () => {
    const params = {
      path: this._path,
    };
    const removeDispatcher = (success: any) => {
      if (success) {
        this._isAddedPromise = new Promise((resolve, reject) => {
          this._isAddedPromiseResolve = resolve;
          this._isAddedPromiseReject = reject;
        });
        this.jsonrpc.removeRequestDispatcher(this._path);
      }
    };
    return this.jsonrpc.service("remove", params, removeDispatcher);
  };

  isAdded = () => {
    return this.jsonrpc.hasRequestDispatcher(this._path);
  };

  value = (newValue: any, notAsNotification: any) => {
    if (isDefined(newValue)) {
      this._value = newValue;
      return this._isAddedPromise.then(() => {
        return this.jsonrpc.service(
          "change",
          {
            path: this._path,
            value: newValue,
          },
          undefined,
          !notAsNotification
        );
      });
    } else {
      return this._value;
    }
  };
}

export default State;
