var util = require('util');
var events = require('events');
var jetUtils = require('./utils');
var JsonRPC = require('./peer/jsonrpc');



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

	var processDaemonInfo = function (daemonInfo) {
		/* istanbul ignore else */
		if (daemonInfo.features.batches === false) {
			that.jsonrpc.disableBatches();
		}

		/* istanbul ignore else */
		if (daemonInfo.features.fetch === 'simple') {
			that.fetchSimple = true;
		}

		that.daemonInfo = daemonInfo;
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
				throw e;
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
 * 
 * Closes the connection to the daemon.
 * The peer will not receive any future messages and
 * cannot send messages to the daemon any more.
 */
Peer.prototype.close = function () {
	this.jsonrpc.close();
};



/**
 * Batch
 *
 * All messages which are generated during "action" {function}
 * are sent as batch.
 * This is more efficient and is suitable to speed up start up
 * phases or notification peaks.
 */
Peer.prototype.batch = function (action) {
	this.jsonrpc.batch(action);
};



/*
 * Add
 *
 * Adds a State or Method to the daemon. Returns a reference
 * object, which can be used to remove or (re-) add the
 * State or Method.
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
		value: desc.value
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
 * Config
 */
Peer.prototype.configure = function (params, callbacks) {
	this.jsonrpc.flush(); // flush to force unbatched message
	this.jsonrpc.service('config', params, null, callbacks);
	this.jsonrpc.flush();
};


/**
 * Set
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
 * Fetch
 *
 * Sets up a new fetcher.
 */
Peer.prototype.fetch = function (params, f, callbacks) {

	var that = this;

	var createFetchDispatcher = function (params, f, ref) {
		if (isDef(params.sort)) {
			if (params.sort.asArray) {
				delete params.sort.asArray; // peer internal param
				var arr = [];
				var from = params.sort.from;
				return function (message) {
					var params = message.params;
					arr.length = params.n;
					params.changes.forEach(function (change) {
						arr[change.index - from] = change;
					});
					f(arr, ref);
				};
			} else {
				return function (message) {
					var params = message.params;
					f(params.changes, params.n, ref);
				};
			}
		} else {
			return function (message) {
				var params = message.params;
				f(params.path, params.event, params.value, ref);
			};
		}
	};

	var id = '__f__' + that.fetchId;
	var sorting = params.sort;
	that.fetchId = that.fetchId + 1;
	var ref = {};
	var fetchDispatcher = createFetchDispatcher(params, f, ref);
	var addFetcher = function () {
		that.jsonrpc.addRequestDispatcher(id, fetchDispatcher);
	};
	/* istanbul ignore else */
	if (typeof (params) === 'string') {
		params = {
			path: {
				contains: params
			}
		};
	}
	params.id = id;
	that.jsonrpc.service('fetch', params, addFetcher, callbacks);
	ref.unfetch = function (callbacks) {
		var removeDispatcher = function () {
			that.jsonrpc.removeRequestDispatcher(id);
		};
		that.jsonrpc.service('unfetch', {
			id: id
		}, removeDispatcher, callbacks);
	};
	ref.isFetching = function () {
		return that.jsonrpc.hasRequestDispatcher(id);
	};
	ref.fetch = function (callbacks) {
		that.jsonrpc.service('fetch', params, addFetcher, callbacks);
	};
	return ref;
};



/**
 * Method
 *
 * Adds a new Method to the daemon.
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
 *
 * Adds a new State to the daemon.
 *
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