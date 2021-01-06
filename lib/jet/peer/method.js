'use strict'

const jetUtils = require('../utils')

/**
 * Helpers
 */
const isDef = jetUtils.isDefined
const errorObject = jetUtils.errorObject

/**
 * Method
 */

const Method = function (path, access) {
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
  const that = this

  const dispatch = function (message) {
    const params = message.params
    let result
    let err
    try {
      result = cb.call(that, params)
    } catch (e) {
      err = e
    }
    const mid = message.id
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
  const that = this
  const dispatch = function (message) {
    const mid = message.id
    const reply = function (resp) {
      resp = resp || {}
      if (isDef(mid)) {
        const response = {
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

    const params = message.params

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
  const that = this
  const addDispatcher = function (success) {
    if (success) {
      that.jsonrpc.addRequestDispatcher(that._path, that._dispatcher)
    }
  }
  const params = {
    path: this._path,
    access: this._access
  }
  return this.connectPromise.then(function () {
    return that.jsonrpc.service('add', params, addDispatcher)
  })
}

Method.prototype.remove = function () {
  const that = this
  const params = {
    path: this._path
  }
  const removeDispatcher = function () {
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
