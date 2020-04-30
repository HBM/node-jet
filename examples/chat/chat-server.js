#!/usr/bin/env node

var jet = require('node-jet')
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

var port = parseInt(process.argv[2]) || 80
var internalPort = 10222

// Serve this dir as static content 
var serve = serveStatic('./')

// Create Webserver 
var httpServer = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

httpServer.listen(port)

// Create Jet Daemon
var daemon = new jet.Daemon()
daemon.listen({
  server: httpServer, // embed jet websocket upgrade handler
  tcpPort: internalPort // nodejitsu prevents internal websocket connections
})

// Create Jet Peer
var peer = new jet.Peer({
  port: internalPort
})

// the messages state is simply an array
// it cannot be "set" directly.
// instead use 'chat/append' and 'chat/clear'
// to modify it.
var messages = new jet.State('chat/messages', [])

var append = new jet.Method('chat/append')
append.on('call', function (args) {
  // get last messages
  var msgs = messages.value()
  // append new one
  msgs.push(args.message)
  // publish change
  messages.value(msgs)
})

var clear = new jet.Method('chat/clear')
clear.on('call', function () {
  messages.value([])
})

// connect peer and register methods
Promise.all([
  peer.connect(),
  peer.add(messages),
  peer.add(append),
  peer.add(clear)
]).then(function () {
  console.log('ants-server ready')
  console.log('listening on port', port)
})
