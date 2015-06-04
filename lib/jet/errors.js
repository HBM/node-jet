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

var BaseError = function () {
	var tmp = Error.call(this, arguments[1]);
	tmp.name = this.name = 'jet.' + arguments[0];
	this.message = tmp.message;
	this.url = arguments[2] || 'http://github.com/lipp/blob/master/node-jet/doc/peer.md';
	this.stack = tmp.stack;
};

BaseError.prototype = Error.prototype;

var DaemonError = function (msg, url) {
	BaseError.call(this, 'DaemonError', msg, url);
};

DaemonError.prototype = BaseError.prototype;

exports.DaemonError = DaemonError;
exports.BaseError = BaseError;

var PeerError = function (msg, url) {
	BaseError.call(this, 'PeerError', msg, url);
};

PeerError.prototype = BaseError.prototype;
exports.PeerError = PeerError;

// authenticate
var InvalidUser = function () {
	BaseError.call(this, 'InvalidUser', 'The specified user does not exist');
};

InvalidUser.prototype = BaseError.prototype;
exports.InvalidUser = InvalidUser;

// authenticate
var InvalidPassword = function () {
	BaseError.call(this, 'InvalidPassword', 'The specified password is wrong');
};

InvalidPassword.prototype = BaseError.prototype;
exports.InvalidPassword = InvalidPassword;

// connect / all
var ConnectionClosed = function (err) {
	BaseError.call(this, 'ConnectionClosed', err);
};

ConnectionClosed.prototype = BaseError.prototype;
exports.ConnectionClosed = ConnectionClosed;

// set / call
var NotFound = function () {
	BaseError.call(this, 'NotFound', 'No State/Method matching the specified path');
};

NotFound.prototype = BaseError.prototype;
exports.NotFound = NotFound;

// set / call
var InvalidArgument = function (msg, url) {
	BaseError.call(this, 'InvalidArgument', msg || 'The provided argument(s) have been refused by the State/Method', url);
};

InvalidArgument.prototype = BaseError.prototype;
exports.InvalidArgument = InvalidArgument;

// set / call
var PeerTimeout = function () {
	BaseError.call(this, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout');
};

PeerTimeout.prototype = BaseError.prototype;
exports.PeerTimeout = PeerTimeout;

var Occupied = function () {
	BaseError.call(this, 'Occupied', 'A State/Method with the same path has already been added');
};

Occupied.prototype = BaseError.prototype;
exports.Occupied = Occupied;

var FetchOnly = function () {
	BaseError.call(this, 'FetchOnly', 'The State cannot be modified');
};

FetchOnly.prototype = BaseError.prototype;
exports.FetchOnly = FetchOnly;

exports.createTypedError = function (jsonrpcError) {
	var code = jsonrpcError.code;
	var data = jsonrpcError.data;
	var dataType = typeof data;
	if (code === INVALID_PARAMS_CODE) {
		if (dataType === 'object') {
			if (data.pathNotExists) {
				return new NotFound();
			} else if (data.pathAlreadyExists) {
				return new Occupied();
			} else if (data.fetchOnly) {
				return new FetchOnly();
			} else if (data.invalidUser) {
				return new InvalidUser();
			} else if (data.invalidPassword) {
				return new InvalidPassword();
			}
		}
		console.log(data);
	}
};