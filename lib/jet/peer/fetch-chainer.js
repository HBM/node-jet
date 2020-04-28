'use strict'

var Fetcher = require('./fetch').Fetcher
var FakeFetcher = require('./fetch').FakeFetcher

var FetchChainer = function () {
  this.rule = {}
}

FetchChainer.prototype.on = function (event, cb) {
  if (event === 'data') {
    this._dataDispatcher = cb
    return this
  } else {
    throw new Error('invalid event')
  }
}

FetchChainer.prototype.fetch = function (asNotification) {
  if (this._stopped) {
    return Promise.resolve()
  }
  if (!this._fetcher) {
    if (this.variant === 'simple') {
      this._fetcher = new FakeFetcher(this.jsonrpc, this.rule, this._dataDispatcher, asNotification)
    } else {
      this._fetcher = new Fetcher(this.jsonrpc, this.rule, this._dataDispatcher, asNotification)
    }
  }
  return this._fetcher.fetch()
}

FetchChainer.prototype.unfetch = function () {
  if (this._fetcher) {
    return this._fetcher.unfetch()
  } else {
    this._stopped = true
    return Promise.resolve()
  }
}

FetchChainer.prototype.isFetching = function () {
  if (this._fetcher) {
    return this._fetcher.isFetching()
  } else {
    return false
  }
}

FetchChainer.prototype.all = function () {
  return this
}

FetchChainer.prototype.expression = function (expression) {
  this.rule = expression
  return this
}

FetchChainer.prototype.path = function (match, comp) {
  this.rule.path = this.rule.path || {}
  this.rule.path[match] = comp
  return this
}

FetchChainer.prototype.pathCaseInsensitive = function () {
  this.rule.path = this.rule.path || {}
  this.rule.path.caseInsensitive = true
  return this
}

FetchChainer.prototype.key = function (key, match, comp) {
  this.rule.valueField = this.rule.valueField || {}
  this.rule.valueField[key] = {}
  this.rule.valueField[key][match] = comp
  return this
}

FetchChainer.prototype.value = function () {
  var args = Array.prototype.slice.call(arguments, 0)
  if (args.length === 2) {
    var match = args[0]
    var comp = args[1]
    this.rule.value = this.rule.value || {}
    this.rule.value[match] = comp
    return this
  } else {
    return this.key(args[0], args[1], args[2])
  }
}

var defaultSort = function () {
  return {
    asArray: true
  }
}

FetchChainer.prototype._sortObject = function () {
  this.rule.sort = this.rule.sort || defaultSort()
  return this.rule.sort
}

FetchChainer.prototype.differential = function () {
  this._sortObject().asArray = false
  return this
}

FetchChainer.prototype.ascending = function () {
  this._sortObject().descending = false
  return this
}

FetchChainer.prototype.descending = function () {
  this._sortObject().descending = true
  return this
}

FetchChainer.prototype.sortByPath = function () {
  this._sortObject().byPath = true
  return this
}

FetchChainer.prototype.sortByKey = function (key, type) {
  var sort = this._sortObject()
  sort.byValueField = {}
  sort.byValueField[key] = type
  return this
}

FetchChainer.prototype.sortByValue = function () {
  var args = Array.prototype.slice.call(arguments, 0)
  var sort = this._sortObject()
  if (args.length === 1) {
    sort.byValue = args[0]
  } else {
    return this.sortByKey(args[0], args[1])
  }
  return this
}

FetchChainer.prototype.range = function (from, to) {
  var sort = this._sortObject()
  sort.from = from
  sort.to = to || from + 20
  return this
}

module.exports.FetchChainer = FetchChainer
