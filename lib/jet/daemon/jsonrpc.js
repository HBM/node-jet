'use strict'

var util = require('util')
var utils = require('../utils')

var isDefined = utils.isDefined

var JsonRPC = function (services, router) {
  var dispatchMessage = function (peer, message) {
    var service
    if (message.method) {
      service = services[message.method]
      if (service) {
        service(peer, message)
      } else if (isDefined(message.id)) {
        peer.sendMessage({
          id: message.id,
          error: utils.methodNotFound(message.method)
        })
      }
      return
    } else if (isDefined(message.result) || isDefined(message.error)) {
      router.response(peer, message)
      return
    } else if (isDefined(message.id)) {
      var error = utils.invalidRequest(message)
      peer.sendMessage({
        id: message.id,
        error: error
      })
    }
  }

  this.dispatch = function (peer, message) {
    try {
      message = JSON.parse(message)
    } catch (e) {
      peer.sendMessage({
        error: utils.parseError(e)
      })
      throw e
    }
    if (util.isArray(message)) {
      message.forEach(function (msg) {
        dispatchMessage(peer, msg)
      })
    } else {
      dispatchMessage(peer, message)
    }
  }
}

module.exports = JsonRPC
