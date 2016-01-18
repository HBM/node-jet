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
