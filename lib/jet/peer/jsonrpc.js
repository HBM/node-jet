'use strict'

const MessageSocket = typeof window === 'undefined' && require('../message-socket').MessageSocket
const WebSocket = global.WebSocket || (typeof window !== 'undefined' && window.WebSocket) || require('ws') // eslint-disable-line no-use-before-define
const jetUtils = require('../utils')
const errors = require('../errors')

/**
 * Helper shorthands.
 */
const encode = JSON.stringify
const decode = JSON.parse
const isDef = jetUtils.isDefined
const errorObject = jetUtils.errorObject

/**
 * Adds a function ("hook") to callbacks[callbackName]
 *
 * "hook" is executed before the original
 * callbacks[callbackName] function if defined,
 * or installs "hook" as callbacks[callbackName].
 * @private
 */
const addHook = function (callbacks, callbackName, hook) {
  if (callbacks[callbackName]) {
    const orig = callbacks[callbackName]
    callbacks[callbackName] = function (result) {
      hook(result)
      orig(result)
    }
  } else {
    callbacks[callbackName] = hook
  }
}

/**
 * JsonRPC constructor.
 * @private
 */
const JsonRPC = function (config) {
  if (config.url || (typeof (window) !== 'undefined')) {
    const url = config.url || ('ws://' + window.location.host)
    this.sock = new WebSocket(url, 'jet', config)
  } else {
    this.sock = new MessageSocket(config.port || 11122, config.ip)
  }
  this.config = config
  this.messages = []
  this.willFlush = false
  this.requestDispatchers = {}
  this.responseDispatchers = {}
  this.id = 0

  const that = this

  this.closedPromise = new Promise(function (resolve) {
    that.resolveClosed = resolve
  })

  this.connectPromise = new Promise(function (resolve, reject) {
    that.resolveConnect = resolve
    that.rejectConnect = reject
  })

  // make sure event handlers have the same context
  this._dispatchMessage = this._dispatchMessage.bind(this)
  this._dispatchSingleMessage = this._dispatchSingleMessage.bind(this)
  this._dispatchResponse = this._dispatchResponse.bind(this)
  this._dispatchRequest = this._dispatchRequest.bind(this)
  this._dispatchClose = this._dispatchClose.bind(this)
  this._dispatchOpen = this._dispatchOpen.bind(this)

  this.sock.addEventListener('message', this._dispatchMessage)
  this.sock.addEventListener('close', this._dispatchClose)
  this.sock.addEventListener('error', function () {}) // swallow errors, closed event is emitted too
  this.sock.addEventListener('open', this._dispatchOpen)
}

JsonRPC.prototype._dispatchOpen = function () {
  /* istanbul ignore else */
  if (!this._isClosed) {
    this._isOpened = true
    this.resolveConnect()
  }
}

JsonRPC.prototype._dispatchClose = function () {
  this._isClosed = true
  const err = new errors.ConnectionClosed()
  /* istanbul ignore else */
  if (!this._isOpened) {
    this.rejectConnect(err)
  }
  for (const id in this.responseDispatchers) {
    const callbacks = this.responseDispatchers[id]
    /* istanbul ignore else */
    if (callbacks.error) {
      callbacks.error(err)
    }
  }
  this.responseDisptachers = {}
  this.resolveClosed()
}

JsonRPC.prototype.connect = function () {
  return this.connectPromise
}

JsonRPC.prototype.closed = function () {
  return this.closedPromise
}

/**
 * _dispatchMessage
 *
 * @api private
 */
JsonRPC.prototype._dispatchMessage = function (event) {
  const message = event.data
  let decoded
  try {
    decoded = decode(message)
  } catch (err) {
    /* istanbul ignore else */
    if (this.config.onReceive) {
      this.config.onReceive(message, null)
    }
    throw err
  }

  this.willFlush = true
  /* istanbul ignore else */
  if (this.config.onReceive) {
    this.config.onReceive(message, decoded)
  }
  if (Array.isArray(decoded)) {
    decoded.forEach(function (singleMessage) {
      this._dispatchSingleMessage(singleMessage)
    })
  } else {
    this._dispatchSingleMessage(decoded)
  }
  this.flush()
}

/**
 * _dispatchSingleMessage
 *
 * @api private
 */
JsonRPC.prototype._dispatchSingleMessage = function (message) {
  if (message.method && message.params) {
    this._dispatchRequest(message)
  } else if (typeof message.result !== 'undefined' || typeof message.error !== 'undefined') {
    this._dispatchResponse(message)
  }
}

/**
 * _dispatchResponse
 *
 * @api private
 */
JsonRPC.prototype._dispatchResponse = function (message) {
  const mid = message.id
  const callbacks = this.responseDispatchers[mid]
  delete this.responseDispatchers[mid]
  /* istanbul ignore else */
  if (callbacks) {
    /* istanbul ignore else */
    if (typeof message.result !== 'undefined' && callbacks.success) {
      callbacks.success(message.result)
    } else if (isDef(message.error) && callbacks.error) {
      const err = errors.createTypedError(message.error)
      callbacks.error(err || message.error)
    }
  }
}

/**
 * _dispatchRequest.
 * Handles both method calls and fetchers (notifications)
 *
 * @api private
 */
JsonRPC.prototype._dispatchRequest = function (message) {
  const dispatcher = this.requestDispatchers[message.method]

  try {
    dispatcher(message)
  } catch (err) {
    /* istanbul ignore if */
    if (isDef(message.id)) {
      this.queue({
        id: message.id,
        error: errorObject(err)
      })
    }
  }
}

/**
 * Queue.
 */
JsonRPC.prototype.queue = function (message) {
  this.messages.push(message)
}

/**
 * Flush.
 */
JsonRPC.prototype.flush = function () {
  let encoded
  if (this.messages.length === 1) {
    encoded = encode(this.messages[0])
  } else if (this.messages.length > 1) {
    encoded = encode(this.messages)
  }
  if (encoded) {
    /* istanbul ignore else */
    if (this.config.onSend) {
      this.config.onSend(encoded, this.messages)
    }
    this.sock.send(encoded)
    this.messages.length = 0
  }
  this.willFlush = false
}

/**
 * AddRequestDispatcher.
 */
JsonRPC.prototype.addRequestDispatcher = function (id, dispatch) {
  this.requestDispatchers[id] = dispatch
}

/**
 * RemoveRequestDispatcher.
 */
JsonRPC.prototype.removeRequestDispatcher = function (id) {
  delete this.requestDispatchers[id]
}

/**
 * HasRequestDispatcher.
 */
JsonRPC.prototype.hasRequestDispatcher = function (id) {
  return isDef(this.requestDispatchers[id])
}

/**
 * Service.
 */
JsonRPC.prototype.service = function (method, params, complete, asNotification) {
  const that = this
  return new Promise(function (resolve, reject) {
    if (that._isClosed) {
      reject(new errors.ConnectionClosed())
    } else {
      let rpcId
      // Only make a Request, if callbacks are specified.
      // Make complete call in case of success.
      // If no id is specified in the message, no Response
      // is expected, aka Notification.
      if (!asNotification) {
        rpcId = that.id
        that.id = that.id + 1
        const callbacks = {
          success: resolve,
          error: reject
        }
        /* istanbul ignore else */
        if (complete) {
          addHook(callbacks, 'success', function (result) {
            complete(true, result)
          })
          addHook(callbacks, 'error', function () {
            complete(false)
          })
        }
        that.responseDispatchers[rpcId] = callbacks
      } else {
        // There will be no response, so call complete either way
        // and hope everything is ok
        if (complete) {
          complete(true)
        }
      }
      const message = {
        id: rpcId,
        method: method,
        params: params
      }
      if (that.willFlush) {
        that.queue(message)
      } else {
        const encoded = encode(message)
        if (that.config.onSend) {
          that.config.onSend(encoded, [message])
        }
        that.sock.send(encode(message))
      }
      if (asNotification) {
        resolve()
      }
    }
  })
}

/**
 * Batch.
 */
JsonRPC.prototype.batch = function (action) {
  this.willFlush = true
  action()
  this.flush()
}

/**
 * Close.
 */
JsonRPC.prototype.close = function () {
  if (!this._isClosed) {
    this._isClosed = true
    this.flush()
    this.sock.close()
  }
  return this.closedPromise
}

module.exports = JsonRPC
