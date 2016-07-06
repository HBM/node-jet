'use strict'

var jetUtils = require('./utils')
var isDefined = jetUtils.isDefined

var contains = function (what) {
  return function (path) {
    return path.indexOf(what) !== -1
  }
}

var containsAllOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false
      }
    }
    return true
  }
}

var containsOneOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true
      }
    }
    return false
  }
}

var startsWith = function (what) {
  return function (path) {
    return path.substr(0, what.length) === what
  }
}

var endsWith = function (what) {
  return function (path) {
    return path.lastIndexOf(what) === (path.length - what.length)
  }
}

var equals = function (what) {
  return function (path) {
    return path === what
  }
}

var equalsOneOf = function (whatArray) {
  return function (path) {
    var i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path === whatArray[i]) {
        return true
      }
    }
    return false
  }
}

var negate = function (gen) {
  return function () {
    var f = gen.apply(undefined, arguments)
    return function () {
      return !f.apply(undefined, arguments)
    }
  }
}

var generators = {
  equals: equals,
  equalsNot: negate(equals),
  contains: contains,
  containsNot: negate(contains),
  containsAllOf: containsAllOf,
  containsOneOf: containsOneOf,
  startsWith: startsWith,
  startsNotWith: negate(startsWith),
  endsWith: endsWith,
  endsNotWith: negate(endsWith),
  equalsOneOf: equalsOneOf,
  equalsNotOneOf: negate(equalsOneOf)
}

var predicateOrder = [
  'equals',
  'equalsNot',
  'endsWith',
  'startsWith',
  'contains',
  'containsNot',
  'containsAllOf',
  'containsOneOf',
  'startsNotWith',
  'endsNotWith',
  'equalsOneOf',
  'equalsNotOneOf'
]

exports.create = function (options) {
  if (!isDefined(options.path)) {
    return
  }
  var po = options.path
  var ci = po.caseInsensitive
  var pred
  var predicates = []

  predicateOrder.forEach(function (name) {
    var gen
    var option = po[name]
    if (isDefined(option)) {
      gen = generators[name]
      if (ci) {
        if (Array.isArray(option)) {
          option = option.map(function (op) {
            return op.toLowerCase()
          })
        } else {
          option = option.toLowerCase()
        }
      }
      predicates.push(gen(option))
    }
  })

  var applyPredicates = function (path) {
    for (var i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false
      }
    }
    return true
  }

  var pathMatcher

  if (ci) {
    if (predicates.length === 1) {
      pred = predicates[0]
      pathMatcher = function (path, lowerPath) {
        return pred(lowerPath)
      }
    } else {
      pathMatcher = function (path, lowerPath) {
        return applyPredicates(lowerPath)
      }
    }
  } else {
    if (predicates.length === 1) {
      pred = predicates[0]
      pathMatcher = function (path) {
        return pred(path)
      }
    } else {
      pathMatcher = function (path) {
        return applyPredicates(path)
      }
    }
  }

  return pathMatcher // eslint-disable-line consistent-return
}
