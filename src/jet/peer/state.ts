"use strict";

import { isDefined, errorObject } from "../utils";

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
  _path;
  _value;
  _access;
  _dispatcher;
  _isAddedPromise;
  _isAddedPromiseResolve;
  _isAddedPromiseReject;
  jsonrpc;
  constructor(path, initialValue, access = null) {
    this._path = path;
    this._value = initialValue;
    this._access = access;
    this._dispatcher = noop;
    const that = this;
    this._isAddedPromise = new Promise((resolve, reject) => {
      that._isAddedPromiseResolve = resolve;
      that._isAddedPromiseReject = reject;
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
  on = (event, cb) => {
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

  createSyncDispatcher = (cb) => {
    const that = this;
    const dispatcher = (message) => {
      const value = message.params.value;
      try {
        const result = cb.call(that, value) || {};
        if (isDefined(result.value)) {
          that._value = result.value;
        } else {
          that._value = value;
        }
        /* istanbul ignore else */
        if (isDefined(message.id)) {
          const resp = { id: 0, result: undefined as any };
          resp.id = message.id;
          if (message.params.valueAsResult) {
            resp.result = that._value;
          } else {
            resp.result = true;
          }
          that.jsonrpc.queue(resp);
        }
        /* istanbul ignore else */
        if (!result.dontNotify) {
          that.jsonrpc.queue({
            method: "change",
            params: {
              path: that._path,
              value: that._value,
            },
          });
        }
      } catch (err) {
        /* istanbul ignore else */
        if (isDefined(message.id)) {
          that.jsonrpc.queue({
            id: message.id,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatcher;
  };

  createAsyncDispatcher = (cb) => {
    const that = this;

    const dispatch = (message) => {
      const value = message.params.value;
      const mid = message.id;
      const reply = (resp) => {
        resp = resp || {};
        if (isDefined(resp.value)) {
          that._value = resp.value;
        } else {
          that._value = value;
        }
        /* istanbul ignore else */
        if (isDefined(mid)) {
          const response = {
            id: mid,
            result: undefined as any,
            error: undefined,
          };
          if (!isDefined(resp.error)) {
            if (message.params.valueAsResult) {
              response.result = that._value;
            } else {
              response.result = true;
            }
          } else {
            response.error = errorObject(resp.error);
          }
          that.jsonrpc.queue(response);
        }
        /* istanbul ignore else */
        if (!isDefined(resp.error) && !isDefined(resp.dontNotify)) {
          that.jsonrpc.queue({
            method: "change",
            params: {
              path: that._path,
              value: that._value,
            },
          });
        }
        that.jsonrpc.flush(resp.dontNotify);
      };
      try {
        cb.call(that, value, reply);
      } catch (err) {
        /* istanbul ignore else */
        if (isDefined(mid)) {
          that.jsonrpc.queue({
            id: mid,
            error: errorObject(err),
          });
        }
      }
    };
    return dispatch;
  };

  add = () => {
    const that = this;
    const addDispatcher = (success) => {
      if (success) {
        that.jsonrpc.addRequestDispatcher(that._path, that._dispatcher);
        that._isAddedPromiseResolve();
      } else {
        that._isAddedPromise.catch(() => {});
        that._isAddedPromiseReject("add failed");
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
    return that.jsonrpc.service("add", params, addDispatcher);
  };

  remove = () => {
    const that = this;
    const params = {
      path: this._path,
    };
    const removeDispatcher = (success) => {
      /* istanbul ignore else */
      if (success) {
        that._isAddedPromise = new Promise((resolve, reject) => {
          that._isAddedPromiseResolve = resolve;
          that._isAddedPromiseReject = reject;
        });
        that.jsonrpc.removeRequestDispatcher(that._path, that._dispatcher);
      }
    };
    return that.jsonrpc.service("remove", params, removeDispatcher);
  };

  isAdded = () => {
    return this.jsonrpc.hasRequestDispatcher(this._path);
  };

  value = (newValue, notAsNotification) => {
    if (isDefined(newValue)) {
      this._value = newValue;
      const that = this;
      return this._isAddedPromise.then(() => {
        return that.jsonrpc.service(
          "change",
          {
            path: that._path,
            value: newValue,
          },
          null,
          !notAsNotification
        );
      });
    } else {
      return this._value;
    }
  };
}

export default State;
