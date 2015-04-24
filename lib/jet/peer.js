var util = require('util');
var jetUtils = require('./utils');
var JsonRPC = require('./peer/jsonrpc');
var Fetcher = require('./peer/fetch').Fetcher;
var FakeFetcher = require('./peer/fetch').FakeFetcher;
var FetchChainer = require('./peer/fetch-chainer').FetchChainer;
var PromisedCallback = require('./peer/promised-callback').PromisedCallback;
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
				if (that.daemonInfo.features.fetch === 'simple') {
					that.FetchCtor = FakeFetcher;

				} else {
					that.FetchCtor = Fetcher;
				}
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

Peer.prototype.checkConnected = function () {
	if (!!!this.connected) {
		throw new Error('peer is not connected');
	}
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
 * Really setup the fetch, triggered by FetchChain.run.
 * Must be postponed / forwarded, since until connection is
 * open, it is not clear, which fetch variant is supported.
 */
Peer.prototype.fetchCall = function (rule, fetchCb) {
	return new this.FetchCtor(this.jsonrpc, rule, fetchCb);
};

/**
 * Fetch
 * Creates and returns a new FetchChainer
 */
Peer.prototype.fetch = function () {
	this.checkConnected();
	return new FetchChainer(this);
};

/*
 * Add
 */
Peer.prototype.add = function (desc, dispatch) {
	this.checkConnected();
	var that = this;
	var path = desc.path;
	var addDispatcher = function (success) {
		if (success) {
			that.jsonrpc.addRequestDispatcher(path, dispatch);
		}
	};

	var params = {
		path: path,
		value: desc.value, // optional
		access: desc.access // optional
	};

	var ref = this.jsonrpc.service('add', params, addDispatcher);

	ref.remove = function () {
		return that.remove(path);
	};

	ref.isAdded = function () {
		return that.jsonrpc.hasRequestDispatcher(path);
	};

	ref.add = function (value) {
		if (isDef(value)) {
			desc.value = value;
		}
		return that.add(desc, dispatch);
	};

	ref.path = function () {
		return path;
	};

	return ref;
};



/**
 * Remove
 */
Peer.prototype.remove = function (path) {
	this.checkConnected();
	var that = this;
	var params = {
		path: path
	};
	var removeDispatcher = function () {
		that.jsonrpc.removeRequestDispatcher(path);
	};
	return this.jsonrpc.service('remove', params, removeDispatcher);

};



/**
 * Call
 */
Peer.prototype.call = function (path, callparams, timeout) {
	this.checkConnected();
	var params = {
		path: path,
		args: callparams || [],
		timeout: timeout // optional
	};
	return this.jsonrpc.service('call', params, null);
};

/**
 * Info
 */
Peer.prototype.info = function () {
	return this.jsonrpc.service('info', {}, null);
};

/**
 * Authenticate
 */
Peer.prototype.authenticate = function (user, password) {
	return this.jsonrpc.service('authenticate', {
		user: user,
		password: password
	}, null);
};

/**
 * Config
 */
Peer.prototype.configure = function (params) {
	return this.jsonrpc.service('config', params, null);
};


/**
 * Set
 *
 */
Peer.prototype.set = function (path, value, timeout) {
	this.checkConnected();
	var params = {
		path: path,
		value: value,
		timeout: timeout // optional
	};
	return this.jsonrpc.service('set', params, null);
};


/**
 * Method
 */
Peer.prototype.method = function (desc) {
	var that = this;

	var dispatch;
	if (desc.call) {
		dispatch = function (message) {
			var params = message.params;
			var result;
			var err;
			try {
				if (isArr(params) && params.length > 0) {
					result = desc.call.apply(undefined, params);
				} else {
					result = desc.call.call(undefined, params);
				}
			} catch (e) {
				err = e;
			}
			var mid = message.id;
			/* istanbul ignore else */
			if (isDef(mid)) {
				if (!isDef(err)) {
					that.jsonrpc.queue({
						id: mid,
						result: result || {}
					});
				} else {
					that.jsonrpc.queue({
						id: mid,
						error: errorObject(err)
					});
				}
			}
		};
	} else if (desc.callAsync) {
		dispatch = function (message) {
			var reply = function (resp) {
				var mid = message.id;
				resp = resp || {};
				if (isDef(mid)) {
					var response = {
						id: mid
					};
					if (isDef(resp.result) && !isDef(resp.error)) {
						response.result = resp.result;
					} else if (isDef(resp.error)) {
						response.error = errorObject(resp.error);
					} else {
						response.error = errorObject('jet.peer Invalid async method response ' + desc.path);
					}
					that.jsonrpc.queue(response);
					that.jsonrpc.flush();
				}
			};

			var params = message.params;

			try {
				if (isArr(params) && params.length > 0) {
					params.unshift(reply);
					// parameters will be f(reply,arg1,arg2,...)
					desc.callAsync.apply(undefined, params);
				} else {
					// parameters will be f(reply,arg)
					desc.callAsync.call(undefined, reply, params);
				}
			} catch (err) {
				var mid = message.id;
				if (isDef(mid)) {
					that.jsonrpc.queue({
						id: mid,
						error: errorObject(err)
					});
				}
			}
		};
	} else {
		throw 'invalid method desc' + (desc.path || '?');
	}
	var ref = that.add(desc, dispatch);
	return ref;
};



/**
 * State
 */
Peer.prototype.state = function (desc) {
	var that = this;

	var dispatch;
	if (desc.set) {
		dispatch = function (message) {
			var value = message.params.value;
			try {
				var result = desc.set(value) || {};
				if (isDef(result.value)) {
					desc.value = result.value;
				} else {
					desc.value = value;
				}
				/* istanbul ignore else */
				if (isDef(message.id)) {
					var resp = {};
					resp.id = message.id;
					if (message.params.valueAsResult) {
						resp.result = desc.value;
					} else {
						resp.result = true;
					}
					that.jsonrpc.queue(resp);
				}
				/* istanbul ignore else */
				if (!result.dontNotify) {
					that.jsonrpc.queue({
						method: 'change',
						params: {
							path: desc.path,
							value: desc.value
						}
					});
				}
			} catch (err) {
				/* istanbul ignore else */
				if (isDef(message.id)) {
					that.jsonrpc.queue({
						id: message.id,
						error: errorObject(err)
					});
				}
			}
		};
	} else if (isDef(desc.setAsync)) {
		dispatch = function (message) {
			var value = message.params.value;
			var reply = function (resp) {
				var mid = message.id;
				resp = resp || {};
				if (isDef(resp.value)) {
					desc.value = resp.value;
				} else {
					desc.value = value;
				}
				/* istanbul ignore else */
				if (isDef(mid)) {
					var response = {
						id: mid
					};
					if (!isDef(resp.error)) {
						if (message.params.valueAsResult) {
							response.result = desc.value;
						} else {
							response.result = true;
						}
					} else {
						response.error = errorObject(resp.error);
					}
					that.jsonrpc.queue(response);
				}
				/* istanbul ignore else */
				if (!isDef(resp.error) && !isDef(resp.dontNotify)) {
					that.jsonrpc.queue({
						method: 'change',
						params: {
							path: desc.path,
							value: desc.value
						}
					});
				}
				that.jsonrpc.flush(resp.dontNotify);
			};
			try {
				desc.setAsync(value, reply);
			} catch (err) {
				var mid = message.id;
				/* istanbul ignore else */
				if (isDef(mid)) {
					that.jsonrpc.queue({
						id: mid,
						error: errorObject(err)
					});

				}
			}
		};
	} else {
		dispatch = function (message) {
			var mid = message.id;
			/* istanbul ignore else */
			if (isDef(mid)) {
				that.jsonrpc.queue({
					id: mid,
					error: invalidParams(desc.path + ' is read-only')
				});
			}
		};
	}
	var ref = that.add(desc, dispatch);
	ref.value = function (value) {
		if (isDef(value)) {
			desc.value = value;
			return that.jsonrpc.service('change', {
				path: desc.path,
				value: value
			});
		} else {
			return desc.value;
		}
	};
	return ref;
};

module.exports = Peer;