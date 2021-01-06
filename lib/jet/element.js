'use strict'

const jetUtils = require('./utils')
const access = require('./daemon/access')

const Element = function (eachPeerFetcherWithAccess, owningPeer, params, logError) {
  this.fetchers = {}
  this.fetcherIsReadOnly = {}
  this.eachFetcher = jetUtils.eachKeyValue(this.fetchers)
  const path = this.path = params.path
  const lowerPath = this.lowerPath = path.toLowerCase()
  const value = this.value = params.value
  const fetchOnly = this.fetchOnly = params.fetchOnly
  this.peer = owningPeer
  this.access = params.access

  const fetchers = this.fetchers
  const fetcherIsReadOnly = this.fetcherIsReadOnly
  this.logError = logError

  eachPeerFetcherWithAccess(this, function (peerFetchId, fetcher, hasSetAccess) {
    try {
      const isReadOnly = fetchOnly || !hasSetAccess
      const mayHaveInterest = fetcher(path, lowerPath, 'add', value, isReadOnly)
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
  const lowerPath = this.lowerPath
  const value = this.value
  const path = this.path
  const isReadOnly = this.fetcherIsReadOnly
  const logError = this.logError
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

const Elements = function (log) {
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
  const path = params.path
  if (this.instances[path]) {
    throw jetUtils.invalidParams({
      pathAlreadyExists: path
    })
  } else {
    this.instances[path] = new Element(peers, owningPeer, params, this.logError)
  }
}

Elements.prototype.get = function (path) {
  const el = this.instances[path]
  if (!el) {
    throw jetUtils.invalidParams({
      pathNotExists: path
    })
  } else {
    return el
  }
}

Elements.prototype.change = function (path, value, peer) {
  const el = this.get(path)
  if (el.peer !== peer) {
    throw jetUtils.invalidParams({
      foreignPath: path
    })
  } else {
    el.change(value)
  }
}

Elements.prototype.removePeer = function (peer) {
  const toDelete = []
  this.each(function (path, element) {
    if (element.peer === peer) {
      element.remove(path)
      toDelete.push(path)
    }
  })
  const instances = this.instances
  toDelete.forEach(function (path) {
    delete instances[path]
  })
}

Elements.prototype.remove = function (path, peer) {
  const el = this.get(path)
  if (el.peer !== peer) {
    throw jetUtils.invalidParams({
      foreignPath: path
    })
  }
  el.remove()
  delete this.instances[path]
}

Elements.prototype.addFetcher = function (id, fetcher, peer) {
  const logError = this.logError
  this.each(function (path, element) {
    if (access.hasAccess('fetch', peer, element)) {
      let mayHaveInterest
      try {
        const isReadOnly = access.isFetchOnly(peer, element)
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
