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
