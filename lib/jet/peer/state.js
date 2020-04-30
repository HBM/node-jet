'use strict'

var jetUtils = require('../utils')

/**
 * Helpers
 * @private
 */
var isDef = jetUtils.isDefined
var errorObject = jetUtils.errorObject
var noop = function () {}

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
var State = function (path, initialValue, access) {
  this._path = path
  this._value = initialValue
  this._access = access
  this._dispatcher = noop
  var that = this
  this._isAddedPromise = new Promise(function (resolve, reject) {
    that._isAddedPromiseResolve = resolve
    that._isAddedPromiseReject = reject
  })
}

/**
 * Set callback which accepts any value passed in,
 * automatically assigning it to the state and automatically
 * posting a change event to the Jet Daemon.
 *
 */
State.acceptAny = function (newval) {}

/**
 * Get the state's unchangable path.
 *
 * @returns {string} The state's path.
 *
 */
State.prototype.path = function () {
  return this._path
}

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
State.prototype.on = function (event, cb) {
  if (event === 'set') {
    if (cb.length === 1) {
      this._dispatcher = this.createSyncDispatcher(cb)
    } else {
      this._dispatcher = this.createAsyncDispatcher(cb)
    }
    return this
  } else {
    throw new Error('event not available')
  }
}

State.prototype.createSyncDispatcher = function (cb) {
  var that = this
  var dispatcher = function (message) {
    var value = message.params.value
    try {
      var result = cb.call(that, value) || {}
      if (isDef(result.value)) {
        that._value = result.value
      } else {
        that._value = value
      }
      /* istanbul ignore else */
      if (isDef(message.id)) {
        var resp = {}
        resp.id = message.id
        if (message.params.valueAsResult) {
          resp.result = that._value
        } else {
          resp.result = true
        }
        that.jsonrpc.queue(resp)
      }
      /* istanbul ignore else */
      if (!result.dontNotify) {
        that.jsonrpc.queue({
          method: 'change',
          params: {
            path: that._path,
            value: that._value
          }
        })
      }
    } catch (err) {
      /* istanbul ignore else */
      if (isDef(message.id)) {
        that.jsonrpc.queue({
          id: message.id,
          error: errorObject(err)
        })
      }
    }
  }
  return dispatcher
}

State.prototype.createAsyncDispatcher = function (cb) {
  var that = this

  var dispatch = function (message) {
    var value = message.params.value
    var mid = message.id
    var reply = function (resp) {
      resp = resp || {}
      if (isDef(resp.value)) {
        that._value = resp.value
      } else {
        that._value = value
      }
      /* istanbul ignore else */
      if (isDef(mid)) {
        var response = {
          id: mid
        }
        if (!isDef(resp.error)) {
          if (message.params.valueAsResult) {
            response.result = that._value
          } else {
            response.result = true
          }
        } else {
          response.error = errorObject(resp.error)
        }
        that.jsonrpc.queue(response)
      }
      /* istanbul ignore else */
      if (!isDef(resp.error) && !isDef(resp.dontNotify)) {
        that.jsonrpc.queue({
          method: 'change',
          params: {
            path: that._path,
            value: that._value
          }
        })
      }
      that.jsonrpc.flush(resp.dontNotify)
    }
    try {
      cb.call(that, value, reply)
    } catch (err) {
      /* istanbul ignore else */
      if (isDef(mid)) {
        that.jsonrpc.queue({
          id: mid,
          error: errorObject(err)
        })
      }
    }
  }
  return dispatch
}

State.prototype.add = function () {
  var that = this
  var addDispatcher = function (success) {
    if (success) {
      that.jsonrpc.addRequestDispatcher(that._path, that._dispatcher)
      that._isAddedPromiseResolve()
    } else {
      that._isAddedPromise.catch(function () {})
      that._isAddedPromiseReject('add failed')
    }
  }
  var params = {
    path: this._path,
    value: this._value,
    access: this._access
  }
  if (this._dispatcher === noop) {
    params.fetchOnly = true
  }
  return this.connectPromise.then(function () {
    return that.jsonrpc.service('add', params, addDispatcher)
  })
}

State.prototype.remove = function () {
  var that = this
  var params = {
    path: this._path
  }
  var removeDispatcher = function (success) {
    /* istanbul ignore else */
    if (success) {
      that._isAddedPromise = new Promise(function (resolve, reject) {
        that._isAddedPromiseResolve = resolve
        that._isAddedPromiseReject = reject
      })
      that.jsonrpc.removeRequestDispatcher(that._path, that._dispatcher)
    }
  }
  return this.connectPromise.then(function () {
    return that.jsonrpc.service('remove', params, removeDispatcher)
  })
}

State.prototype.isAdded = function () {
  return this.jsonrpc.hasRequestDispatcher(this._path)
}

State.prototype.value = function (newValue, notAsNotification) {
  if (isDef(newValue)) {
    this._value = newValue
    var that = this
    return this._isAddedPromise.then(function () {
      return that.jsonrpc.service('change', {
        path: that._path,
        value: newValue
      }, null, !notAsNotification)
    })
  } else {
    return this._value
  }
}

module.exports = State
