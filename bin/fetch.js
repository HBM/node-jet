#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer();

var all = new jet.Fetcher()
	.all()
	.on('data', function (path, event, value) {
		console.log(path, event, value);
	});

peer.fetch(all);