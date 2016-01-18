#!/usr/bin/env node

var fs = require('fs')
var http = require('http')
var jet = require('../lib/jet')
var path = require('path')

var radarPort = parseInt(process.argv[3], 10) || 8080
var radarDir = process.argv[2] || '../radar/'

var mime = {
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
}

var daemon = new jet.Daemon()

daemon.listen({
  tcpPort: 11122,
  wsPort: 11123
})

http.createServer(function (req, res) {
  if (req.url === '/') {
    req.url = '/radar.html'
  }
  fs.readFile(radarDir + req.url, function (err, data) {
    if (err) {
      res.writeHead(404)
      res.end(JSON.stringify(err))
      return
    }
    res.setHeader('Content-Type', mime[path.extname(req.url)])
    res.writeHead(200)
    res.end(data)
  })
}).listen(radarPort)
