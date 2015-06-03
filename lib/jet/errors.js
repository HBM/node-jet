'use strict';

var INVALID_PARAMS_CODE = -32602;

exports.invalidParams = function (data) {
	return {
		message: 'Invalid params',
		code: INVALID_PARAMS_CODE,
		data: data
	};
};
exports.methodNotFound = function (data) {
	return {
		message: 'Method not found',
		code: -32601,
		data: data
	};
};
exports.invalidRequest = function (data) {
	return {
		message: 'Invalid Request',
		code: -32600,
		data: data
	};
};

var JetError = function () {
	var tmp = Error.call(this, arguments[1]);
	tmp.name = this.name = 'jet.' + arguments[0];
	this.message = tmp.message;
	this.url = arguments[2] || 'http://github.com/lipp/blob/master/node-jet/doc/peer.md';
	this.stack = tmp.stack;
};

JetError.prototype = Error.prototype;

var DaemonError = function (msg, url) {
	JetError.call(this, 'DaemonError', msg, url);
};

DaemonError.prototype = JetError.prototype;

exports.DaemonError = DaemonError;
exports.JetError = JetError;

var PeerError = function (msg, url) {
	JetError.call(this, 'PeerError', msg, url);
};

PeerError.prototype = JetError.prototype;
exports.PeerError = PeerError;

// authenticate
var InvalidUser = function () {
	JetError.call(this, 'InvalidUser', 'The specified user does not exist');
};

InvalidUser.prototype = JetError.prototype;
exports.InvalidUser = InvalidUser;

// authenticate
var InvalidPassword = function () {
	JetError.call(this, 'InvalidPassword', 'The specified password is wrong');
};

InvalidPassword.prototype = JetError.prototype;
exports.InvalidPassword = InvalidPassword;

// connect / all
var ConnectionError = function (err) {
	JetError.call(this, 'ConnectionError', err);
};

ConnectionError.prototype = JetError.prototype;
exports.ConnectionError = ConnectionError;

// set / call
var NotFound = function () {
	JetError.call(this, 'NotFound', 'No State/Method matching the specified path');
};

NotFound.prototype = JetError.prototype;
exports.NotFound = NotFound;

// set / call
var InvalidArgument = function (msg, url) {
	JetError.call(this, 'InvalidArgument', msg || 'The provided argument(s) have been refused by the State/Method', url);
};

InvalidArgument.prototype = JetError.prototype;
exports.InvalidArgument = InvalidArgument;

// set / call
var PeerTimeout = function () {
	JetError.call(this, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout');
};

PeerTimeout.prototype = JetError.prototype;
exports.PeerTimeout = PeerTimeout;

exports.createTypedError = function (jsonrpcError) {
	var code = jsonrpcError.code;
	var data = jsonrpcError.data;
	var dataType = typeof data;
	if (code === INVALID_PARAMS_CODE) {
		if (dataType === 'object') {
			if (data.pathNotExists) {
				return new NotFound();
			}
		}
		console.log(data);
	}
};