(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jet = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

/**
 * Export Peer only for browserify
 */

var errors = require('./jet/errors')

module.exports = {
  Peer: require('./jet/peer'),
  State: require('./jet/peer/state'),
  Method: require('./jet/peer/method'),
  Fetcher: require('./jet/peer/fetch-chainer').FetchChainer,
  BaseError: errors.BaseError,
  NotFound: errors.NotFound,
  Occupied: errors.Occupied,
  FetchOnly: errors.FetchOnly,
  ConnectionClosed: errors.ConnectionClosed,
  InvalidUser: errors.InvalidUser,
  InvalidPassword: errors.InvalidPassword,
  PeerTimeout: errors.PeerTimeout,
  InvalidArgument: errors.InvalidArgument,
  PeerError: errors.PeerError,
  Unauthorized: errors.Unauthorized,
  Promise: Promise || (window && window.Promise) || require('bluebird')
}

},{"./jet/errors":4,"./jet/peer":10,"./jet/peer/fetch-chainer":11,"./jet/peer/method":14,"./jet/peer/state":15,"bluebird":20}],2:[function(require,module,exports){
'use strict'

var jetUtils = require('../utils')
var isDefined = jetUtils.isDefined

var intersects = function (arrayA, arrayB) {
  for (var i = 0; i < arrayA.length; ++i) {
    if (arrayB.indexOf(arrayA[i]) !== -1) {
      return true
    }
  }
  return false
}

var grantAccess = function (accessName, access, auth) {
  var groupName = accessName + 'Groups'
  if (access[groupName]) {
    return intersects(access[groupName], auth[groupName])
  } else {
    return true
  }
}

var hasAccess = function (accessName, peer, element) {
  if (!isDefined(element.access)) {
    return true
  } else if (!isDefined(peer.auth)) {
    return false
  } else {
    return grantAccess(accessName, element.access, peer.auth)
  }
}

exports.isFetchOnly = function (peer, element) {
  if (element.fetchOnly) {
    return true
  } else {
    if (isDefined(element.value)) {
      return !hasAccess('set', peer, element)
    } else {
      return !hasAccess('call', peer, element)
    }
  }
}

exports.intersects = intersects
exports.grantAccess = grantAccess
exports.hasAccess = hasAccess

},{"../utils":17}],3:[function(require,module,exports){
'use strict'

var jetUtils = require('./utils')
var access = require('./daemon/access')

var Element = function (eachPeerFetcherWithAccess, owningPeer, params, logError) {
  this.fetchers = {}
  this.fetcherIsReadOnly = {}
  this.eachFetcher = jetUtils.eachKeyValue(this.fetchers)
  var path = this.path = params.path
  var lowerPath = this.lowerPath = path.toLowerCase()
  var value = this.value = params.value
  var fetchOnly = this.fetchOnly = params.fetchOnly
  this.peer = owningPeer
  this.access = params.access

  var fetchers = this.fetchers
  var fetcherIsReadOnly = this.fetcherIsReadOnly
  this.logError = logError

  eachPeerFetcherWithAccess(this, function (peerFetchId, fetcher, hasSetAccess) {
    try {
      var isReadOnly = fetchOnly || !hasSetAccess
      var mayHaveInterest = fetcher(path, lowerPath, 'add', value, isReadOnly)
      if (mayHaveInterest) {
        fetchers[peerFetchId] = fetcher
        fetcherIsReadOnly[peerFetchId] = isReadOnly
      }
    } catch (err) {
      logError(err)
    }
  })
}

Element.prototype._publish = function (event) {
  var lowerPath = this.lowerPath
  var value = this.value
  var path = this.path
  var isReadOnly = this.fetcherIsReadOnly
  var logError = this.logError
  this.eachFetcher(function (id, fetcher) {
    try {
      fetcher(path, lowerPath, event, value, isReadOnly[id])
    } catch (err) {
      logError(err)
    }
  })
}

Element.prototype.change = function (value) {
  this.value = value
  this._publish('change')
}

Element.prototype.remove = function () {
  this._publish('remove')
}

Element.prototype.addFetcher = function (id, fetcher, isReadOnly) {
  this.fetchers[id] = fetcher
  this.fetcherIsReadOnly[id] = isReadOnly
}

Element.prototype.removeFetcher = function (id) {
  delete this.fetchers[id]
  delete this.fetcherIsReadOnly[id]
}

var Elements = function (log) {
  this.instances = {}
  this.log = log || console.log
  this.logError = this.logError.bind(this)
  this.each = jetUtils.eachKeyValue(this.instances)
}

Elements.prototype.logError = function (err) {
  this.log('fetcher failed:', err)
  this.log('Trace:', err.stack)
}

Elements.prototype.add = function (peers, owningPeer, params) {
  var path = params.path
  if (this.instances[path]) {
    throw jetUtils.invalidParams({
      pathAlreadyExists: path
    })
  } else {
    this.instances[path] = new Element(peers, owningPeer, params, this.logError)
  }
}

Elements.prototype.get = function (path) {
  var el = this.instances[path]
  if (!el) {
    throw jetUtils.invalidParams({
      pathNotExists: path
    })
  } else {
    return el
  }
}

Elements.prototype.change = function (path, value, peer) {
  var el = this.get(path)
  if (el.peer !== peer) {
    throw jetUtils.invalidParams({
      foreignPath: path
    })
  } else {
    el.change(value)
  }
}

Elements.prototype.removePeer = function (peer) {
  var toDelete = []
  this.each(function (path, element) {
    if (element.peer === peer) {
      element.remove(path)
      toDelete.push(path)
    }
  })
  var instances = this.instances
  toDelete.forEach(function (path) {
    delete instances[path]
  })
}

Elements.prototype.remove = function (path, peer) {
  var el = this.get(path)
  if (el.peer !== peer) {
    throw jetUtils.invalidParams({
      foreignPath: path
    })
  }
  el.remove()
  delete this.instances[path]
}

Elements.prototype.addFetcher = function (id, fetcher, peer) {
  var logError = this.logError
  this.each(function (path, element) {
    if (access.hasAccess('fetch', peer, element)) {
      var mayHaveInterest
      try {
        var isReadOnly = access.isFetchOnly(peer, element)
        mayHaveInterest = fetcher(
          path,
          path.toLowerCase(),
          'add',
          element.value,
          isReadOnly
        )
        if (mayHaveInterest) {
          element.addFetcher(id, fetcher, isReadOnly)
        }
      } catch (err) {
        logError(err)
      }
    }
  })
}

Elements.prototype.removeFetcher = function (id) {
  this.each(function (_, element) {
    element.removeFetcher(id)
  })
}

exports.Elements = Elements
exports.Element = Element

},{"./daemon/access":2,"./utils":17}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict'

var jetUtils = require('./utils')
var jetSorter = require('./sorter')
var jetFetcher = require('./fetcher')

var checked = jetUtils.checked

var isDefined = jetUtils.isDefined

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
exports.fetchCore = function (peer, elements, params, notify, success) {
  var fetchId = checked(params, 'id')

  var fetcher
  var sorter
  var initializing = true

  if (isDefined(params.sort)) {
    sorter = jetSorter.create(params, notify)
    fetcher = jetFetcher.create(params, function (nparams) {
      sorter.sorter(nparams, initializing)
    })
  } else {
    fetcher = jetFetcher.create(params, notify)
    if (success) {
      success()
    }
  }

  peer.addFetcher(fetchId, fetcher)
  elements.addFetcher(peer.id + fetchId, fetcher, peer)
  initializing = false

  if (isDefined(sorter) && sorter.flush) {
    if (success) {
      success()
    }
    sorter.flush()
  }
}

// dispatchers the 'unfetch' jet call.
// removes all ressources associated with the fetcher.
exports.unfetchCore = function (peer, elements, params) {
  var fetchId = checked(params, 'id', 'string')
  var fetchPeerId = peer.id + fetchId

  peer.removeFetcher(fetchId)
  elements.removeFetcher(fetchPeerId)
}

exports.addCore = function (peer, eachPeerFetcher, elements, params) {
  elements.add(eachPeerFetcher, peer, params)
}

exports.removeCore = function (peer, elements, params) {
  var path = checked(params, 'path', 'string')
  elements.remove(path, peer)
}

exports.changeCore = function (peer, elements, params) {
  var path = checked(params, 'path', 'string')
  elements.change(path, params.value, peer)
}

},{"./fetcher":6,"./sorter":16,"./utils":17}],6:[function(require,module,exports){
'use strict'

var jetPathMatcher = require('./path_matcher')
var jetValueMatcher = require('./value_matcher')
var jetUtils = require('./utils')

var isDefined = jetUtils.isDefined

exports.create = function (options, notify) {
  var pathMatcher = jetPathMatcher.create(options)
  var valueMatcher = jetValueMatcher.create(options)
  var added = {}

  var matchValue = function (path, event, value, fetchOnly) {
    var isAdded = added[path]
    if (event === 'remove' || !valueMatcher(value)) {
      if (isAdded) {
        delete added[path]
        notify({
          path: path,
          event: 'remove',
          value: value
        })
      }
      return true
    }
    var notification = {}
    if (!isAdded) {
      event = 'add'
      if (fetchOnly) {
        notification.fetchOnly = true
      }
      added[path] = true
    } else {
      event = 'change'
    }
    notification.path = path
    notification.event = event
    notification.value = value

    notify(notification)
    return true
  }

  if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
    return function (path, lowerPath, event, value, fetchOnly) {
      if (!pathMatcher(path, lowerPath)) {
        // return false to indicate no further interest.
        return false
      }
      var notification = {}
      if (event === 'add' && fetchOnly) {
        notification.fetchOnly = true
      }
      notification.path = path
      notification.event = event
      notification.value = value
      notify(notification)
      return true
    }
  } else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return function (path, lowerPath, event, value, fetchOnly) {
      return matchValue(path, event, value, fetchOnly)
    }
  } else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return function (path, lowerPath, event, value, fetchOnly) {
      if (!pathMatcher(path, lowerPath)) {
        return false
      }
      return matchValue(path, event, value, fetchOnly)
    }
  } else {
    return function (path, lowerPath, event, value, fetchOnly) {
      var notification = {}
      if (event === 'add' && fetchOnly) {
        notification.fetchOnly = true
      }
      notification.path = path
      notification.event = event
      notification.value = value
      notify(notification)
      return true
    }
  }
}

},{"./path_matcher":9,"./utils":17,"./value_matcher":18}],7:[function(require,module,exports){
(function (process,Buffer){
'use strict'

var util = require('util')
var events = require('events')
var net = require('./net')

/**
 * MessageSocket constructor function.
 * @private
 */
var MessageSocket = function (port, ip) {
  var last = new Buffer(0)
  var len = -1
  var self = this
  var socket
  if (port instanceof net.Socket) {
    socket = port
  } else {
    socket = net.connect(port, ip)
    socket.on('connect', function () {
      self.emit('open')
    })
  }

  socket.on('data', function (buf) {
    var bigBuf = Buffer.concat([last, buf])
    while (true) { // eslint-disable-line no-constant-condition
      if (len < 0) {
        if (bigBuf.length < 4) {
          last = bigBuf
          return
        } else {
          len = bigBuf.readUInt32BE(0)
          bigBuf = bigBuf.slice(4)
        }
      }
      if (len > 0) {
        if (bigBuf.length < len) {
          last = bigBuf
          return
        } else {
          self.emit('message', bigBuf.toString(undefined, 0, len))
          bigBuf = bigBuf.slice(len)
          len = -1
        }
      }
    }
  })

  socket.setNoDelay(true)
  socket.setKeepAlive(true)

  socket.once('close', function () {
    self.emit('close')
  })

  socket.once('error', function (e) {
    self.emit('error', e)
  })

  this._socket = socket
}

util.inherits(MessageSocket, events.EventEmitter)

/**
 * Send.
 * @private
 */
MessageSocket.prototype.send = function (msg) {
  var that = this
  var utf8Length = Buffer.byteLength(msg, 'utf8')
  var buf = new Buffer(4 + utf8Length)
  buf.writeUInt32BE(utf8Length, 0)
  buf.write(msg, 4)
  process.nextTick(function () {
    that._socket.write(buf)
    that.emit('sent', msg)
  })
}

/**
 * Close.
 * @private
 */
MessageSocket.prototype.close = function () {
  this._socket.end()
}

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function MessageEvent (dataArg, typeArg, target) {
  this.data = dataArg
  this.type = typeArg
  this.target = target
}

/**
 * W3C CloseEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function CloseEvent (code, reason, target) {
  this.wasClean = (typeof code === 'undefined' || code === 1000)
  this.code = code
  this.reason = reason
  this.target = target
}

/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function OpenEvent (target) {
  this.target = target
}

/**
 * addEventListener method needed for MessageSocket to be used in the browser.
 * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
 *
 * npm module 'ws' also comes with this method.
 * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
 * That way we can use node-jet with via browserify inside the browser.
 */
MessageSocket.prototype.addEventListener = function (method, listener) {
  var target = this

  function onMessage (data, flags) {
    listener.call(target, new MessageEvent(data, (flags && flags.binary) ? 'Binary' : 'Text', target))
  }

  function onClose (code, message) {
    listener.call(target, new CloseEvent(code, message, target))
  }

  function onError (event) {
    event.target = target
    listener.call(target, event)
  }

  function onOpen () {
    listener.call(target, new OpenEvent(target))
  }

  if (typeof listener === 'function') {
    if (method === 'message') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onMessage._listener = listener
      this.on(method, onMessage)
    } else if (method === 'close') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onClose._listener = listener
      this.on(method, onClose)
    } else if (method === 'error') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onError._listener = listener
      this.on(method, onError)
    } else if (method === 'open') {
      // store a reference so we can return the original function from the
      // addEventListener hook
      onOpen._listener = listener
      this.on(method, onOpen)
    } else {
      this.on(method, listener)
    }
  }
}

exports.MessageSocket = MessageSocket

}).call(this,require('_process'),require("buffer").Buffer)
},{"./net":8,"_process":25,"buffer":21,"events":22,"util":28}],8:[function(require,module,exports){
/*
 * dirty hack to trick webpack (without config => next.js) to ignore
 * the require('net') statements
 */
var webpackIgnore = {r: module['require']}
var net = typeof window === 'undefined' && webpackIgnore.r('net')

module.exports = net || {Socket: function () {}}

},{}],9:[function(require,module,exports){
'use strict'

var jetUtils = require('./utils')
var isDefined = jetUtils.isDefined

var contains = function (what) {
  return function (path) {
    return path.indexOf(what) !== -1
  }
}

var containsAllOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false
      }
    }
    return true
  }
}

var containsOneOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true
      }
    }
    return false
  }
}

var startsWith = function (what) {
  return function (path) {
    return path.substr(0, what.length) === what
  }
}

var endsWith = function (what) {
  return function (path) {
    return path.lastIndexOf(what) === (path.length - what.length)
  }
}

var equals = function (what) {
  return function (path) {
    return path === what
  }
}

var equalsOneOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path === whatArray[i]) {
        return true
      }
    }
    return false
  }
}

var negate = function (gen) {
  return function () {
    var f = gen.apply(undefined, arguments)
    return function () {
      return !f.apply(undefined, arguments)
    }
  }
}

var generators = {
  equals: equals,
  equalsNot: negate(equals),
  contains: contains,
  containsNot: negate(contains),
  containsAllOf: containsAllOf,
  containsOneOf: containsOneOf,
  startsWith: startsWith,
  startsNotWith: negate(startsWith),
  endsWith: endsWith,
  endsNotWith: negate(endsWith),
  equalsOneOf: equalsOneOf,
  equalsNotOneOf: negate(equalsOneOf)
}

var predicateOrder = [
  'equals',
  'equalsNot',
  'endsWith',
  'startsWith',
  'contains',
  'containsNot',
  'containsAllOf',
  'containsOneOf',
  'startsNotWith',
  'endsNotWith',
  'equalsOneOf',
  'equalsNotOneOf'
]

exports.create = function (options) {
  if (!isDefined(options.path)) {
    return
  }
  var po = options.path
  var ci = po.caseInsensitive
  var pred
  var predicates = []

  predicateOrder.forEach(function (name) {
    var gen
    var option = po[name]
    if (isDefined(option)) {
      gen = generators[name]
      if (ci) {
        if (Array.isArray(option)) {
          option = option.map(function (op) {
            return op.toLowerCase()
          })
        } else {
          option = option.toLowerCase()
        }
      }
      predicates.push(gen(option))
    }
  })

  var applyPredicates = function (path) {
    for (var i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false
      }
    }
    return true
  }

  var pathMatcher

  if (ci) {
    if (predicates.length === 1) {
      pred = predicates[0]
      pathMatcher = function (path, lowerPath) {
        return pred(lowerPath)
      }
    } else {
      pathMatcher = function (path, lowerPath) {
        return applyPredicates(lowerPath)
      }
    }
  } else {
    if (predicates.length === 1) {
      pred = predicates[0]
      pathMatcher = function (path) {
        return pred(path)
      }
    } else {
      pathMatcher = function (path) {
        return applyPredicates(path)
      }
    }
  }

  return pathMatcher // eslint-disable-line consistent-return
}

},{"./utils":17}],10:[function(require,module,exports){
'use strict'

var JsonRPC = require('./peer/jsonrpc')
var Promise = Promise || (typeof window !== 'undefined' && window.Promise) || require('bluebird')

/**
 * A bluebird Promise
 * @external Promise
 * @see {@link http://bluebirdjs.com/docs/api-reference.html|Bluebird API}
 */

var fallbackDaemonInfo = {
  name: 'unknown-daemon',
  version: '0.0.0',
  protocolVersion: 1,
  features: {
    fetch: 'full',
    authentication: false,
    batches: true
  }
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
 * @param {Object} [config] A peer configuration
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
var Peer = function (config) {
  this.config = config = config || {}
  var that = this

  this.jsonrpc = new JsonRPC(config)

  this.connectPromise = new Promise(function (resolve, reject) {
    that.resolveConnect = resolve
    that.rejectConnect = reject
  })

  this.daemonInfo = fallbackDaemonInfo

  this.jsonrpc.connect().then(function () {
    return that.info().then(function (daemonInfo) {
      that.daemonInfo = daemonInfo
    }).catch(function () {}).then(function () {
      if (that.config.user) {
        that.authenticate(that.config.user, that.config.password).then(function (access) {
          that.access = access
          that.connected = true
          that.resolveConnect(that)
        }).catch(function (err) {
          that.rejectConnect(err)
        })
      } else {
        that.connected = true
        that.resolveConnect(that)
      }
    })
  }).catch(function (err) {
    that.rejectConnect(err)
  })
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
Peer.prototype.connect = function () {
  return this.connectPromise
}

/**
 * Tells if the peer is connected to the daemon
 */
Peer.prototype.isConnected = function () {
  return this.connected === true
}

/**
 * Close the connection to the Daemon. All associated States and Methods are automatically
 * removed by the Daemon.
 *
 * @returns {external:Promise}
 *
 */
Peer.prototype.close = function () {
  this.connected = false
  return this.jsonrpc.close()
}

/**
 * Returns if the connection to the Daemon has been closed
 *
 * @returns {external:Promise}
 *
 */
Peer.prototype.closed = function () {
  return this.jsonrpc.closed()
}

/**
 * Batch operations wrapper. Issue multiple commands to the Daemon
 * in one message batch. Only required for performance critical actions.
 *
 * @param {function} action A function performing multiple peer actions.
 *
 */
Peer.prototype.batch = function (action) {
  this.jsonrpc.batch(action)
}

/**
 * Sends a fetch request to the daemon containing the fetch rules
 * defined by `fetcher`.
 *
 * @param {FetchChainer} fetcher A configured fetcher.
 * @returns {external:Promise} Gets resolved as soon as the Daemon has registered the fetch expression.
 */
Peer.prototype.fetch = function (fetcher) {
  var that = this
  return this.connectPromise.then(function () {
    fetcher.jsonrpc = that.jsonrpc
    fetcher.variant = that.daemonInfo.features.fetch
    return fetcher.fetch()
  })
}

/**
 * Sends a unfetch request to the daemon
 *
 * @param {FetchChainer} fetcher A previously fetched fetcher.
 * @returns {external:Promise} Gets resolved as soon as the Daemon has unregistered the fetch expression.
 *
 */
Peer.prototype.unfetch = function (fetcher) {
  return this.connectPromise.then(function () {
    return fetcher.unfetch()
  })
}

/**
 * Get {State}s and/or {Method}s defined by a Peer.
 *
 * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
 * @returns {external:Promise}
 */
Peer.prototype.get = function (expression) {
  var jsonrpc = this.jsonrpc
  return this.connectPromise.then(function () {
    return jsonrpc.service('get', expression)
  })
}

/**
 * Adds a state or method to the Daemon.
 *
 * @param {(State|Method)} content To content to be added.
 * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
 */
Peer.prototype.add = function (stateOrMethod) {
  var that = this
  stateOrMethod.jsonrpc = that.jsonrpc
  stateOrMethod.connectPromise = this.connectPromise
  return stateOrMethod.add()
}

/**
 * Remove a state or method from the Daemon.
 *
 * @param {State|Method} content The content to be removed.
 * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
 */
Peer.prototype.remove = function (stateOrMethod) {
  return stateOrMethod.remove()
}

/**
 * Call a {Method} defined by another Peer.
 *
 * @param {string} path The unique path of the {Method}.
 * @param {Array} args The arguments provided to the {Method}.
 * @param {object} [options] Options.
 * @param {number} [options.timeout] A timeout for invoking the {Method} after which a timeout error rejects the promise.
 * @returns {external:Promise}
 */
Peer.prototype.call = function (path, callparams, options) {
  options = options || {}
  var params = {
    path: path,
    args: callparams || [],
    timeout: options.timeout // optional
  }
  var jsonrpc = this.jsonrpc
  return this.connectPromise.then(function () {
    return jsonrpc.service('call', params, null, options.skipResult)
  })
}

/**
 * Info
 * @private
 */
Peer.prototype.info = function () {
  return this.jsonrpc.service('info', {})
}

/**
 * Authenticate
 * @private
 */
Peer.prototype.authenticate = function (user, password) {
  return this.jsonrpc.service('authenticate', {
    user: user,
    password: password
  })
}

/**
 * Config
 *
 * @private
 */
Peer.prototype.configure = function (params) {
  return this.jsonrpc.service('config', params)
}

/**
 * Set a {State} to another value.
 *
 * @param {string} path The unique path to the {State}.
 * @param {*} value The desired new value of the {State}.
 * @param {object} [options] Optional settings
 * @param {number} [options.timeout]
 *
 */
Peer.prototype.set = function (path, value, options) {
  options = options || {}
  var params = {
    path: path,
    value: value,
    timeout: options.timeout, // optional
    valueAsResult: options.valueAsResult // optional
  }
  var jsonrpc = this.jsonrpc
  return this.connectPromise.then(function () {
    return jsonrpc.service('set', params, null, options.skipResult)
  })
}

module.exports = Peer

},{"./peer/jsonrpc":13,"bluebird":20}],11:[function(require,module,exports){
'use strict'

var Fetcher = require('./fetch').Fetcher
var FakeFetcher = require('./fetch').FakeFetcher
var Promise = Promise || (typeof window !== 'undefined' && window.Promise) || require('bluebird')

var FetchChainer = function () {
  this.rule = {}
}

FetchChainer.prototype.on = function (event, cb) {
  if (event === 'data') {
    this._dataDispatcher = cb
    return this
  } else {
    throw new Error('invalid event')
  }
}

FetchChainer.prototype.fetch = function () {
  if (this._stopped) {
    return Promise.resolve()
  }
  if (!this._fetcher) {
    if (this.variant === 'simple') {
      this._fetcher = new FakeFetcher(this.jsonrpc, this.rule, this._dataDispatcher)
    } else {
      this._fetcher = new Fetcher(this.jsonrpc, this.rule, this._dataDispatcher)
    }
  }
  return this._fetcher.fetch()
}

FetchChainer.prototype.unfetch = function () {
  if (this._fetcher) {
    return this._fetcher.unfetch()
  } else {
    this._stopped = true
    return Promise.resolve()
  }
}

FetchChainer.prototype.isFetching = function () {
  if (this._fetcher) {
    return this._fetcher.isFetching()
  } else {
    return false
  }
}

FetchChainer.prototype.all = function () {
  return this
}

FetchChainer.prototype.expression = function (expression) {
  this.rule = expression
  return this
}

FetchChainer.prototype.path = function (match, comp) {
  this.rule.path = this.rule.path || {}
  this.rule.path[match] = comp
  return this
}

FetchChainer.prototype.pathCaseInsensitive = function () {
  this.rule.path = this.rule.path || {}
  this.rule.path.caseInsensitive = true
  return this
}

FetchChainer.prototype.key = function (key, match, comp) {
  this.rule.valueField = this.rule.valueField || {}
  this.rule.valueField[key] = {}
  this.rule.valueField[key][match] = comp
  return this
}

FetchChainer.prototype.value = function () {
  var args = Array.prototype.slice.call(arguments, 0)
  if (args.length === 2) {
    var match = args[0]
    var comp = args[1]
    this.rule.value = this.rule.value || {}
    this.rule.value[match] = comp
    return this
  } else {
    return this.key(args[0], args[1], args[2])
  }
}

var defaultSort = function () {
  return {
    asArray: true
  }
}

FetchChainer.prototype._sortObject = function () {
  this.rule.sort = this.rule.sort || defaultSort()
  return this.rule.sort
}

FetchChainer.prototype.differential = function () {
  this._sortObject().asArray = false
  return this
}

FetchChainer.prototype.ascending = function () {
  this._sortObject().descending = false
  return this
}

FetchChainer.prototype.descending = function () {
  this._sortObject().descending = true
  return this
}

FetchChainer.prototype.sortByPath = function () {
  this._sortObject().byPath = true
  return this
}

FetchChainer.prototype.sortByKey = function (key, type) {
  var sort = this._sortObject()
  sort.byValueField = {}
  sort.byValueField[key] = type
  return this
}

FetchChainer.prototype.sortByValue = function () {
  var args = Array.prototype.slice.call(arguments, 0)
  var sort = this._sortObject()
  if (args.length === 1) {
    sort.byValue = args[0]
  } else {
    return this.sortByKey(args[0], args[1])
  }
  return this
}

FetchChainer.prototype.range = function (from, to) {
  var sort = this._sortObject()
  sort.from = from
  sort.to = to || from + 20
  return this
}

module.exports.FetchChainer = FetchChainer

},{"./fetch":12,"bluebird":20}],12:[function(require,module,exports){
'use strict'

var jetUtils = require('../utils')
var fetchCommon = require('../fetch-common')
var Elements = require('../element').Elements
var Promise = Promise || (typeof window !== 'undefined' && window.Promise) || require('bluebird')
var isDef = jetUtils.isDefined

var globalFetchId = 1

var createFetchDispatcher = function (params, f, ref) {
  if (isDef(params.sort)) {
    if (params.sort.asArray) {
      delete params.sort.asArray // peer internal param
      var arr = []
      var from = params.sort.from
      return function (message) {
        arr.length = message.params.n
        message.params.changes.forEach(function (change) {
          arr[change.index - from] = change
        })
        f.call(ref, arr, ref)
      }
    } else {
      return function (message) {
        f.call(ref, message.params.changes, message.params.n)
      }
    }
  } else {
    return function (message) {
      f.call(ref, message.params)
    }
  }
}

var FakePeer = function () {
  this.fetchers = {}
  this.id = 'fakePeer'
  var eachFetcherIterator = jetUtils.eachKeyValue(this.fetchers)
  this.eachFetcher = function (element, initElementFetching) {
    var hasSetAccess = !element.fetchOnly
    var initElementFetchingAccess = function (peerFetchId, fetcher) {
      initElementFetching('fakePeer' + peerFetchId, fetcher, hasSetAccess)
    }
    eachFetcherIterator(initElementFetchingAccess)
  }
}

FakePeer.prototype.addFetcher = function (fetchId, fetcher) {
  this.fetchers[fetchId] = fetcher
}

FakePeer.prototype.removeFetcher = function (fetchId) {
  delete this.fetchers[fetchId]
}

FakePeer.prototype.hasFetcher = function (fetchId) {
  return this.fetchers[fetchId] && true || false
}

/**
 * FakeFetcher
 *
 * Mimiks normal "fetch" API when the Daemon runs
 * fetch = 'simple' mode. In this case, the Daemon supports
 * only one "fetch all" per Peer.
 * Filtering (value and/or path based) and sorting are handled
 * by the peer.
 *
 * Normally only embedded systems with very limited resources
 * run the fetch = 'simple' mode.
 * @private
 */
var FakeFetcher = function (jsonrpc, fetchParams, fetchCb) {
  var id = '__f__' + globalFetchId
  ++globalFetchId

  fetchParams.id = id

  var fetchDispatcher

  var wrappedFetchDispatcher = function (nparams) {
    fetchDispatcher = fetchDispatcher || createFetchDispatcher(fetchParams, fetchCb, this)
    fetchDispatcher({
      params: nparams
    })
  }

  if (jsonrpc.fakeContext === undefined) {
    var context = jsonrpc.fakeContext = {}
    context.elements = new Elements()
    context.peer = new FakePeer()

    var fetchSimpleDispatcher = function (message) {
      var params = message.params
      var event = params.event

      if (event === 'remove') {
        fetchCommon.removeCore(context.peer, context.elements, params)
      } else if (event === 'add') {
        fetchCommon.addCore(context.peer, context.peer.eachFetcher, context.elements, params)
      } else {
        fetchCommon.changeCore(context.peer, context.elements, params)
      }
    }

    context.fetchAllPromise = new Promise(function (resolve, reject) {
      jsonrpc.service('fetch', {}, function (ok, fetchSimpleId) {
        jsonrpc.addRequestDispatcher(fetchSimpleId, fetchSimpleDispatcher)
      }).then(function () {
        setTimeout(resolve, 50) // wait some time to let the FakeFetcher.elements get filled
      }).catch(reject)
    })
  }

  this.fetch = function () {
    var context = jsonrpc.fakeContext
    return context.fetchAllPromise.then(function () {
      return fetchCommon.fetchCore(context.peer, context.elements, fetchParams, wrappedFetchDispatcher)
    })
  }

  this.unfetch = function () {
    var context = jsonrpc.fakeContext
    return context.fetchAllPromise.then(function () {
      return fetchCommon.unfetchCore(context.peer, context.elements, fetchParams)
    })
  }

  this.isFetching = function () {
    var context = jsonrpc.fakeContext
    return context.peer.hasFetcher(fetchParams.id)
  }
}

/**
 * Fetcher
 *
 * Sets up a new fetcher. Fetching is very similiar to pub-sub.
 * You can optionally define path- and/or value-based filters
 * and sorting criteria.
 *
 * All options are available at [jetbus.io](http://jetbus.io).
 */
var Fetcher = function (jsonrpc, params, fetchCb) {
  var id = '__f__' + globalFetchId
  params.id = id
  ++globalFetchId

  var fetchDispatcher = createFetchDispatcher(params, fetchCb, this)

  var addFetchDispatcher = function () {
    jsonrpc.addRequestDispatcher(id, fetchDispatcher)
  }

  var removeFetchDispatcher = function () {
    jsonrpc.removeRequestDispatcher(id)
  }

  this.unfetch = function () {
    return jsonrpc.service('unfetch', {
      id: id
    }, removeFetchDispatcher)
  }

  this.isFetching = function () {
    return jsonrpc.hasRequestDispatcher(id)
  }

  this.fetch = function () {
    return jsonrpc.service('fetch', params, addFetchDispatcher)
  }
}

module.exports = {
  FakeFetcher: FakeFetcher,
  Fetcher: Fetcher
}

},{"../element":3,"../fetch-common":5,"../utils":17,"bluebird":20}],13:[function(require,module,exports){
'use strict'

var util = require('util')
var MessageSocket = typeof window === 'undefined' && require('../message-socket').MessageSocket
var WebSocket = WebSocket || (typeof window !== 'undefined' && window.WebSocket) || require('ws')
var jetUtils = require('../utils')
var Promise = Promise || (typeof window !== 'undefined' && window.Promise) || require('bluebird')
var errors = require('../errors')

/**
 * Helper shorthands.
 */
var encode = JSON.stringify
var decode = JSON.parse
var isDef = jetUtils.isDefined
var isArr = util.isArray
var errorObject = jetUtils.errorObject

/**
 * Adds a function ("hook") to callbacks[callbackName]
 *
 * "hook" is executed before the original
 * callbacks[callbackName] function if defined,
 * or installs "hook" as callbacks[callbackName].
 * @private
 */
var addHook = function (callbacks, callbackName, hook) {
  if (callbacks[callbackName]) {
    var orig = callbacks[callbackName]
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
var JsonRPC = function (config) {
  if (config.sock) {
    this.sock = config.sock
  } else if (config.url || (typeof (window) !== 'undefined')) {
    var url = config.url || ('ws://' + window.location.host)
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

  var that = this

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
  var err = new errors.ConnectionClosed()
  /* istanbul ignore else */
  if (!this._isOpened) {
    this.rejectConnect(err)
  }
  for (var id in this.responseDispatchers) {
    var callbacks = this.responseDispatchers[id]
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
  var message = event.data
  var decoded
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
  if (isArr(decoded)) {
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
  } else if (isDef(message.result) || isDef(message.error)) {
    this._dispatchResponse(message)
  }
}

/**
 * _dispatchResponse
 *
 * @api private
 */
JsonRPC.prototype._dispatchResponse = function (message) {
  var mid = message.id
  var callbacks = this.responseDispatchers[mid]
  delete this.responseDispatchers[mid]
  /* istanbul ignore else */
  if (callbacks) {
    /* istanbul ignore else */
    if (isDef(message.result) && callbacks.success) {
      callbacks.success(message.result)
    } else if (isDef(message.error) && callbacks.error) {
      var err = errors.createTypedError(message.error)
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
  var dispatcher = this.requestDispatchers[message.method]

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
  var encoded
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
  var that = this
  return new Promise(function (resolve, reject) {
    if (that._isClosed) {
      reject(new errors.ConnectionClosed())
    } else {
      var rpcId
      // Only make a Request, if callbacks are specified.
      // Make complete call in case of success.
      // If no id is specified in the message, no Response
      // is expected, aka Notification.
      if (!asNotification) {
        rpcId = that.id
        that.id = that.id + 1
        var callbacks = {
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
      var message = {
        id: rpcId,
        method: method,
        params: params
      }
      if (that.willFlush) {
        that.queue(message)
      } else {
        var encoded = encode(message)
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

},{"../errors":4,"../message-socket":7,"../utils":17,"bluebird":20,"util":28,"ws":20}],14:[function(require,module,exports){
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

},{"../utils":17}],15:[function(require,module,exports){
'use strict'

var jetUtils = require('../utils')
var Promise = Promise || (typeof window !== 'undefined' && window.Promise) || require('bluebird')

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

},{"../utils":17,"bluebird":20}],16:[function(require,module,exports){
'use strict'

var jetUtils = require('./utils')
var isDefined = jetUtils.isDefined

var createSort = function (options) {
  var sort
  var lt, gt

  if ((!isDefined(options.sort.byValue) && !isDefined(options.sort.byValueField)) || options.sort.byPath) {
    gt = function (a, b) {
      return a.path > b.path
    }
    lt = function (a, b) {
      return a.path < b.path
    }
  } else {
    if (options.sort.byValue) {
      lt = function (a, b) {
        return a.value < b.value
      }
      gt = function (a, b) {
        return a.value > b.value
      }
    } else if (options.sort.byValueField) {
      var fieldStr = Object.keys(options.sort.byValueField)[0]
      var getField = jetUtils.accessField(fieldStr)
      lt = function (a, b) {
        return getField(a.value) < getField(b.value)
      }
      gt = function (a, b) {
        return getField(a.value) > getField(b.value)
      }
    }
  }
  var psort = function (s, a, b) {
    try {
      if (s(a, b)) {
        return -1
      }
    } catch (ignore) {} // eslint-disable-line no-empty
    return 1
  }

  if (options.sort.descending) {
    sort = function (a, b) {
      return psort(gt, a, b)
    }
  } else {
    sort = function (a, b) {
      return psort(lt, a, b)
    }
  }
  return sort
}

exports.create = function (options, notify) {
  var from
  var to
  var matches = []
  var sorted = {}
  var index = {}
  var sort
  var n = -1

  from = options.sort.from || 1
  to = options.sort.to || 10

  sort = createSort(options)

  var isInRange = function (i) {
    return typeof i === 'number' && i >= from && i <= to
  }

  var sorter = function (notification, initializing) {
    var event = notification.event
    var path = notification.path
    var value = notification.value
    var lastMatchesLength = matches.length
    var lastIndex
    var newIndex
    var wasIn
    var isIn
    var start
    var stop
    var changes = []
    var newN
    var news
    var olds
    var ji
    var i
    var match

    if (initializing) {
      if (isDefined(index[path])) {
        return
      }
      match = {
        path: path,
        value: value
      }
      if (notification.fetchOnly) {
        match.fetchOnly = true
      }
      matches.push(match)
      index[path] = matches.length
      return
    }
    lastIndex = index[path]
    if (event === 'remove') {
      if (isDefined(lastIndex)) {
        matches.splice(lastIndex - 1, 1)
        delete index[path]
      } else {
        return
      }
    } else if (isDefined(lastIndex)) {
      matches[lastIndex - 1].value = value
    } else {
      match = {
        path: path,
        value: value
      }
      if (notification.fetchOnly) {
        match.fetchOnly = true
      }
      matches.push(match)
    }

    matches.sort(sort)

    matches.forEach(function (m, mindex) {
      index[m.path] = mindex + 1
    })

    if (matches.length < from && lastMatchesLength < from) {
      return
    }

    newIndex = index[path]

    var change

    if (isDefined(lastIndex) && isDefined(newIndex) && newIndex === lastIndex && isInRange(newIndex)) {
      if (event === 'change') {
        change = {
          path: path,
          value: value,
          index: newIndex
        }
        if (matches[newIndex - 1].fetchOnly) {
          change.fetchOnly = true
        }
        notify({
          n: n,
          changes: [change]
        })
      }
      return
    }

    isIn = isInRange(newIndex)
    wasIn = isInRange(lastIndex)

    if (isIn && wasIn) {
      start = Math.min(lastIndex, newIndex)
      stop = Math.max(lastIndex, newIndex)
    } else if (isIn && !wasIn) {
      start = newIndex
      stop = Math.min(to, matches.length)
    } else if (!isIn && wasIn) {
      start = lastIndex
      stop = Math.min(to, matches.length)
    } else {
      start = from
      stop = Math.min(to, matches.length)
    }

    for (i = start; i <= stop; i = i + 1) {
      ji = i - 1 // javascript index is 0 based
      news = matches[ji]
      olds = sorted[ji]
      if (news && news !== olds) {
        change = {
          path: news.path,
          value: news.value,
          index: i
        }
        if (news.fetchOnly) {
          change.fetchOnly = true
        }
        changes.push(change)
      }
      sorted[ji] = news
      if (news === undefined) {
        break
      }
    }

    newN = Math.min(to, matches.length) - from + 1
    if (newN !== n || changes.length > 0) {
      n = newN
      notify({
        changes: changes,
        n: n
      })
    }
  }

  var flush = function () {
    var changes = []
    var news
    var ji
    var i
    matches.sort(sort)
    matches.forEach(function (m, mindex) {
      index[m.path] = mindex + 1
    })

    n = 0

    for (i = from; i <= to; i = i + 1) {
      ji = i - 1
      news = matches[ji]
      if (news) {
        news.index = i
        n = i - from + 1
        sorted[ji] = news
        changes.push(news)
      }
    }

    notify({
      changes: changes,
      n: n
    })
  }

  return {
    sorter: sorter,
    flush: flush
  }
}

},{"./utils":17}],17:[function(require,module,exports){
'use strict'

var errors = require('./errors')

var invalidParams = function (data) {
  return {
    message: 'Invalid params',
    code: -32602,
    data: data
  }
}

exports.invalidParams = invalidParams

exports.parseError = function (data) {
  return {
    message: 'Parse error',
    code: -32700,
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

var isDefined = function (x) {
  if (typeof x === 'undefined' || x === null) {
    return false
  }
  return true
}

exports.checked = function (tab, key, typename) {
  var p = tab[key]
  if (isDefined(p)) {
    if (typename) {
      if (typeof (p) === typename) {
        return p
      } else {
        throw invalidParams({
          wrongType: key,
          got: tab
        })
      }
    } else {
      return p
    }
  } else {
    throw invalidParams({
      missingParam: key,
      got: tab
    })
  }
}

exports.optional = function (tab, key, typename) {
  var p = tab[key]
  if (isDefined(p)) {
    if (typename) {
      if (typeof (p) === typename) {
        return p
      }
    } else {
      throw invalidParams({
        wrongType: key,
        got: tab
      })
    }
  }
}

exports.isDefined = isDefined

exports.noop = function () {}

exports.accessField = function (fieldStr) {
  if (fieldStr.substr(0, 1) !== '[') {
    fieldStr = '.' + fieldStr
  }
  var funStr = 'return t' + fieldStr
  return new Function('t', funStr) // eslint-disable-line no-new-func
}

exports.errorObject = function (err) {
  var data
  if (typeof err === 'object' && isDefined(err.code) && isDefined(err.message)) {
    return err
  } else {
    if (err instanceof errors.InvalidArgument) {
      return invalidParams({
        invalidArgument: err
      })
    } else {
      if (typeof err === 'object') {
        data = {}
        data.message = err.message
        data.stack = err.stack
        data.lineNumber = err.lineNumber
        data.fileName = err.fileName
      } else {
        data = {}
        data.message = err
        data.stack = 'no stack available'
      }
      return {
        code: -32603,
        message: 'Internal error',
        data: data
      }
    }
  }
}

exports.eachKeyValue = function (obj) {
  return function (f) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        f(key, obj[key])
      }
    }
  }
}

},{"./errors":4}],18:[function(require,module,exports){
'use strict'

var jetUtils = require('./utils')

var generators = {}

generators.lessThan = function (other) {
  return function (x) {
    return x < other
  }
}

generators.greaterThan = function (other) {
  return function (x) {
    return x > other
  }
}

generators.equals = function (other) {
  return function (x) {
    return x === other
  }
}

generators.equalsNot = function (other) {
  return function (x) {
    return x !== other
  }
}

generators.isType = function (type) {
  return function (x) {
    return typeof x === type
  }
}

var isDefined = jetUtils.isDefined

var generatePredicate = function (op, val) {
  var gen = generators[op]
  if (!gen) {
    throw jetUtils.invalidParams('unknown generator ' + op)
  } else {
    return gen(val)
  }
}

var createValuePredicates = function (valueOptions) {
  var predicates = []
  jetUtils.eachKeyValue(valueOptions)(function (op, val) {
    predicates.push(generatePredicate(op, val))
  })
  return predicates
}

var createValueFieldPredicates = function (valueFieldOptions) {
  var predicates = []
  jetUtils.eachKeyValue(valueFieldOptions)(function (fieldStr, rule) {
    var fieldPredicates = []
    var accessor = jetUtils.accessField(fieldStr)
    jetUtils.eachKeyValue(rule)(function (op, val) {
      fieldPredicates.push(generatePredicate(op, val))
    })
    var fieldPredicate = function (value) {
      if (typeof value !== 'object') {
        return false
      }
      try {
        var field = accessor(value)
        for (var i = 0; i < fieldPredicates.length; ++i) {
          if (!fieldPredicates[i](field)) {
            return false
          }
        }
        return true
      } catch (e) {
        return false
      }
    }
    predicates.push(fieldPredicate)
  })

  return predicates
}

exports.create = function (options) {
  // sorting by value implicitly defines value matcher rule against expected type
  if (options.sort) {
    if (options.sort.byValue) {
      options.value = options.value || {}
      options.value.isType = options.sort.byValue
    } else if (options.sort.byValueField) {
      var fieldName = Object.keys(options.sort.byValueField)[0]
      var type = options.sort.byValueField[fieldName]
      options.valueField = options.valueField || {}
      options.valueField[fieldName] = options.valueField[fieldName] || {}
      options.valueField[fieldName].isType = type
    }
  }

  if (!isDefined(options.value) && !isDefined(options.valueField)) {
    return
  }

  var predicates

  if (isDefined(options.value)) {
    predicates = createValuePredicates(options.value)
  } else if (isDefined(options.valueField)) {
    predicates = createValueFieldPredicates(options.valueField)
  }

  return function (value) { // eslint-disable-line consistent-return
    try {
      for (var i = 0; i < predicates.length; ++i) {
        if (!predicates[i](value)) {
          return false
        }
      }
      return true
    } catch (e) {
      return false
    }
  }
}

},{"./utils":17}],19:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],20:[function(require,module,exports){

},{}],21:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":19,"ieee754":23,"isarray":24}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],23:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],24:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],25:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],27:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],28:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":27,"_process":25,"inherits":26}]},{},[1])(1)
});
