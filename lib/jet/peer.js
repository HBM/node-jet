var util = require('util');
var events = require('events');
var jetUtils = require('./utils.js');
var JsonRPC = require('./peer/jsonrpc.js').JsonRPC;


var Peer = function (config) {
	config = config || {};
	var isDef = jetUtils.isDefined;
	var isArr = util.isArray;
	var invalidParams = jetUtils.invalidParams;
	var errorObject = jetUtils.errorObject;

	var jsonrpc = new JsonRPC(config);
	var that = this;

	that.close = function () {
		jsonrpc.close();
	};

	that.batch = function (action) {
		jsonrpc.batch(action);
	};

	that.add = function (desc, dispatch, callbacks) {
		var path = desc.path;
		var addDispatcher = function (success) {
			if (success) {
				jsonrpc.addRequestDispatcher(path, dispatch);
			}
		};
		var params = {
			path: path,
			value: desc.value
		};
		jsonrpc.service('add', params, addDispatcher, callbacks);
		var ref = {
			remove: function (callbacks) {
				that.remove(path, callbacks);
			},
			isAdded: function () {
				return jsonrpc.hasRequestDispatcher(path);
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

	that.remove = function (path, callbacks) {
		var params = {
			path: path
		};
		var removeDispatcher = function () {
			jsonrpc.removeRequestDispatcher(path);
		};
		jsonrpc.service('remove', params, removeDispatcher, callbacks);
	};

	that.call = function (path, callparams, callbacks) {
		var params = {
			path: path,
			args: callparams || [],
			timeout: callbacks && callbacks.timeout // optional
		};
		jsonrpc.service('call', params, null, callbacks);
	};

	that.set = function (path, value, callbacks) {
		var params = {
			path: path,
			value: value,
			valueAsResult: callbacks && callbacks.valueAsResult, // optional
			timeout: callbacks && callbacks.timeout // optional
		};
		jsonrpc.service('set', params, null, callbacks);
	};

	var fetchId = 0;

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

	that.fetch = function (params, f, callbacks) {
		var id = '__f__' + fetchId;
		var sorting = params.sort;
		fetchId = fetchId + 1;
		var ref = {};
		var fetchDispatcher = createFetchDispatcher(params, f, ref);
		var addFetcher = function () {
			jsonrpc.addRequestDispatcher(id, fetchDispatcher);
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
		jsonrpc.service('fetch', params, addFetcher, callbacks);
		ref.unfetch = function (callbacks) {
			var removeDispatcher = function () {
				jsonrpc.removeRequestDispatcher(id);
			};
			jsonrpc.service('unfetch', {
				id: id
			}, removeDispatcher, callbacks);
		};
		ref.isFetching = function () {
			return jsonrpc.hasRequestDispatcher(id);
		};
		ref.fetch = function (callbacks) {
			jsonrpc.service('fetch', params, addFetcher, callbacks);
		};
		return ref;
	};

	that.method = function (desc, addCallbacks) {
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
						jsonrpc.queue({
							id: mid,
							result: result || {}
						});
					} else {
						jsonrpc.queue({
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
						jsonrpc.queue(response);
						jsonrpc.flush();
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
						jsonrpc.queue({
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

	that.state = function (desc, addCallbacks) {
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
						jsonrpc.queue(resp);
					}
					/* istanbul ignore else */
					if (!result.dontNotify) {
						jsonrpc.queue({
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
						jsonrpc.queue({
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
						jsonrpc.queue(response);
					}
					/* istanbul ignore else */
					if (!isDef(resp.error) && !isDef(resp.dontNotify)) {
						jsonrpc.queue({
							method: 'change',
							params: {
								path: desc.path,
								value: desc.value
							}
						});
					}
					jsonrpc.flush(resp.dontNotify);
				};
				try {
					desc.setAsync(value, reply);
				} catch (err) {
					var mid = message.id;
					/* istanbul ignore else */
					if (isDef(mid)) {
						jsonrpc.queue({
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
					jsonrpc.queue({
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
				jsonrpc.queue({
					method: 'change',
					params: {
						path: desc.path,
						value: value
					}
				});
				jsonrpc.flush();
			} else {
				return desc.value;
			}
		};
		return ref;
	};


	return that;
};

util.inherits(Peer, events.EventEmitter);

module.exports = Peer;