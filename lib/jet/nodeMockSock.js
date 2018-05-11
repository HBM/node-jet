'use strict'

var util = require('util')
var events = require('events')

/**
* This object mocks the API for a socket on both the daemon and the peer.
* This allows the creation of peers in NodeJS local to the daemon.
*/
var NodeMockSock = function () {
  var NodePeerMockSock = function () {
    this.send = function (message) {
      daemonSock.emit('message', message)
    }

    this.close = function () {
      daemonSock.emit('close')
    }
  }

  var NodeDaemonMockSock = function () {
    this.send = function (message) {
      peerSock.emit('message', {data: message})
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
