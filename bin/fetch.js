#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer();

peer.fetch()
	.all()
	.run(function (path, event, value) {
		console.log(path, event, value);
	});