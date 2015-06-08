'use strict';

var JsonRPC = require('./peer/jsonrpc');
var Bluebird = require('bluebird');

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
	this.config = config = config || {};
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
						that.access = access;
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

Peer.prototype.unfetch = function (fetcher) {
	return this.connectPromise.then(function () {
		return fetcher.unfetch();
	});
};

/*
 * Add
 */
Peer.prototype.add = function (stateOrMethod) {
	var that = this;
	stateOrMethod.jsonrpc = that.jsonrpc;
	stateOrMethod.connectPromise = this.connectPromise;
	return stateOrMethod.add();
};


/**
 * Remove
 */
Peer.prototype.remove = function (stateOrMethod) {
	return stateOrMethod.remove();
};



/**
 * Call
 */
Peer.prototype.call = function (path, callparams, options) {
	options = options || {};
	var params = {
		path: path,
		args: callparams || [],
		timeout: options.timeout // optional
	};
	var jsonrpc = this.jsonrpc;
	return this.connectPromise.then(function () {
		return jsonrpc.service('call', params, null, options.skipResult);
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
Peer.prototype.set = function (path, value, options) {
	options = options || {};
	var params = {
		path: path,
		value: value,
		timeout: options.timeout, // optional
		valueAsResult: options.valueAsResult // optional
	};
	var jsonrpc = this.jsonrpc;
	return this.connectPromise.then(function () {
		return jsonrpc.service('set', params, null, options.skipResult);
	});
};


module.exports = Peer;