'use strict'

var jetUtils = require('./utils')
var isDefined = jetUtils.isDefined

var createSort = function (options) {
  var sort
  var lt, gt

  if ((!isDefined(options.sort.byValue) && !isDefined(options.sort.byValueField)) || options.sort.byPath) {
    gt = function (a, b) {
      return a.path > b.path
    }
    lt = function (a, b) {
      return a.path < b.path
    }
  } else {
    if (options.sort.byValue) {
      lt = function (a, b) {
        return a.value < b.value
      }
      gt = function (a, b) {
        return a.value > b.value
      }
    } else if (options.sort.byValueField) {
      var fieldStr = Object.keys(options.sort.byValueField)[0]
      var getField = jetUtils.accessField(fieldStr)
      lt = function (a, b) {
        return getField(a.value) < getField(b.value)
      }
      gt = function (a, b) {
        return getField(a.value) > getField(b.value)
      }
    }
  }
  var psort = function (s, a, b) {
    try {
      if (s(a, b)) {
        return -1
      }
    } catch (ignore) {} // eslint-disable-line no-empty
    return 1
  }

  if (options.sort.descending) {
    sort = function (a, b) {
      return psort(gt, a, b)
    }
  } else {
    sort = function (a, b) {
      return psort(lt, a, b)
    }
  }
  return sort
}

exports.create = function (options, notify) {
  var from
  var to
  var matches = []
  var sorted = {}
  var index = {}
  var sort
  var n = -1

  from = options.sort.from || 1
  to = options.sort.to || 10

  sort = createSort(options)

  var isInRange = function (i) {
    return typeof i === 'number' && i >= from && i <= to
  }

  var sorter = function (notification, initializing) {
    var event = notification.event
    var path = notification.path
    var value = notification.value
    var lastMatchesLength = matches.length
    var lastIndex
    var newIndex
    var wasIn
    var isIn
    var start
    var stop
    var changes = []
    var newN
    var news
    var olds
    var ji
    var i
    var match

    if (initializing) {
      if (isDefined(index[path])) {
        return
      }
      match = {
        path: path,
        value: value
      }
      if (notification.fetchOnly) {
        match.fetchOnly = true
      }
      matches.push(match)
      index[path] = matches.length
      return
    }
    lastIndex = index[path]
    if (event === 'remove') {
      if (isDefined(lastIndex)) {
        matches.splice(lastIndex - 1, 1)
        delete index[path]
      } else {
        return
      }
    } else if (isDefined(lastIndex)) {
      matches[lastIndex - 1].value = value
    } else {
      match = {
        path: path,
        value: value
      }
      if (notification.fetchOnly) {
        match.fetchOnly = true
      }
      matches.push(match)
    }

    matches.sort(sort)

    matches.forEach(function (m, mindex) {
      index[m.path] = mindex + 1
    })

    if (matches.length < from && lastMatchesLength < from) {
      return
    }

    newIndex = index[path]

    var change

    if (isDefined(lastIndex) && isDefined(newIndex) && newIndex === lastIndex && isInRange(newIndex)) {
      if (event === 'change') {
        change = {
          path: path,
          value: value,
          index: newIndex
        }
        if (matches[newIndex - 1].fetchOnly) {
          change.fetchOnly = true
        }
        notify({
          n: n,
          changes: [change]
        })
      }
      return
    }

    isIn = isInRange(newIndex)
    wasIn = isInRange(lastIndex)

    if (isIn && wasIn) {
      start = Math.min(lastIndex, newIndex)
      stop = Math.max(lastIndex, newIndex)
    } else if (isIn && !wasIn) {
      start = newIndex
      stop = Math.min(to, matches.length)
    } else if (!isIn && wasIn) {
      start = lastIndex
      stop = Math.min(to, matches.length)
    } else {
      start = from
      stop = Math.min(to, matches.length)
    }

    for (i = start; i <= stop; i = i + 1) {
      ji = i - 1 // javascript index is 0 based
      news = matches[ji]
      olds = sorted[ji]
      if (news && news !== olds) {
        change = {
          path: news.path,
          value: news.value,
          index: i
        }
        if (news.fetchOnly) {
          change.fetchOnly = true
        }
        changes.push(change)
      }
      sorted[ji] = news
      if (news === undefined) {
        break
      }
    }

    newN = Math.min(to, matches.length) - from + 1
    if (newN !== n || changes.length > 0) {
      n = newN
      notify({
        changes: changes,
        n: n
      })
    }
  }

  var flush = function () {
    var changes = []
    var news
    var ji
    var i
    matches.sort(sort)
    matches.forEach(function (m, mindex) {
      index[m.path] = mindex + 1
    })

    n = 0

    for (i = from; i <= to; i = i + 1) {
      ji = i - 1
      news = matches[ji]
      if (news) {
        news.index = i
        n = i - from + 1
        sorted[ji] = news
        changes.push(news)
      }
    }

    notify({
      changes: changes,
      n: n
    })
  }

  return {
    sorter: sorter,
    flush: flush
  }
}
