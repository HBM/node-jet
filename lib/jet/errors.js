'use strict'

var INVALID_PARAMS_CODE = -32602
var INTERNAL_ERROR_CODE = -32603
var RESPONSE_TIMEOUT_CODE = -32001

exports.invalidParams = function (data) {
  return {
    message: 'Invalid params',
    code: INVALID_PARAMS_CODE,
    data: data
  }
}

exports.methodNotFound = function (data) {
  return {
    message: 'Method not found',
    code: -32601,
    data: data
  }
}

exports.invalidRequest = function (data) {
  return {
    message: 'Invalid Request',
    code: -32600,
    data: data
  }
}

exports.responseTimeout = function (data) {
  return {
    message: 'Response Timeout',
    code: RESPONSE_TIMEOUT_CODE,
    data: data
  }
}

/**
 * @module errors
 * @desc
 *
 * A pseudo-module for grouping all error classes.
 *
 * All error classes are available as members of the Jet module
 *
 * ```javascript
 * var jet = require('node-jet')
 * var err = new jet.InvalidArguments('wrong type')
 * ```
 *
 */

/**
 * @class
 * @classdesc
 * The base class for all jet errors.
 *
 */
var BaseError = function (name, message, stack) {
  var tmp = Error.call(this, message)
  tmp.name = this.name = 'jet.' + name
  this.message = tmp.message
  var errorUrlBase = 'https://github.com/lipp/node-jet/blob/master/doc/peer.markdown'
  var url = errorUrlBase + '#jet' + name.toLowerCase()
  this.url = tmp.url = url
  Object.defineProperty(this, 'stack', {
    get: function () {
      return stack || 'no remote stack'
    }
  })
  return this
}

/**
 * A url which points to a website describing the error in more depth.
 * @var {string} url
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The class name of the error
 * @var {string} name
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The error message.
 * @var {string} message
 * @memberof module:errors~BaseError.prototype
 *
 */

/**
 * The (remote) stacktrace of the exception.
 * @var {string} stack
 * @memberof module:errors~BaseError.prototype
 *
 */

BaseError.prototype = Object.create(Error.prototype)

var DaemonError = function (msg) {
  BaseError.call(this, 'DaemonError', msg)
}

DaemonError.prototype = Object.create(BaseError.prototype)

exports.DaemonError = DaemonError
exports.BaseError = BaseError

/**
 * Creates a new instance.
 * @classdesc The Peer processing the 'set' or 'get' request threw an error during dispatching the request.
 * @class
 * @augments module:errors~BaseError
 *
 */
var PeerError = function (err) {
  BaseError.call(this, 'PeerError', err.message, err.stack)
}

PeerError.prototype = Object.create(BaseError.prototype)
exports.PeerError = PeerError

/**
 * Creates a new instance.
 * @classdesc The user (name) provided is not registered at the Daemon.
 * @class
 * @augments module:errors~BaseError
 *
 */
var InvalidUser = function () {
  BaseError.call(this, 'InvalidUser', 'The specified user does not exist')
}

InvalidUser.prototype = Object.create(BaseError.prototype)
exports.InvalidUser = InvalidUser

/**
 * Creates a new instance.
 * @classdesc The password provided for the user is not correct.
 * @class
 * @augments module:errors~BaseError
 *
 */
var InvalidPassword = function () {
  BaseError.call(this, 'InvalidPassword', 'The specified password is wrong')
}

InvalidPassword.prototype = Object.create(BaseError.prototype)
exports.InvalidPassword = InvalidPassword

/**
 * Creates a new instance.
 * @classdesc The peer (user/password) is not authorized to perform the requested action.
 * @class
 * @augments module:errors~BaseError
 *
 */
var Unauthorized = function () {
  BaseError.call(this, 'Unauthorized', 'The request is not authorized for the user')
}

Unauthorized.prototype = Object.create(BaseError.prototype)
exports.Unauthorized = Unauthorized

/**
 * Creates a new instance.
 * @classdesc The connection to the specified endpoint could not be established or has been closed.
 * @class
 * @augments module:errors~BaseError
 *
 */
var ConnectionClosed = function (err) {
  BaseError.call(this, 'ConnectionClosed', err)
}

ConnectionClosed.prototype = Object.create(BaseError.prototype)
exports.ConnectionClosed = ConnectionClosed

/**
 * Creates a new instance.
 * @classdesc The State or Method specified by `path` has not been added to the Daemon. One
 * could `fetch` the respective State or Method to wait until it becomes available.
 * @class
 * @augments module:errors~BaseError
 *
 */
var NotFound = function () {
  BaseError.call(this, 'NotFound', 'No State/Method matching the specified path')
}

NotFound.prototype = Object.create(BaseError.prototype)
exports.NotFound = NotFound

/**
 * Creates a new instance.
 * @classdesc The provided arguments for 'set' or 'call' have been refused by the State or Method.
 * @class
 * @param {string} [message] A custom error message to forward to the requestor.
 * @augments module:errors~BaseError
 *
 */
var InvalidArgument = function (msg) {
  BaseError.call(this, 'InvalidArgument', msg || 'The provided argument(s) have been refused by the State/Method')
}

InvalidArgument.prototype = Object.create(BaseError.prototype)
exports.InvalidArgument = InvalidArgument

/**
 * Creates a new instance.
 * @classdesc The Peer processing the 'set' or 'call' request has not answered within the specified `timeout`.
 * @class
 * @augments module:errors~BaseError
 *
 */
var PeerTimeout = function () {
  BaseError.call(this, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout')
}

PeerTimeout.prototype = Object.create(BaseError.prototype)
exports.PeerTimeout = PeerTimeout

/**
 * Creates a new instance.
 * @classdesc The state or method cannot be added to the Daemon because another state or method with the
 * same `path` already exists.
 * @class
 * @augments module:errors~BaseError
 *
 */
var Occupied = function () {
  BaseError.call(this, 'Occupied', 'A State/Method with the same path has already been added')
}

Occupied.prototype = Object.create(BaseError.prototype)
exports.Occupied = Occupied

/**
 * Creates a new instance.
 * @classdesc The state or method is fetch-only (aka read-only).
 * @class
 * @augments module:errors~BaseError
 *
 */
var FetchOnly = function () {
  BaseError.call(this, 'FetchOnly', 'The State cannot be modified')
}

FetchOnly.prototype = Object.create(BaseError.prototype)
exports.FetchOnly = FetchOnly

exports.createTypedError = function (jsonrpcError) {
  var code = jsonrpcError.code
  var data = jsonrpcError.data
  var dataType = typeof data
  if (code === INVALID_PARAMS_CODE) {
    if (dataType === 'object') {
      if (data.pathNotExists) {
        return new NotFound()
      } else if (data.pathAlreadyExists) {
        return new Occupied()
      } else if (data.fetchOnly) {
        return new FetchOnly()
      } else if (data.invalidUser) {
        return new InvalidUser()
      } else if (data.invalidPassword) {
        return new InvalidPassword()
      } else if (data.invalidArgument) {
        return new InvalidArgument(data.invalidArgument && data.invalidArgument.message)
      } else if (data.noAccess) {
        return new Unauthorized()
      }
    }
  } else if (code === RESPONSE_TIMEOUT_CODE) {
    return new PeerTimeout()
  } else if (code === INTERNAL_ERROR_CODE) {
    return new PeerError(data)
  }
}
