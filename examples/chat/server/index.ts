#!/usr/bin/env node

import { Daemon, Method, Peer, State } from '../../../src'

const wsPort = parseInt(process.argv[2]) || 8081
const internalPort = 10222

// Create Jet Daemon
var daemon = new Daemon({
  features: {
    fetch: 'full',
    asNotification: false
  }
})
daemon.listen({
  tcpPort: internalPort,
  wsPort: wsPort
})
console.log('chat-server ready')
console.log('listening on port', wsPort)

// Create Jet Peer
const peer = new Peer({
  port: internalPort
})

// the messages state is simply an array
// it cannot be "set" directly.
// instead use 'chat/append' and 'chat/clear'
// to modify it.
const messages = new State<string[]>('chat/messages', [])

const append = new Method('chat/append')
append.on('call', (args) => {
  // get last messages
  var msgs = messages.value()
  // append new one
  msgs.push(args.message)
  // publish change
  messages.value([...msgs])
})

const clear = new Method('chat/clear')
clear.on('call', () => {
  messages.value([])
})

peer
  .connect()
  .then(() =>
    Promise.all([peer.add(messages), peer.add(append), peer.add(clear)])
  )
  .then(() => {})
