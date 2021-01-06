'use strict'

const errors = require('../errors')
const utils = require('../utils')
const assert = require('assert')
const optional = utils.optional
const responseTimeout = errors.responseTimeout

exports.Router = function (log) {
  // holds info about all pending requests (which are routed)
  // key is (daemon generated) unique id, value is Object
  // with original request id and receiver (peer) and request
  // timer
  const routes = {}

  // counter to make the routed request more unique.
  // addresses situation if a peer makes two requests with
  // same message.id.
  let rcount = 0

  this.request = function (message, peer, element) {
    const timeout = optional(message.params, 'timeout', 'number') || element.timeout || 5
    /* jslint bitwise: true */
    rcount = (rcount + 1) % 2 ^ 31
    const id = message.id.toString() + peer.id + rcount
    assert.equal(routes[id], null) // eslint-disable-line
    routes[id] = {
      receiver: peer,
      id: message.id,
      timer: setTimeout(function () {
        delete routes[id]
        peer.sendMessage({
          id: message.id,
          error: responseTimeout(message.params)
        })
      }, timeout * 1000)
    }
    return id
  }

  // routes an incoming response to the requestor (peer)
  // which made the request.
  // stops timeout timer eventually.
  this.response = function (peer, message) {
    const route = routes[message.id]
    if (route) {
      clearTimeout(route.timer)
      delete routes[message.id]
      message.id = route.id
      route.receiver.sendMessage(message)
    } else {
      log('cannot route message (timeout?)', message)
    }
  }
}
