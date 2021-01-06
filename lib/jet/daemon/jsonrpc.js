'use strict'

const utils = require('../utils')

const isDefined = utils.isDefined

const JsonRPC = function (services, router) {
  const dispatchMessage = function (peer, message) {
    let service
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
    } else if (typeof message.result !== 'undefined' || typeof message.error !== 'undefined') {
      router.response(peer, message)
    } else if (isDefined(message.id)) {
      const error = utils.invalidRequest(message)
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
    if (Array.isArray(message)) {
      message.forEach(function (msg) {
        dispatchMessage(peer, msg)
      })
    } else {
      dispatchMessage(peer, message)
    }
  }
}

module.exports = JsonRPC
