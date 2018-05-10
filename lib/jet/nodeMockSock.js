'use strict'

var util = require('util')
var events = require('events')

/**
* This object mocks the API for a socket that would normally be used
* by a peer on a browser in order to support peer creation on NodeJS
* in the same process as the daemon.
*/
var NodeMockSock = function () {
  var NodePeerMockSock = function () {
    this.send = function (message) {
      daemonSock.emit('message', message)
    }

    this.close = function () {
      // TODO
    }
  }

  var NodeDaemonMockSock = function () {
    this.send = function (message) {
      peerSock.emit('message', {data: message})
    }

    this.close = function () {
      // TODO
    }
  }

  util.inherits(NodePeerMockSock, events.EventEmitter)
  util.inherits(NodeDaemonMockSock, events.EventEmitter)
  NodePeerMockSock.prototype.addEventListener = function (eventName, callback) {
    if (eventName === 'open') {
      callback()
    }

    NodePeerMockSock.prototype.on(eventName, callback)
  }

  var peerSock = new NodePeerMockSock()
  var daemonSock = new NodeDaemonMockSock()

  this.peerSock = peerSock
  this.daemonSock = daemonSock
}

exports.NodeMockSock = NodeMockSock
