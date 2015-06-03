'use strict';

exports.invalidParams = function (data) {
	return {
		message: 'Invalid params',
		code: -32602,
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
var InvalidPath = function () {
	JetError.call(this, 'InvalidPath', 'No State/Method matching the specified path');
};

InvalidPath.prototype = JetError.prototype;
exports.InvalidPath = InvalidPath;

// set / call
var InvalidArgument = function (msg, url) {
	JetError.call(this, 'InvalidArgument', msg || 'The provided argument(s) are invalid', url);
};

InvalidArgument.prototype = JetError.prototype;
exports.InvalidArgument = InvalidArgument;

// set / call
var Timeout = function () {
	JetError.call(this, 'Timeout', 'The operation timed out');
};

Timeout.prototype = JetError.prototype;
exports.Timeout = Timeout;