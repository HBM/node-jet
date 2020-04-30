'use strict'

var util = require('util')
var events = require('events')
var net = require('./net')

/**
 * MessageSocket constructor function.
 * @private
 */
var MessageSocket = function (port, ip) {
  var last = Buffer.alloc(0)
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
  var buf = Buffer.alloc(4 + utf8Length)
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
