#!/usr/bin/env node

var jet = require('../lib/jet');

// connect via trivial protocol
var peer = new jet.Peer({
	ip: 'hbm-000a40'
});

// wait for test-state to become available
peer.fetch()
	.path('equals', process.argv[2] || 'test-state')
	.run(function (path, event, value) {
		console.log(path, event, value);
	});