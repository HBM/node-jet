#!/usr/bin/env node

var jet = require('../lib/jet')
var argv = require('optimist')
  .usage('Usage: $0 --url [WS URL] [--ip [ip/addr] --port [num]]')
  .argv

var peer = new jet.Peer({
  url: argv.url,
  ip: argv.ip,
  port: argv.port
})

var eventSymbols = {
  add: '+++',
  remove: '---',
  change: '==='
}

var display = function (data) {
  var now = new Date().toLocaleTimeString()
  var symbol = eventSymbols[data.event]
  var isState = data.value !== undefined
  var type = (isState && '<S>') || '<M>'
  console.log(symbol + ' ' + data.path + ' ' + type + ' ' + now)
  if (isState) {
    console.log(JSON.stringify(data.value, null, '\t'))
  }
}

peer.connect().then(function () {
  console.log(new Date(), 'Connected to Daemon')
  var all = new jet.Fetcher()
    .all()
    .on('data', display)
  peer.fetch(all)
})

peer.closed().then(function () {
  console.log('Connection to Daemon closed')
})
