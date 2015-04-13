#!/usr/bin/env node

var readline = require('readline');
var jet = require('../lib/jet');

var peer = new jet.Peer({
	ip: 'hbm-000a40'
});

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('path:', function (path) {
	console.log('creating state:', path);
	var state = peer.state({
		path: path,
		value: 0
	});

	var waitNewValue = function () {
		rl.question('value (JSON):', function (value) {
			console.log('changing state to:', JSON.parse(value));
			state.value(JSON.parse(value));
			waitNewValue();
		});
	};
	waitNewValue();
});