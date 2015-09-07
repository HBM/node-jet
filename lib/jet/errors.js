'use strict';

var INVALID_PARAMS_CODE = -32602;
var INTERNAL_ERROR_CODE = -32603;
var RESPONSE_TIMEOUT_CODE = -32001;

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

exports.responseTimeout = function (data) {
	return {
		message: 'Response Timeout',
		code: RESPONSE_TIMEOUT_CODE,
		data: data
	};
};



var BaseError = function (name, message, stack) {
	var tmp = Error.call(this, message);
	tmp.name = this.name = 'jet.' + name;
	this.message = tmp.message;
	var errorUrlBase = 'https://github.com/lipp/node-jet/blob/master/doc/peer.markdown';
	var url = errorUrlBase + '#jet' + name.toLowerCase();
	this.url = tmp.url = url;
	Object.defineProperty(this, 'stack', {
		get: function () {
			return stack || 'no remote stack';
		}
	});
	return this;
};

BaseError.prototype = Object.create(Error.prototype);

var DaemonError = function (msg) {
	BaseError.call(this, 'DaemonError', msg);
};

DaemonError.prototype = Object.create(BaseError.prototype);

exports.DaemonError = DaemonError;
exports.BaseError = BaseError;

var PeerError = function (err) {
	BaseError.call(this, 'PeerError', err.message, err.stack);
};

PeerError.prototype = Object.create(BaseError.prototype);
exports.PeerError = PeerError;

// authenticate
var InvalidUser = function () {
	BaseError.call(this, 'InvalidUser', 'The specified user does not exist');
};

InvalidUser.prototype = Object.create(BaseError.prototype);
exports.InvalidUser = InvalidUser;

// authenticate
var InvalidPassword = function () {
	BaseError.call(this, 'InvalidPassword', 'The specified password is wrong');
};

InvalidPassword.prototype = Object.create(BaseError.prototype);
exports.InvalidPassword = InvalidPassword;

var Unauthorized = function () {
	BaseError.call(this, 'Unauthorized', 'The request is not authorized for the user');
};

Unauthorized.prototype = Object.create(BaseError.prototype);
exports.Unauthorized = Unauthorized;

// connect / all
var ConnectionClosed = function (err) {
	BaseError.call(this, 'ConnectionClosed', err);
};

ConnectionClosed.prototype = Object.create(BaseError.prototype);
exports.ConnectionClosed = ConnectionClosed;

// set / call
var NotFound = function () {
	BaseError.call(this, 'NotFound', 'No State/Method matching the specified path');
};

NotFound.prototype = Object.create(BaseError.prototype);
exports.NotFound = NotFound;

// set / call
var InvalidArgument = function (msg) {
	BaseError.call(this, 'InvalidArgument', msg || 'The provided argument(s) have been refused by the State/Method');
};

InvalidArgument.prototype = Object.create(BaseError.prototype);
exports.InvalidArgument = InvalidArgument;

// set / call
var PeerTimeout = function () {
	BaseError.call(this, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout');
};

PeerTimeout.prototype = Object.create(BaseError.prototype);
exports.PeerTimeout = PeerTimeout;

var Occupied = function () {
	BaseError.call(this, 'Occupied', 'A State/Method with the same path has already been added');
};

Occupied.prototype = Object.create(BaseError.prototype);
exports.Occupied = Occupied;

var FetchOnly = function () {
	BaseError.call(this, 'FetchOnly', 'The State cannot be modified');
};

FetchOnly.prototype = Object.create(BaseError.prototype);
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
			} else if (data.invalidArgument) {
				return new InvalidArgument(data.invalidArgument && data.invalidArgument.message);
			} else if (data.noAccess) {
				return new Unauthorized();
			}
		}
	} else if (code === RESPONSE_TIMEOUT_CODE) {
		return new PeerTimeout();
	} else if (code === INTERNAL_ERROR_CODE) {
		return new PeerError(data);
	}
};