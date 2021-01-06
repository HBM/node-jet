'use strict'

const jetUtils = require('../utils')
const isDefined = jetUtils.isDefined

const intersects = function (arrayA, arrayB) {
  for (let i = 0; i < arrayA.length; ++i) {
    if (arrayB.indexOf(arrayA[i]) !== -1) {
      return true
    }
  }
  return false
}

const grantAccess = function (accessName, access, auth) {
  const groupName = accessName + 'Groups'
  if (access[groupName]) {
    return intersects(access[groupName], auth[groupName])
  } else {
    return true
  }
}

const hasAccess = function (accessName, peer, element) {
  if (!isDefined(element.access)) {
    return true
  } else if (!isDefined(peer.auth)) {
    return false
  } else {
    return grantAccess(accessName, element.access, peer.auth)
  }
}

exports.isFetchOnly = function (peer, element) {
  if (element.fetchOnly) {
    return true
  } else {
    if (isDefined(element.value)) {
      return !hasAccess('set', peer, element)
    } else {
      return !hasAccess('call', peer, element)
    }
  }
}

exports.intersects = intersects
exports.grantAccess = grantAccess
exports.hasAccess = hasAccess
