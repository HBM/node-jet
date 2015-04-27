var util = require('util');
var jetUtils = require('./utils');
var JsonRPC = require('./peer/jsonrpc');
var Bluebird = require('bluebird');

/**
 * Helpers
 */
var isDef = jetUtils.isDefined;
var isArr = util.isArray;
var invalidParams = jetUtils.invalidParams;
var errorObject = jetUtils.errorObject;

var fallbackDaemonInfo = {
	name: 'unknown-daemon',
	version: '0.0.0',
	protocolVersion: 1,
	features: {
		fetch: 'full',
		authentication: false,
		batches: true
	}
};

/**
 * Peer constructor function.
 */
var Peer = function (config) {
	this.config = config || {};
	var that = this;

	this.jsonrpc = new JsonRPC(config);

	this.closedPromise = new Bluebird(function (resolve) {
		that.resolveClosed = resolve;
	});

	this.connectPromise = new Bluebird(function (resolve, reject) {
		that.resolveConnect = resolve;
		that.rejectConnect = reject;
	});

	this.daemonInfo = fallbackDaemonInfo;

	this.jsonrpc.once('open', function () {
		try {
			that.info().then(function (daemonInfo) {
				that.daemonInfo = daemonInfo;
			}).catch(function () {}).finally(function () {
				if (that.config.user) {
					that.authenticate(that.config.user, that.config.password).then(function (access) {
						that.access = accces;
						that.connected = true;
						that.resolveConnect(that);
					}).catch(function (err) {
						that.rejectConnect(err);
					});
				} else {
					that.connected = true;
					that.resolveConnect(that);
				}
			});
		} catch (err) {
			that.rejectConnect(err);
		}
	});

	this.jsonrpc.once('error', function (err) {
		that.connected = false;
		that.resolveClosed(err);
	});

	this.jsonrpc.once('close', function (reason) {
		that.connected = false;
		that.resolveClosed(reason);
	});


};

Peer.prototype.connect = function () {
	return this.connectPromise;
};


/**
 * Close
 */
Peer.prototype.close = function () {
	this.jsonrpc.close();
};

Peer.prototype.closed = function () {
	return this.closedPromise;
};

/**
 * Batch
 */
Peer.prototype.batch = function (action) {
	this.jsonrpc.batch(action);
};

/**
 * Fetch
 * Creates and returns a new FetchChainer
 */
Peer.prototype.fetch = function (fetcher) {
	var that = this;
	return this.connectPromise.then(function () {
		fetcher.jsonrpc = that.jsonrpc;
		fetcher.variant = that.daemonInfo.features.fetch;
		return fetcher.fetch();
	});
};

/*
 * Add
 */
Peer.prototype.add = function (stateOrMethod) {
	var that = this;
	this.connectPromise.then(function () {
		stateOrMethod.jsonrpc = that.jsonrpc;
		return stateOrMethod.add();
	});
};


/**
 * Remove
 */
Peer.prototype.remove = function (stateOrMethod) {
	this.connectPromise.then(function () {
		return stateOrMethod.remove();
	});
};



/**
 * Call
 */
Peer.prototype.call = function (path, callparams, timeout) {
	var params = {
		path: path,
		args: callparams || [],
		timeout: timeout // optional
	};
	var jsonrpc = this.jsonrpc;
	return this.connectPromise.then(function () {
		return jsonrpc.service('call', params);
	});
};

/**
 * Info
 */
Peer.prototype.info = function () {
	return this.jsonrpc.service('info', {});
};

/**
 * Authenticate
 */
Peer.prototype.authenticate = function (user, password) {
	return this.jsonrpc.service('authenticate', {
		user: user,
		password: password
	});
};

/**
 * Config
 */
Peer.prototype.configure = function (params) {
	return this.jsonrpc.service('config', params);
};


/**
 * Set
 *
 */
Peer.prototype.set = function (path, value, timeout) {
	var params = {
		path: path,
		value: value,
		timeout: timeout // optional
	};
	var jsonrpc = this.jsonrpc;
	return this.connectPromise.then(function () {
		return jsonrpc.service('set', params);
	});
};


module.exports = Peer;