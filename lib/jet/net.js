/*
 * dirty hack to trick webpack (without config => next.js) to ignore
 * the require('net') statements
 */
const webpackIgnore = { r: module.require }
const net = typeof window === 'undefined' && webpackIgnore.r('net')

module.exports = net || { Socket: function () {} }
