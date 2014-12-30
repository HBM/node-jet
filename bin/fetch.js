#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer();

peer.fetch({}, function (path, event, value) {
	console.log(path, event, value);
});