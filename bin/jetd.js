#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var jet = require('../lib/jet');

var radarPort = parseInt(process.argv[3]) || 8080;
var radarDir = process.argv[2] || '../radar/';

jet.createDaemon().listen({
    tcpPort: 11122,
    wsPort: 11123
});


http.createServer(function (req, res) {
  fs.readFile(radarDir + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(radarPort);


