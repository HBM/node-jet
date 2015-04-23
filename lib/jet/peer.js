var util = require('util');
var events = require('events');
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
	config = config || {};
	var that = this;
	this.jsonrpc = new JsonRPC(config);

	this.openedPromise = new Bluebird(function (resolve, reject) {
		that.resolveOpened = resolve;
		that.rejectOpened = reject;
	});

	var processDaemonInfo = function (daemonInfo) {
		that.resolveOpened(daemonInfo);

		/* istanbul ignore else */
		if (config.onOpen) {
			config.onOpen(daemonInfo);
		}
		that.emit('open', daemonInfo);
	};

	this.jsonrpc.once('open', function () {
		try {
			that.info().then(function (daemonInfo) {
				processDaemonInfo(daemonInfo);
			}).catch(function () {
				processDaemonInfo(fallbackDaemonInfo);
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
		//		that.rejectOpened(err);
		/* istanbul ignore else */
		if (config.onError) {
			config.onError(err);
		}
		that.emit('error', err);
	});

	this.jsonrpc.on('close', function (reason) {
		//		that.rejectOpened(reason);
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

Peer.prototype.opened = function () {
	return this.openedPromise;
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
	var that = this;
	var active = true;
	var ref = new PromisedCallback(function (callbacks) {
		try {
			that.opened().then(function (daemonInfo) {
				if (active) {

					var fetcher;
					if (daemonInfo.features.fetch === 'simple') {
						fetcher = new FakeFetcher(that.jsonrpc, rule, fetchCb, ref, callbacks);
					} else {
						fetcher = new Fetcher(that.jsonrpc, rule, fetchCb, ref, callbacks);
					}
					ref.fetch = fetcher.fetch;
					ref.unfetch = fetcher.unfetch;
					ref.isFetching = fetcher.isFetching;
				} else {
					callbacks.success();
				}
			});
		} catch (err) {
			if (that.jsonrpc.closed) {} else {
				if (callbacks.error) {
					callbacks.error(err);
				}
			}
		}
	});

	ref.fetch = function () {
		active = true;
		return ref;
	};

	ref.unfetch = function () {
		active = false;
		return ref;
	};

	ref.isFetching = function () {
		return active;
	}

	return ref;
};

/**
 * Fetch
 * Creates and returns a new FetchChainer
 */
Peer.prototype.fetch = function () {
	return new FetchChainer(this);
};

/*
 * Add
 */
Peer.prototype.add = function (desc, dispatch) {
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

	var ref = new PromisedCallback(function (callbacks) {
		that.jsonrpc.service('add', params, addDispatcher, callbacks);
	});

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
	var that = this;
	var params = {
		path: path
	};
	var removeDispatcher = function () {
		that.jsonrpc.removeRequestDispatcher(path);
	};
	return new PromisedCallback(function (callbacks) {
		that.jsonrpc.service('remove', params, removeDispatcher, callbacks);
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
	return new PromisedCallback(function (callbacks) {
		jsonrpc.service('call', params, null, callbacks);
	});
};

/**
 * Info
 */
Peer.prototype.info = function () {
	var jsonrpc = this.jsonrpc;
	return new PromisedCallback(function (callbacks) {
		if (jsonrpc.closed) {
			if (callbacks.error) {
				callbacks.error('closed');
			}
		} else {
			jsonrpc.flush(); // flush to force unbatched message
			jsonrpc.service('info', {}, null, callbacks);
			jsonrpc.flush();
		}
	});
};

/**
 * Authenticate
 */
Peer.prototype.authenticate = function (user, password) {
	var jsonrpc = this.jsonrpc;
	return new PromisedCallback(function (callbacks) {
		jsonrpc.flush(); // flush to force unbatched message
		jsonrpc.service('authenticate', {
			user: user,
			password: password
		}, null, callbacks);
		jsonrpc.flush();
	});
};

/**
 * Config
 */
Peer.prototype.configure = function (params) {
	var jsonrpc = this.jsonrpc;
	return new PromisedCallback(function (callbacks) {
		jsonrpc.flush(); // flush to force unbatched message
		jsonrpc.service('config', params, null, callbacks);
		jsonrpc.flush();
	});
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
Peer.prototype.set = function (path, value, timeout) {
	var jsonrpc = this.jsonrpc;
	return new PromisedCallback(function (callbacks) {
		var params = {
			path: path,
			value: value,
			valueAsResult: callbacks.success && callbacks.success.length > 0,
			timeout: timeout // optional
		};
		jsonrpc.service('set', params, null, callbacks);
	});
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
			return new PromisedCallback(function (callbacks) {
				desc.value = value;
				that.jsonrpc.service('change', {
					path: desc.path,
					value: value
				}, null, callbacks);
				that.jsonrpc.flush();
			});
		} else {
			return desc.value;
		}
	};
	return ref;
};

module.exports = Peer;