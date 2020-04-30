'use strict'

var jetUtils = require('./utils')

var generators = {}

generators.lessThan = function (other) {
  return function (x) {
    return x < other
  }
}

generators.greaterThan = function (other) {
  return function (x) {
    return x > other
  }
}

generators.equals = function (other) {
  return function (x) {
    return x === other
  }
}

generators.equalsNot = function (other) {
  return function (x) {
    return x !== other
  }
}

generators.isType = function (type) {
  return function (x) {
    return typeof x === type // eslint-disable-line
  }
}

var isDefined = jetUtils.isDefined

var generatePredicate = function (op, val) {
  var gen = generators[op]
  if (!gen) {
    throw jetUtils.invalidParams('unknown generator ' + op)
  } else {
    return gen(val)
  }
}

var createValuePredicates = function (valueOptions) {
  var predicates = []
  jetUtils.eachKeyValue(valueOptions)(function (op, val) {
    predicates.push(generatePredicate(op, val))
  })
  return predicates
}

var createValueFieldPredicates = function (valueFieldOptions) {
  var predicates = []
  jetUtils.eachKeyValue(valueFieldOptions)(function (fieldStr, rule) {
    var fieldPredicates = []
    var accessor = jetUtils.accessField(fieldStr)
    jetUtils.eachKeyValue(rule)(function (op, val) {
      fieldPredicates.push(generatePredicate(op, val))
    })
    var fieldPredicate = function (value) {
      if (typeof value !== 'object') {
        return false
      }
      try {
        var field = accessor(value)
        for (var i = 0; i < fieldPredicates.length; ++i) {
          if (!fieldPredicates[i](field)) {
            return false
          }
        }
        return true
      } catch (e) {
        return false
      }
    }
    predicates.push(fieldPredicate)
  })

  return predicates
}

exports.create = function (options) {
  // sorting by value implicitly defines value matcher rule against expected type
  if (options.sort) {
    if (options.sort.byValue) {
      options.value = options.value || {}
      options.value.isType = options.sort.byValue
    } else if (options.sort.byValueField) {
      var fieldName = Object.keys(options.sort.byValueField)[0]
      var type = options.sort.byValueField[fieldName]
      options.valueField = options.valueField || {}
      options.valueField[fieldName] = options.valueField[fieldName] || {}
      options.valueField[fieldName].isType = type
    }
  }

  if (!isDefined(options.value) && !isDefined(options.valueField)) {
    return
  }

  var predicates

  if (isDefined(options.value)) {
    predicates = createValuePredicates(options.value)
  } else if (isDefined(options.valueField)) {
    predicates = createValueFieldPredicates(options.valueField)
  }

  return function (value) { // eslint-disable-line consistent-return
    try {
      for (var i = 0; i < predicates.length; ++i) {
        if (!predicates[i](value)) {
          return false
        }
      }
      return true
    } catch (e) {
      return false
    }
  }
}
