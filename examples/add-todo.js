#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer({
	url: 'ws://localhost:1234'
});

peer.call('todo/add', [{
	title: 'blabla',
	completed: false
}], {
	success: function () {
		console.log('ok');
	},
	error: function (err) {
		console.log(err);
	}
});