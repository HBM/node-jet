/*
 * dirty hack to trick webpack (without config => next.js) to ignore
 * the require('net') statements
 */
var webpackIgnore = { r: module.require }
var net = typeof window === 'undefined' && webpackIgnore.r('net')

module.exports = net || { Socket: function () {} }
