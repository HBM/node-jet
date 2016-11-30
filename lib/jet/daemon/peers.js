'use strict'

var jetUtils = require('../utils')
var access = require('./access')
var net = typeof window !== 'undefined' ? require('net') : {Socket: function () {}}
var uuid = require('uuid')
var EventEmitter = require('events').EventEmitter

var genPeerId = function (sock) {
  if (sock instanceof net.Socket) {
    return sock.remoteAddress + ':' + sock.remotePort
  } else {
    // this is a websocket
    try {
      sock = sock._sender._socket
      return sock.remoteAddress + ':' + sock.remotePort
    } catch (e) {
      return uuid.v1()
    }
  }
}

exports.Peers = function (jsonrpc, elements) {
  var instances = {}

  var remove = function (peer) {
    if (peer && instances[peer.id]) {
      peer.eachFetcher(function (fetchId) {
        elements.removeFetcher(peer.id + fetchId)
      })
      peer.fetchers = {}
      elements.removePeer(peer)
      delete instances[peer.id]
    }
  }

  var eachInstance = jetUtils.eachKeyValue(instances)

  var eachPeerFetcherWithAccessIterator = function (element, f) {
    eachInstance(function (peerId, peer) {
      if (access.hasAccess('fetch', peer, element)) {
        peer.eachFetcher(function (fetchId, fetcher) {
          var isFetchOnly = access.isFetchOnly(peer, element)
          f(peerId + fetchId, fetcher, !isFetchOnly)
        })
      }
    })
  }

  this.eachPeerFetcherWithAccess = function () {
    return eachPeerFetcherWithAccessIterator
  }

  this.add = function (sock) {
    var peer = new EventEmitter()
    var peerId = genPeerId(sock)

    peer.sendMessage = function (message) {
      message = JSON.stringify(message)
      sock.send(message)
    }

    sock.on('message', function (message) {
      try {
        jsonrpc.dispatch(peer, message)
      } catch (e) {
        remove(peer)
      }
    })

    peer.id = peerId
    peer.fetchers = {}
    peer.eachFetcher = jetUtils.eachKeyValue(peer.fetchers)
    peer.addFetcher = function (id, fetcher) {
      peer.fetchers[id] = fetcher
    }
    peer.removeFetcher = function (id) {
      delete peer.fetchers[id]
    }
    peer.hasFetchers = function () {
      return Object.keys(peer.fetchers).length !== 0
    }
    instances[peerId] = peer
    sock.once('close', function () {
      peer.emit('disconnect')
      remove(peer)
    })

    sock.once('error',
      /* istanbul ignore next */
      function (err) {
        console.log('sock err', err)
        console.log('removing peer')
        remove(peer)
      })
    return peer
  }
}
