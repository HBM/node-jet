#!/usr/bin/env node

var jet = require('node-jet');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');

var port = parseInt(process.argv[2]) || 80;
var internalPort = 10200;

// Serve this dir as static content 
var serve = serveStatic('./');

// Create Webserver 
var httpServer = http.createServer(function (req, res) {
	var done = finalhandler(req, res);
	serve(req, res, done);
});

httpServer.listen(port);

// Create Jet Daemon
var daemon = new jet.Daemon();
daemon.listen({
	server: httpServer, // embed jet websocket upgrade handler
	tcpPort: internalPort // nodejitsu prevents internal websocket connections
});

// Create Jet Peer
var peer = new jet.Peer({
	port: internalPort
});

[1, 2, 3].forEach(function (item) {
	var ant = new jet.State('ants/#' + item, {
		x: 10 + item * 10,
		y: 20
	});
	peer.add(ant);
	setInterval(function () {
		var lastX = ant.value().x;
		var lastY = ant.value().y;
		lastY = Math.abs(Math.random()) * 200;
		ant.value({
			x: lastX,
			y: lastY
		});
	}, 300 + Math.abs(Math.random()) * 600);
});

// connect peer and register methods
jet.Promise.all([
	peer.connect(),
]).then(function () {
	console.log('ants-server ready');
	console.log('listening on port', port);
});