#!/usr/bin/env node

var jet = require('node-jet');
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var shared = require('./shared');

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
	var rad = Math.random() * Math.PI;
	var max = shared.canvasSize / 2;
	var radius = 0.8 * max;
	if (Math.random() > 0.5) {
		rad = rad * -1;
	}
	if (Math.random() > 0.8) {
		radius = max * 0.2;
	}
	return {
		x: Math.sin(rad) * radius + max,
		y: Math.cos(rad) * radius + max
	};
};

var edgePos = function () {
	var x = Math.random();
	var size = 0.8;
	if (Math.random() > 0.7) {
		size = 0.4;
	}
	var border = (1 - size) / 2;
	var min = border * shared.canvasSize;
	var max = (size + border) * shared.canvasSize;
	var pos = Math.random() * size * shared.canvasSize + min;
	if (x > 0.75) {
		return {
			x: min,
			y: pos
		};
	} else if (x > 0.5) {
		return {
			x: max,
			y: pos
		};
	} else if (x > 0.25) {
		return {
			x: pos,
			y: max
		};
	} else {
		return {
			x: pos,
			y: min
		};
	}
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
	ant.on('set', function (newVal) {
		var val = this.value();
		val.color = newVal.color;
		return {
			value: val
		};
	});
	peer.add(ant).then(function () {
		ants.push(ant);
	});
};

for (var i = 0; i < 150; ++i) {
	createAnt();
}

var delay = new jet.State('ants/delay', 10);
delay.on('set', jet.State.acceptAny);

var shake = new jet.Method('ants/shake');
shake.on('call', function (args) {
	ants.forEach(function (ant, index) {
		setTimeout(function () {
			var pos = randomPos();
			var color = ant.value().color;
			ant.value({
				pos: pos,
				color: color
			});
		}, index * delay.value());
	});
});

var edge = new jet.Method('ants/edge');
edge.on('call', function (args) {
	ants.forEach(function (ant, index) {
		setTimeout(function () {
			var pos = edgePos();
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
	peer.add(edge),
	peer.add(delay),
	peer.add(add),
	peer.add(remove)
]).then(function () {
	console.log('ants-server ready');
	console.log('listening on port', port);
});