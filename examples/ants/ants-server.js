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

var randomPos = function () {
	return {
		x: Math.abs(Math.random() * 200),
		y: Math.abs(Math.random() * 200)
	};
};

var randomColor = function () {
	var hue = Math.abs(Math.random()) * 360;
	var saturation = 40 + Math.abs(Math.random()) * 60;
	return 'hsl(' + hue + ',' + saturation + '%,60%)';
};

var ants = [];

var id = 0;

var createAnt = function () {
	var pos = randomPos();
	var color = randomColor();
	var ant = new jet.State('ants/#' + id++, {
		pos: pos,
		color: color
	});
	peer.add(ant).then(function () {
		ants.push(ant);
	});
};

[1, 2, 3].forEach(createAnt);

var delay = new jet.State('ants/delay', 100);
delay.on('set', jet.State.acceptAny);

var shake = new jet.Method('ants/shake');
shake.on('call', function (args) {
	ants.forEach(function (ant, index) {
		setTimeout(function () {
			var pos = randomPos();
			var color = randomColor();
			ant.value({
				pos: pos,
				color: color
			});
		}, index * delay.value());
	});
});

var add = new jet.Method('ants/add');
add.on('call', function (args) {
	createAnt();
});

var remove = new jet.Method('ants/remove');
remove.on('call', function (args) {
	var last = ants.pop();
	last.remove();
});

// connect peer and register methods
jet.Promise.all([
	peer.connect(),
	peer.add(shake),
	peer.add(delay),
	peer.add(add),
	peer.add(remove)
]).then(function () {
	console.log('ants-server ready');
	console.log('listening on port', port);
});