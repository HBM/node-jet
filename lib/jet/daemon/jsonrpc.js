var util = require('util');
var utils = require('../utils');
var assert = require('assert');
var router = require('./router');

var log = utils.noop;

exports.setLog = function (logf) {
	log = logf;
};

var services = {};

exports.setServices = function (servs) {
	services = servs;
};

var dispatchRequest = function (peer, message) {
	assert.ok(message.method);
	var service = services[message.method];
	if (service) {
		service(peer, message);
	} else {
		var error = utils.methodNotFound(message.method);
		peer.sendMessage({
			id: message.id,
			error: error
		});
	}
};

var dispatchNotification = function (peer, message) {
	assert.ok(message.method);
	var service = services[message.method];
	if (service) {
		service(peer, message);
	}
};

var dispatchMessage = function (peer, message) {
	if (message.id) {
		if (message.method) {
			dispatchRequest(peer, message);
		} else if (message.result !== null || message.error !== null) {
			router.response(peer, message);
		} else {
			var error = utils.invalidRequest(message);
			peer.sendMessage({
				id: message.id,
				error: error
			});
			log('invalid request', message);
		}
	} else if (message.method) {
		dispatchNotification(peer, message);
	} else {
		log('invalid message', message);
	}
};

exports.dispatch = function (peer, message) {
	try {
		message = JSON.parse(message);
	} catch (e) {
		peer.sendMessage(utils.parseError(e));
		throw e;
	}
	if (util.isArray(message)) {
		message.forEach(function (msg) {
			dispatchMessage(peer, msg);
		});
	} else {
		dispatchMessage(peer, message);
	}
};
