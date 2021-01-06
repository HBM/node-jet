#!/usr/bin/env node
'use strict'
const jet = require('../lib/jet')
const yargs = require('yargs/yargs')(process.argv.slice(2))
const argv = yargs
  .usage('This is Lightweight, Realtime Message Bus for the Web\n\nUsage: $0 --url [WS URL] [--ip [ip/addr] --port [num]]')
  .help('help').alias('help', 'h')
  .hide('version')
  .options({
    url: {
      description: '<WS URL> websocket URL',
      requiresArg: true,
      required: true
    },
    ip: {
      description: '<ip> IP address',
      requiresArg: true,
      required: true
    },
    port: {
      alias: 'p',
      description: '<port> output file name',
      requiresArg: true,
      required: true,
      type: 'number'
    }
  })
  .argv

if (argv._.length === 0) {
  yargs.showHelp()
} else {
  const peer = new jet.Peer({
    url: argv.url,
    ip: argv.ip,
    port: argv.port
  })

  const eventSymbols = {
    add: '+++',
    remove: '---',
    change: '==='
  }

  const display = function (data) {
    const now = new Date().toLocaleTimeString()
    const symbol = eventSymbols[data.event]
    const isState = data.value !== undefined
    const type = (isState && '<S>') || '<M>'
    console.log(symbol + ' ' + data.path + ' ' + type + ' ' + now)
    if (isState) {
      console.log(JSON.stringify(data.value, null, '\t'))
    }
  }

  peer.connect().then(function () {
    console.log(new Date(), 'Connected to Daemon')
    const all = new jet.Fetcher()
      .all()
      .on('data', display)
    peer.fetch(all)
  })

  peer.closed().then(function () {
    console.log('Connection to Daemon closed')
  })
}
