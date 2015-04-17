var util = require('util');
var events = require('events');
var jetUtils = require('./utils');
var JsonRPC = require('./peer/jsonrpc');
var Fetcher = require('./peer/fetch').Fetcher;
var FakeFetcher = require('./peer/fetch').FakeFetcher;

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
	config = config || {};
	var that = this;
	this.jsonrpc = new JsonRPC(config);
	this.fetchId = 0;
	this.queuedFetches = [];
	// postpone fetch calls until 
	// processDaemonInfo is called and 
	// the peer knows, which fetch variant
	// is supported.
	this.fetch = Peer.prototype.fetchQueue;

	var processDaemonInfo = function (daemonInfo) {
		that.daemonInfo = daemonInfo;
		if (daemonInfo.features.fetch === 'simple') {
			that.fetch = that.fetchFake;
		} else {
			that.fetch = that.fetchFull;
		}

		that.flushQueuedFetches();

		/* istanbul ignore else */
		if (config.onOpen) {
			config.onOpen(daemonInfo);
		}
		that.emit('open', daemonInfo);
	};

	this.jsonrpc.once('open', function () {
		try {
			that.info({
				success: function (daemonInfo) {
					processDaemonInfo(daemonInfo);
				},
				error: function (x) {
					processDaemonInfo(fallbackDaemonInfo);
				}
			});

			if (config.name) {
				that.configure({
					name: config.name
				});
			}
		} catch (err) {
			/* peer.close() may have been called */
			if (that.jsonrpc.closed) {} else {
				throw err;
			}
		}

	});

	/* forward "error" and "close" events */

	this.jsonrpc.on('error', function (err) {
		/* istanbul ignore else */
		if (config.onError) {
			config.onError(err);
		}
		that.emit('error', err);
	});

	this.jsonrpc.on('close', function (reason) {
		/* istanbul ignore else */
		if (config.onClose) {
			config.onClose(reason);
		}
		that.emit('close', reason);
	});

	return this;
};

util.inherits(Peer, events.EventEmitter);



/**
 * Close
 */
Peer.prototype.close = function () {
	this.jsonrpc.close();
};



/**
 * Batch
 */
Peer.prototype.batch = function (action) {
	this.jsonrpc.batch(action);
};

Peer.prototype.flushQueuedFetches = function () {
	var that = this;
	try {
		/* peer.close() may have been called */
		this.queuedFetches.forEach(function (args) {
			that.fetch.apply(that, args);
		});
	} catch (err) {
		if (this.jsonrpc.closed) {} else {
			throw err;
		}
	}

	delete this.queuedFetches;
}

Peer.prototype.fetchQueue = function (fetchParams, f, callbacks) {
	this.queuedFetches.push([fetchParams, f, callbacks]);
};

Peer.prototype.fetchFull = function (fetchParams, f, callbacks) {
	return new Fetcher(this.jsonrpc, fetchParams, f, callbacks);
};

Peer.prototype.fetchFake = function (fetchParams, f, callbacks) {
	return new FakeFetcher(this.jsonrpc, fetchParams, f, callbacks);
};

/*
 * Add
 */
Peer.prototype.add = function (desc, dispatch, callbacks) {
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
	that.jsonrpc.service('add', params, addDispatcher, callbacks);
	var ref = {
		remove: function (callbacks) {
			that.remove(path, callbacks);
		},
		isAdded: function () {
			return that.jsonrpc.hasRequestDispatcher(path);
		},
		add: function (value, callbacks) {
			if (isDef(value)) {
				desc.value = value;
			}
			that.add(desc, dispatch, callbacks);
		},
		path: function () {
			return path;
		}
	};
	return ref;
};



/**
 * Remove
 */
Peer.prototype.remove = function (path, callbacks) {
	var that = this;
	var params = {
		path: path
	};
	var removeDispatcher = function () {
		that.jsonrpc.removeRequestDispatcher(path);
	};
	that.jsonrpc.service('remove', params, removeDispatcher, callbacks);
};



/**
 * Call
 */
Peer.prototype.call = function (path, callparams, callbacks) {
	var params = {
		path: path,
		args: callparams || [],
		timeout: callbacks && callbacks.timeout // optional
	};
	this.jsonrpc.service('call', params, null, callbacks);
};

/**
 * Info
 */
Peer.prototype.info = function (callbacks) {
	this.jsonrpc.flush(); // flush to force unbatched message
	this.jsonrpc.service('info', {}, null, callbacks);
	this.jsonrpc.flush();
};

/**
 * Authenticate
 */
Peer.prototype.authenticate = function (user, password, callbacks) {
	this.jsonrpc.flush(); // flush to force unbatched message
	this.jsonrpc.service('authenticate', {
		user: user,
		password: password
	}, null, callbacks);
	this.jsonrpc.flush();
};

/**
 * Config
 */
Peer.prototype.configure = function (params, callbacks) {
	this.jsonrpc.flush(); // flush to force unbatched message
	this.jsonrpc.service('config', params, null, callbacks);
	this.jsonrpc.flush();
};


/**
 * Set
 *
 * Sets the State specified by "path" to "value".
 * Optionally a "callbacks" object can be specified,
 * which may have the fields:
 *
 *   - "success" {Function}. arg: the "real" new value (if "valueAsResult" == true)
 *   - "error" {Function}. arg: the error {Object} with "code", "message" and ["data"]
 *   - "valueAsResult" {Boolean}. If true, success callback gets the "real" new value as arg
 *   - "timeout": {Number}. The time [seconds] to wait before the Daemon generates a timeout error
 *                and cancels the set request.
 */
Peer.prototype.set = function (path, value, callbacks) {
	var params = {
		path: path,
		value: value,
		valueAsResult: callbacks && callbacks.valueAsResult, // optional
		timeout: callbacks && callbacks.timeout // optional
	};
	this.jsonrpc.service('set', params, null, callbacks);
};



/**
 * Method
 */
Peer.prototype.method = function (desc, addCallbacks) {
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
	var ref = that.add(desc, dispatch, addCallbacks);
	return ref;
};



/**
 * State
 */
Peer.prototype.state = function (desc, addCallbacks) {
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
	var ref = that.add(desc, dispatch, addCallbacks);
	ref.value = function (value) {
		if (isDef(value)) {
			desc.value = value;
			that.jsonrpc.queue({
				method: 'change',
				params: {
					path: desc.path,
					value: value
				}
			});
			that.jsonrpc.flush();
		} else {
			return desc.value;
		}
	};
	return ref;
};

module.exports = Peer;