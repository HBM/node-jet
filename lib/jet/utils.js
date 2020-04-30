'use strict'

var errors = require('./errors')

var invalidParams = function (data) {
  return {
    message: 'Invalid params',
    code: -32602,
    data: data
  }
}

exports.invalidParams = invalidParams

exports.parseError = function (data) {
  return {
    message: 'Parse error',
    code: -32700,
    data: data
  }
}

exports.methodNotFound = function (data) {
  return {
    message: 'Method not found',
    code: -32601,
    data: data
  }
}

exports.invalidRequest = function (data) {
  return {
    message: 'Invalid Request',
    code: -32600,
    data: data
  }
}

var isDefined = function (x) {
  if (typeof x === 'undefined' || x === null) {
    return false
  }
  return true
}

exports.checked = function (tab, key, typename) {
  var p = tab[key]
  if (isDefined(p)) {
    if (typename) {
      if (typeof (p) === typename) { // eslint-disable-line
        return p
      } else {
        throw invalidParams({
          wrongType: key,
          got: tab
        })
      }
    } else {
      return p
    }
  } else {
    throw invalidParams({
      missingParam: key,
      got: tab
    })
  }
}

exports.optional = function (tab, key, typename) {
  var p = tab[key]
  if (isDefined(p)) {
    if (typename) {
      if (typeof (p) === typename) { // eslint-disable-line
        return p
      }
    } else {
      throw invalidParams({
        wrongType: key,
        got: tab
      })
    }
  }
}

exports.isDefined = isDefined

exports.noop = function () {}

exports.accessField = function (fieldStr) {
  if (fieldStr.substr(0, 1) !== '[') {
    fieldStr = '.' + fieldStr
  }
  var funStr = 'return t' + fieldStr
  return new Function('t', funStr) // eslint-disable-line no-new-func
}

exports.errorObject = function (err) {
  var data
  if (typeof err === 'object' && isDefined(err.code) && isDefined(err.message)) {
    return err
  } else {
    if (err instanceof errors.InvalidArgument) {
      return invalidParams({
        invalidArgument: err
      })
    } else {
      if (typeof err === 'object') {
        data = {}
        data.message = err.message
        data.stack = err.stack
        data.lineNumber = err.lineNumber
        data.fileName = err.fileName
      } else {
        data = {}
        data.message = err
        data.stack = 'no stack available'
      }
      return {
        code: -32603,
        message: 'Internal error',
        data: data
      }
    }
  }
}

exports.eachKeyValue = function (obj) {
  return function (f) {
    for (var key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        f(key, obj[key])
      }
    }
  }
}
