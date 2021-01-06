#!/usr/bin/env node

const fs = require('fs')
const http = require('http')
const jet = require('../lib/jet')
const path = require('path')

const radarPort = parseInt(process.argv[3], 10) || 8080
const radarDir = process.argv[2] || '../radar/'

const mime = {
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
}

const daemon = new jet.Daemon()

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
