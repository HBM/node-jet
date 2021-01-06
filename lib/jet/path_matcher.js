'use strict'

const jetUtils = require('./utils')
const isDefined = jetUtils.isDefined

const contains = function (what) {
  return function (path) {
    return path.indexOf(what) !== -1
  }
}

const containsAllOf = function (whatArray) {
  return function (path) {
    let i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false
      }
    }
    return true
  }
}

const containsOneOf = function (whatArray) {
  return function (path) {
    let i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true
      }
    }
    return false
  }
}

const startsWith = function (what) {
  return function (path) {
    return path.substr(0, what.length) === what
  }
}

const endsWith = function (what) {
  return function (path) {
    return path.lastIndexOf(what) === (path.length - what.length)
  }
}

const equals = function (what) {
  return function (path) {
    return path === what
  }
}

const equalsOneOf = function (whatArray) {
  return function (path) {
    let i
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path === whatArray[i]) {
        return true
      }
    }
    return false
  }
}

const negate = function (gen) {
  return function () {
    const f = gen.apply(undefined, arguments)
    return function () {
      return !f.apply(undefined, arguments)
    }
  }
}

const generators = {
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

const predicateOrder = [
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
  const po = options.path
  const ci = po.caseInsensitive
  let pred
  const predicates = []

  predicateOrder.forEach(function (name) {
    let gen
    let option = po[name]
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

  const applyPredicates = function (path) {
    for (let i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false
      }
    }
    return true
  }

  let pathMatcher

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
