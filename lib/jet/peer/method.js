'use strict'

var jetUtils = require('../utils')

/**
 * Helpers
 */
var isDef = jetUtils.isDefined
var errorObject = jetUtils.errorObject

/**
 * Method
 */

var Method = function (path, access) {
  this._path = path
  this._access = access
}

Method.prototype.on = function (event, cb) {
  if (event === 'call') {
    if (cb.length <= 1) {
      this._dispatcher = this.createSyncDispatcher(cb)
    } else {
      this._dispatcher = this.createAsyncDispatcher(cb)
    }
    return this
  } else {
    throw new Error('event not available')
  }
}

Method.prototype.createSyncDispatcher = function (cb) {
  var that = this

  var dispatch = function (message) {
    var params = message.params
    var result
    var err
    try {
      result = cb.call(that, params)
    } catch (e) {
      err = e
    }
    var mid = message.id
    /* istanbul ignore else */
    if (isDef(mid)) {
      if (!isDef(err)) {
        that.jsonrpc.queue({
          id: mid,
          result: result !== undefined ? result : {}
        })
      } else {
        that.jsonrpc.queue({
          id: mid,
          error: errorObject(err)
        })
      }
    }
  }
  return dispatch
}

Method.prototype.createAsyncDispatcher = function (cb) {
  var that = this
  var dispatch = function (message) {
    var mid = message.id
    var reply = function (resp) {
      resp = resp || {}
      if (isDef(mid)) {
        var response = {
          id: mid
        }
        if (isDef(resp.result) && !isDef(resp.error)) {
          response.result = resp.result
        } else if (isDef(resp.error)) {
          response.error = errorObject(resp.error)
        } else {
          response.error = errorObject('jet.peer Invalid async method response ' + that._path)
        }
        that.jsonrpc.queue(response)
        that.jsonrpc.flush()
      }
    }

    var params = message.params

    try {
      cb.call(that, params, reply)
    } catch (err) {
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

Method.prototype.path = function () {
  return this._path
}

Method.prototype.add = function () {
  var that = this
  var addDispatcher = function (success) {
    if (success) {
      that.jsonrpc.addRequestDispatcher(that._path, that._dispatcher)
    }
  }
  var params = {
    path: this._path,
    access: this._access
  }
  return this.connectPromise.then(function () {
    return that.jsonrpc.service('add', params, addDispatcher)
  })
}

Method.prototype.remove = function () {
  var that = this
  var params = {
    path: this._path
  }
  var removeDispatcher = function () {
    that.jsonrpc.removeRequestDispatcher(that._path, that._dispatcher)
  }
  return this.connectPromise.then(function () {
    return that.jsonrpc.service('remove', params, removeDispatcher)
  })
}

Method.prototype.isAdded = function () {
  return this.jsonrpc.hasRequestDispatcher(this._path)
}

module.exports = Method
