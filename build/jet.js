!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jet=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Export Peer only for browserify
 */
exports.Peer = require('./jet/peer');
},{"./jet/peer":7}],2:[function(require,module,exports){
var jetUtils = require('./utils');

var Element = function (eachPeerFetcher, owningPeer, path, value) {
	this.fetchers = {};
	this.eachFetcher = jetUtils.eachKeyValue(this.fetchers);
	this.path = path;
	this.value = value;
	this.peer = owningPeer;

	var fetchers = this.fetchers;
	var lowerPath = path.toLowerCase();

	eachPeerFetcher(function (peerFetchId, fetcher) {
		try {
			var mayHaveInterest = fetcher(path, lowerPath, 'add', value);
			if (mayHaveInterest) {
				fetchers[peerFetchId] = fetcher;
			}
		} catch (err) {
			console.error('fetcher failed', err);
		}
	});
};

Element.prototype._publish = function (event) {
	var lowerPath = this.path.toLowerCase();
	var value = this.value;
	var path = this.path;
	this.eachFetcher(function (_, fetcher) {
		try {
			fetcher(path, lowerPath, event, value);
		} catch (err) {
			console.error('fetcher failed', err);
		}
	});
};

Element.prototype.change = function (value) {
	this.value = value;
	this._publish('change', value);

};

Element.prototype.remove = function () {
	this._publish('remove');
};

Element.prototype.addFetcher = function (id, fetcher) {
	this.fetchers[id] = fetcher;
};

Element.prototype.removeFetcher = function (id) {
	delete this.fetchers[id];
};

var Elements = function () {
	this.instances = {};
	this.each = jetUtils.eachKeyValue(this.instances);
};

Elements.prototype.add = function (peers, owningPeer, path, value) {
	if (this.instances[path]) {
		throw jetUtils.invalidParams({
			pathAlreadyExists: path
		});
	} else {
		this.instances[path] = new Element(peers, owningPeer, path, value);
	}
};

Elements.prototype.get = function (path) {
	var el = this.instances[path];
	if (!el) {
		throw jetUtils.invalidParams({
			pathNotExists: path
		});
	} else {
		return el;
	}
};

Elements.prototype.change = function (path, value, peer) {
	var el = this.get(path);
	if (el.peer !== peer) {
		throw jetUtils.invalidParams({
			foreignPath: path
		});
	} else {
		el.change(value);
	}
};

Elements.prototype.removePeer = function (peer) {
	var toDelete = [];
	this.each(function (path, element) {
		if (element.peer === peer) {
			element.remove(path);
			toDelete.push(path);
		}
	});
	var instances = this.instances;
	toDelete.forEach(function (path) {
		delete instances[path];
	});
};

Elements.prototype.remove = function (path, peer) {
	var el = this.get(path);
	if (el.peer !== peer) {
		throw jetUtils.invalidParams({
			foreignPath: path
		});
	}
	el.remove();
	delete this.instances[path];
};

Elements.prototype.addFetcher = function (id, fetcher) {
	this.each(function (path, element) {
		var mayHaveInterest;
		try {
			mayHaveInterest = fetcher(
				path,
				path.toLowerCase(),
				'add',
				element.value
			);
			if (mayHaveInterest) {
				element.addFetcher(id, fetcher);
			}
		} catch (err) {
			console.error('fetcher failed', err);
		}
	});
};

Elements.prototype.removeFetcher = function (id) {
	this.each(function (_, element) {
		element.removeFetcher(id);
	});
};

exports.Elements = Elements;
},{"./utils":11}],3:[function(require,module,exports){
var jetUtils = require('./utils');
var jetSorter = require('./sorter');
var jetFetcher = require('./fetcher');

var checked = jetUtils.checked;

var isDefined = jetUtils.isDefined;

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
exports.fetchCore = function (peer, elements, params, notify, success) {
	var fetchId = checked(params, 'id');

	var fetcher;
	var sorter;
	var initializing = true;

	if (isDefined(params.sort)) {
		sorter = jetSorter.create(params, notify);
		fetcher = jetFetcher.create(params, function (nparams) {
			sorter.sorter(nparams, initializing);
		});
	} else {
		fetcher = jetFetcher.create(params, notify);
		if (success) {
			success();
		}
	}

	peer.addFetcher(fetchId, fetcher);
	elements.addFetcher(peer.id + fetchId, fetcher);
	initializing = false;

	if (isDefined(sorter) && sorter.flush) {
		if (success) {
			success();
		}
		sorter.flush();
	}
};

// dispatchers the 'unfetch' jet call.
// removes all ressources associated with the fetcher.
exports.unfetchCore = function (peer, elements, params) {
	var fetchId = checked(params, 'id', 'string');
	var fetchPeerId = peer.id + fetchId;

	peer.removeFetcher(fetchId);
	elements.removeFetcher(fetchPeerId);
};

exports.addCore = function (peer, eachPeerFetcher, elements, params) {
	var path = checked(params, 'path', 'string');
	var value = params.value;
	elements.add(eachPeerFetcher, peer, path, value);
};

exports.removeCore = function (peer, elements, params) {
	var path = checked(params, 'path', 'string');
	elements.remove(path, peer);
};

exports.changeCore = function (peer, elements, params) {
	var path = checked(params, 'path', 'string');
	elements.change(path, params.value, peer);
};
},{"./fetcher":4,"./sorter":10,"./utils":11}],4:[function(require,module,exports){
'use strict';
var jetPathMatcher = require('./path_matcher');
var jetValueMatcher = require('./value_matcher');
var jetUtils = require('./utils');

var isDefined = jetUtils.isDefined;

exports.create = function (options, notify) {
	var pathMatcher = jetPathMatcher.create(options);
	var valueMatcher = jetValueMatcher.create(options);
	var added = {};

	var matchValue = function (path, event, value) {
		var isAdded = added[path];
		if (event === 'remove' || !valueMatcher(value)) {
			if (isAdded) {
				delete added[path];
				notify({
					path: path,
					event: 'remove',
					value: value
				});
			}
			return true;
		}
		if (!isAdded) {
			event = 'add';
			added[path] = true;
		} else {
			event = 'change';
		}
		notify({
			path: path,
			event: event,
			value: value
		});
		return true;
	};

	if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			if (!pathMatcher(path, lowerPath)) {
				// return false to indicate no further interest.
				return false;
			}
			notify({
				path: path,
				event: event,
				value: value
			});
			return true;
		};
	} else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			return matchValue(path, event, value);
		};
	} else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value) {
			if (!pathMatcher(path, lowerPath)) {
				return false;
			}
			return matchValue(path, event, value);
		};
	} else {
		return function (path, lowerPath, event, value) {
			notify({
				path: path,
				event: event,
				value: value
			});
			return true;
		};
	}
};
},{"./path_matcher":6,"./utils":11,"./value_matcher":12}],5:[function(require,module,exports){
(function (process,Buffer){
var util = require('util');
var events = require('events');
var net = require('net');

/**
 * MessageSocket constructor function.
 */
var MessageSocket = function (port, ip) {
	var last = new Buffer(0);
	var len = -1;
	var self = this;
	var socket;
	if (port instanceof net.Socket) {
		socket = port;
	} else {
		socket = net.connect(port, ip);
		socket.on('connect', function () {
			self.emit('open');
		});
	}

	socket.on('data', function (buf) {
		var bigBuf = Buffer.concat([last, buf]);
		while (true) {
			if (len < 0) {
				if (bigBuf.length < 4) {
					last = bigBuf;
					return;
				} else {
					len = bigBuf.readUInt32BE(0);
					bigBuf = bigBuf.slice(4);
				}
			}
			if (len > 0) {
				if (bigBuf.length < len) {
					last = bigBuf;
					return;
				} else {
					self.emit('message', bigBuf.toString(null, 0, len));
					bigBuf = bigBuf.slice(len);
					len = -1;
				}
			}
		}
	});

	socket.setNoDelay(true);
	socket.setKeepAlive(true);

	socket.once('close', function () {
		self.emit('close');
	});

	socket.once('error', function (e) {
		self.emit('error', e);
	});

	this._socket = socket;
};

util.inherits(MessageSocket, events.EventEmitter);



/**
 * Send.
 */
MessageSocket.prototype.send = function (msg) {
	var that = this;
	var buf = new Buffer(4 + msg.length);
	buf.writeUInt32BE(msg.length, 0);
	buf.write(msg, 4);
	process.nextTick(function () {
		that._socket.write(buf);
		that.emit('sent', msg);
	});
};



/**
 * Close.
 */
MessageSocket.prototype.close = function () {
	this._socket.end();
};



/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function MessageEvent(dataArg, typeArg, target) {
	this.data = dataArg;
	this.type = typeArg;
	this.target = target;
}



/**
 * W3C CloseEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function CloseEvent(code, reason, target) {
	this.wasClean = (typeof code === 'undefined' || code === 1000);
	this.code = code;
	this.reason = reason;
	this.target = target;
}



/**
 * W3C OpenEvent
 *
 * @see http://www.w3.org/TR/html5/comms.html
 * @constructor
 * @api private
 */
function OpenEvent(target) {
	this.target = target;
}



/**
 * addEventListener method needed for MessageSocket to be used in the browser.
 * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
 *
 * npm module 'ws' also comes with this method.
 * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
 * That way we can use node-jet with via browserify inside the browser.
 */
MessageSocket.prototype.addEventListener = function (method, listener) {

	var target = this;

	function onMessage(data, flags) {
		listener.call(target, new MessageEvent(data, (flags && flags.binary) ? 'Binary' : 'Text', target));
	}

	function onClose(code, message) {
		listener.call(target, new CloseEvent(code, message, target));
	}

	function onError(event) {
		event.target = target;
		listener.call(target, event);
	}

	function onOpen() {
		listener.call(target, new OpenEvent(target));
	}

	if (typeof listener === 'function') {
		if (method === 'message') {
			// store a reference so we can return the original function from the
			// addEventListener hook
			onMessage._listener = listener;
			this.on(method, onMessage);
		} else if (method === 'close') {
			// store a reference so we can return the original function from the
			// addEventListener hook
			onClose._listener = listener;
			this.on(method, onClose);
		} else if (method === 'error') {
			// store a reference so we can return the original function from the
			// addEventListener hook
			onError._listener = listener;
			this.on(method, onError);
		} else if (method === 'open') {
			// store a reference so we can return the original function from the
			// addEventListener hook
			onOpen._listener = listener;
			this.on(method, onOpen);
		} else {
			this.on(method, listener);
		}
	}

};

exports.MessageSocket = MessageSocket;
}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":20,"buffer":14,"events":18,"net":13,"util":22}],6:[function(require,module,exports){
'use strict';

var jetUtils = require('./utils');
var isDefined = jetUtils.isDefined;

var contains = function (what) {
	return function (path) {
		return path.indexOf(what) !== -1;
	};
};

var containsAllOf = function (whatArray) {
	return function (path) {
		var i;
		for (i = 0; i < whatArray.length; i = i + 1) {
			if (path.indexOf(whatArray[i]) === -1) {
				return false;
			}
		}
		return true;
	};
};

var containsOneOf = function (whatArray) {
	return function (path) {
		var i;
		for (i = 0; i < whatArray.length; i = i + 1) {
			if (path.indexOf(whatArray[i]) !== -1) {
				return true;
			}
		}
		return false;
	};
};

var startsWith = function (what) {
	return function (path) {
		return path.substr(0, what.length) === what;
	};
};

var endsWith = function (what) {
	return function (path) {
		return path.lastIndexOf(what) === (path.length - what.length);
	};
};

var equals = function (what) {
	return function (path) {
		return path === what;
	};
};

var equalsOneOf = function (whatArray) {
	return function (path) {
		var i;
		for (i = 0; i < whatArray.length; i = i + 1) {
			if (path === whatArray[i]) {
				return true;
			}
		}
		return false;
	};
};

var negate = function (gen) {
	return function () {
		var f = gen.apply(undefined, arguments);
		return function () {
			return !f.apply(undefined, arguments);
		};
	};
};

var generators = {
	equals: equals,
	equalsNot: negate(equals),
	contains: contains,
	containsNot: negate(contains),
	containsAllOf: containsAllOf,
	containsOneOf: containsOneOf,
	startsWith: startsWith,
	startsNotWith: negate(startsWith),
	endsWith: endsWith,
	endsNotWith: negate(endsWith),
	equalsOneOf: equalsOneOf,
	equalsNotOneOf: negate(equalsOneOf)
};

var predicateOrder = [
    'equals',
    'equalsNot',
    'endsWith',
    'startsWith',
    'contains',
    'containsNot',
    'containsAllOf',
    'containsOneOf',
    'startsNotWith',
    'endsNotWith',
    'equalsOneOf',
    'equalsNotOneOf'
];

exports.create = function (options) {
	if (!isDefined(options.path)) {
		return;
	}
	var po = options.path,
		ci = po.caseInsensitive,
		pred,
		predicates = [];
	predicateOrder.forEach(function (name) {
		var gen,
			i,
			option = po[name];
		if (isDefined(option)) {
			gen = generators[name];
			if (ci) {
				if (option.length) {
					for (i = 0; i < option.length; i = i + 1) {
						option[i] = option[i].toLowerCase();
					}
				} else {
					option = option.toLowerCase();
				}
			}
			predicates.push(gen(option));
		}
	});

	var applyPredicates = function (path) {
		for (var i = 0; i < predicates.length; ++i) {
			if (!predicates[i](path)) {
				return false;
			}
		}
		return true;
	};
	if (ci) {
		if (predicates.length === 1) {
			pred = predicates[0];
			return function (path, lowerPath) {
				return pred(lowerPath);
			};
		} else {
			return function (path, lowerPath) {
				return applyPredicates(lowerPath);
			};
		}
	} else {
		if (predicates.length === 1) {
			pred = predicates[0];
			return function (path) {
				return pred(path);
			};
		} else {
			return function (path) {
				return applyPredicates(path);
			};
		}
	}
};
},{"./utils":11}],7:[function(require,module,exports){
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
},{"./peer/fetch":8,"./peer/jsonrpc":9,"./utils":11,"events":18,"util":22}],8:[function(require,module,exports){
var jetUtils = require('../utils');
var fetchCommon = require('../fetch-common');
var Elements = require('../element').Elements;
var isDef = jetUtils.isDefined;

var fetchId = 1;

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


var FakePeer = function () {
	this.fetchers = {};
	this.id = 'fakePeer';
	this.eachFetcher = jetUtils.eachKeyValue(this.fetchers);
};

FakePeer.prototype.addFetcher = function (fetchId, fetcher) {
	this.fetchers[fetchId] = fetcher;
};

FakePeer.prototype.removeFetcher = function (fetchId) {
	delete this.fetchers[fetchId];
};

FakePeer.prototype.hasFetcher = function (plainFetchId) {
	return this.fetchers[this.id + plainFetchId] && true || false;
};

/**
 * FakeFetcher
 *
 * Mimiks normal "fetch" API when the Daemon runs
 * fetch = 'simple' mode. In this case, the Daemon supports
 * only one "fetch all" per Peer. 
 * Filtering (value and/or path based) and sorting are handled
 * by the peer.
 *
 * Normally only embedded systems with very limited resources
 * run the fetch = 'simple' mode.
 */
var FakeFetcher = function (jsonrpc, fetchParams, f, callbacks) {

	var id = '__f__' + fetchId;
	++fetchId;

	/* istanbul ignore else */
	if (typeof (fetchParams) === 'string') {
		fetchParams = {
			path: {
				contains: fetchParams
			}
		};
	}

	fetchParams.id = id;
	var fetchDispatcher = createFetchDispatcher(fetchParams, f, this);

	var wrappedFetchDispatcher = function (nparams) {
		fetchDispatcher({
			params: nparams
		});
	};

	if (FakeFetcher.elements === undefined) {
		FakeFetcher.elements = new Elements();
		FakeFetcher.peer = new FakePeer();

		var fetchSimpleDispatcher = function (message) {
			var params = message.params;
			var event = params.event;

			if (event === 'remove') {
				fetchCommon.removeCore(FakeFetcher.peer, FakeFetcher.elements, params);
			} else if (event === 'add') {
				fetchCommon.addCore(FakeFetcher.peer, FakeFetcher.peer.eachFetcher, FakeFetcher.elements, params);
			} else {
				fetchCommon.changeCore(FakeFetcher.peer, FakeFetcher.elements, params);
			}
		};

		jsonrpc.service('fetch', {}, undefined, {
			success: function (fetchSimpleId) {
				jsonrpc.addRequestDispatcher(fetchSimpleId, fetchSimpleDispatcher);
				fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks && callbacks.success);
			}
		});
	} else {
		fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks && callbacks.success);
	}


	this.unfetch = function (callbacks) {
		fetchCommon.unfetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams);
		if (callbacks && callbacks.success) {
			callbacks.success();
		}
	};

	this.isFetching = function () {
		return FakeFetcher.peer.hasFetcher(fetchParams.id);
	};

	this.fetch = function (callbacks) {
		fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks && callbacks.success);
	};

};


/**
 * Fetcher
 *
 * Sets up a new fetcher. Fetching is very similiar to pub-sub.
 * You can optionally define path- and/or value-based filters
 * and sorting criteria.
 *
 * All options are available at http://jetbus.io.
 */
var Fetcher = function (jsonrpc, params, f, callbacks) {
	var id = '__f__' + fetchId;
	++fetchId;

	var fetchDispatcher = createFetchDispatcher(params, f, this);

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

	this.unfetch = function (callbacks) {
		var removeDispatcher = function () {
			jsonrpc.removeRequestDispatcher(id);
		};
		jsonrpc.service('unfetch', {
			id: id
		}, removeDispatcher, callbacks);
	};

	this.isFetching = function () {
		return jsonrpc.hasRequestDispatcher(id);
	};

	this.fetch = function (callbacks) {
		jsonrpc.service('fetch', params, addFetcher, callbacks);
	};
};

module.exports = {
	FakeFetcher: FakeFetcher,
	Fetcher: Fetcher
};
},{"../element":2,"../fetch-common":3,"../utils":11}],9:[function(require,module,exports){
'use strict';

var util = require('util');
var events = require('events');
var MessageSocket = require('../message-socket').MessageSocket;
var WebSocket = require('ws');
var jetUtils = require('../utils');


/**
 * Helper shorthands.
 */
var encode = JSON.stringify;
var decode = JSON.parse;
var isDef = jetUtils.isDefined;
var isArr = util.isArray;
var errorObject = jetUtils.errorObject;

/**
 * Adds a function ("hook") to callbacks[callbackName]
 *
 * "hook" is executed before the original
 * callbacks[callbackName] function if defined,
 * or installs "hook" as callbacks[callbackName].
 */
var addHook = function (callbacks, callbackName, hook) {
	if (callbacks[callbackName]) {
		var orig = callbacks[callbackName];
		callbacks[callbackName] = function (result) {
			hook();
			orig(result);
		};
	} else {
		callbacks[callbackName] = hook;
	}
};



/**
 * JsonRPC constructor.
 */
var JsonRPC = function (config) {
	if (config.url) {
		this.sock = new WebSocket(config.url, 'jet');
	} else {
		this.sock = new MessageSocket(config.port || 11122, config.ip);
	}
	this.config = config;
	this.messages = [];
	this.closed = false;
	this.willFlush = true;
	this.requestDispatchers = {};
	this.responseDispatchers = {};
	this.id = 0;

	// make sure event handlers have the same context
	this._dispatchMessage = this._dispatchMessage.bind(this);
	this._dispatchSingleMessage = this._dispatchSingleMessage.bind(this);
	this._dispatchResponse = this._dispatchResponse.bind(this);
	this._dispatchRequest = this._dispatchRequest.bind(this);

	var that = this;

	// onmessage
	this.sock.addEventListener('message', this._dispatchMessage);

	// onclose
	this.sock.addEventListener('close', function (err) {
		that.closed = true;
		that.emit('close', err);
	});

	// onerror
	this.sock.addEventListener('error', function (err) {
		that.closed = true;
		that.emit('error', err);
	});

	// onopen
	this.sock.addEventListener('open', function () {
		that.emit('open');
	});

};


util.inherits(JsonRPC, events.EventEmitter);

/**
 * _dispatchMessage
 *
 * @api private
 */
JsonRPC.prototype._dispatchMessage = function (event) {

	var message = event.data;
	var decoded = decode(message);

	this.willFlush = true;
	/* istanbul ignore else */
	if (this.config.onReceive) {
		this.config.onReceive(message, decoded);
	}
	if (isArr(decoded)) {
		decoded.forEach(function (message) {
			this._dispatchSingleMessage(message);
		});
	} else {
		this._dispatchSingleMessage(decoded);
	}
	this.flush();
};



/**
 * _dispatchSingleMessage
 *
 * @api private
 */
JsonRPC.prototype._dispatchSingleMessage = function (message) {
	if (message.method && message.params) {
		this._dispatchRequest(message);
	} else if (isDef(message.result) || isDef(message.error)) {
		this._dispatchResponse(message);
	}
};



/**
 * _dispatchResponse
 *
 * @api private
 */
JsonRPC.prototype._dispatchResponse = function (message) {
	var mid = message.id;
	var callbacks = this.responseDispatchers[mid];
	delete this.responseDispatchers[mid];
	/* istanbul ignore else */
	if (callbacks) {
		/* istanbul ignore else */
		if (isDef(message.result)) {
			/* istanbul ignore else */
			if (callbacks.success) {
				callbacks.success(message.result);
			}
		} else if (isDef(message.error)) {
			/* istanbul ignore else */
			if (callbacks.error) {
				callbacks.error(message.error);
			}
		}
	}
};



/**
 * _dispatchRequest.
 * Handles both method calls and fetchers (notifications)
 *
 * @api private
 */
JsonRPC.prototype._dispatchRequest = function (message) {
	var dispatcher = this.requestDispatchers[message.method];

	try {
		dispatcher(message);
	} catch (err) {
		/* istanbul ignore else */
		if (isDef(message.id)) {
			this.queue({
				id: message.id,
				error: errorObject(err)
			});
		}
	}
};



/**
 * Queue.
 */
JsonRPC.prototype.queue = function (message) {
	this.messages.push(message);
};



/**
 * Flush.
 */
JsonRPC.prototype.flush = function () {
	var encoded;
	if (this.messages.length === 1) {
		encoded = encode(this.messages[0]);
	} else if (this.messages.length > 1) {
		encoded = encode(this.messages);
	}
	if (encoded) {
		/* istanbul ignore else */
		if (this.config.onSend) {
			this.config.onSend(encoded, this.messages);
		}
		this.sock.send(encoded);
		this.messages.length = 0;
	}
	this.willFlush = false;
};



/**
 * AddRequestDispatcher.
 */
JsonRPC.prototype.addRequestDispatcher = function (id, dispatch) {
	this.requestDispatchers[id] = dispatch;
};



/**
 * RemoveRequestDispatcher.
 */
JsonRPC.prototype.removeRequestDispatcher = function (id) {
	delete this.requestDispatchers[id];
};



/**
 * HasRequestDispatcher.
 */
JsonRPC.prototype.hasRequestDispatcher = function (id) {
	return isDef(this.requestDispatchers[id]);
};



/**
 * Service.
 */
JsonRPC.prototype.service = function (method, params, complete, callbacks) {
	var rpcId;
	/* istanbul ignore else */
	if (this.closed) {
		throw new Error('Jet Websocket connection is closed');
	}
	// Only make a Request, if callbacks are specified.
	// Make complete call in case of success.
	// If no id is specified in the message, no Response
	// is expected, aka Notification.
	if (callbacks) {
		params.timeout = callbacks.timeout;
		this.id = this.id + 1;
		rpcId = this.id;
		/* istanbul ignore else */
		if (complete) {
			addHook(callbacks, 'success', function () {
				complete(true);
			});
			addHook(callbacks, 'error', function () {
				complete(false);
			});
		}
		this.responseDispatchers[this.id] = callbacks;
	} else {
		// There will be no response, so call complete either way
		// and hope everything is ok
		if (complete) {
			complete(true);
		}
	}
	var message = {
		id: rpcId,
		method: method,
		params: params
	};
	if (this.willFlush) {
		this.queue(message);
	} else {
		this.sock.send(encode(message));
	}
};



/**
 * Batch.
 */
JsonRPC.prototype.batch = function (action) {
	this.willFlush = true;
	action();
	this.flush();
};



/**
 * Close.
 */
JsonRPC.prototype.close = function () {
	this.closed = true;
	this.flush();
	this.sock.close();
};





module.exports = JsonRPC;
},{"../message-socket":5,"../utils":11,"events":18,"util":22,"ws":23}],10:[function(require,module,exports){
'use strict';

var jetUtils = require('./utils');
var isDefined = jetUtils.isDefined;

var createSort = function (options) {
	var sort;
	var lt, gt;

	if ((!isDefined(options.sort.byValue) && !isDefined(options.sort.byValueField)) || options.sort.byPath) {
		gt = function (a, b) {
			return a.path > b.path;
		};
		lt = function (a, b) {
			return a.path < b.path;
		};
	} else {
		if (options.sort.byValue) {
			lt = function (a, b) {
				return a.value < b.value;
			};
			gt = function (a, b) {
				return a.value > b.value;
			};
		} else if (options.sort.byValueField) {
			var fieldStr = Object.keys(options.sort.byValueField)[0];
			var getField = jetUtils.accessField(fieldStr);
			lt = function (a, b) {
				return getField(a.value) < getField(b.value);
			};
			gt = function (a, b) {
				return getField(a.value) > getField(b.value);
			};
		}
	}
	var psort = function (s, a, b) {
		try {
			if (s(a, b)) {
				return -1;
			}
		} catch (ignore) {}
		return 1;
	};

	if (options.sort.descending) {
		sort = function (a, b) {
			return psort(gt, a, b);
		};
	} else {
		sort = function (a, b) {
			return psort(lt, a, b);
		};
	}
	return sort;
};

exports.create = function (options, notify) {
	var from,
		to,
		matches = [],
		sorted = {},
		index = {},
		sort,
		n = -1;

	from = options.sort.from || 1;
	to = options.sort.to || 10;

	sort = createSort(options);

	var isInRange = function (i) {
		return typeof i === 'number' && i >= from && i <= to;
	};

	var sorter = function (notification, initializing) {
		var event = notification.event,
			path = notification.path,
			value = notification.value,
			lastMatchesLength = matches.length,
			lastIndex,
			newIndex,
			wasIn,
			isIn,
			start,
			stop,
			changes = [],
			newN,
			news,
			olds,
			ji,
			i;

		if (initializing) {
			if (isDefined(index[path])) {
				return;
			}
			matches.push({
				path: path,
				value: value
			});
			index[path] = matches.length;
			return;
		}
		lastIndex = index[path];
		if (event === 'remove') {
			if (isDefined(lastIndex)) {
				matches.splice(lastIndex - 1, 1);
				delete index[path];
			} else {
				return;
			}
		} else if (isDefined(lastIndex)) {
			matches[lastIndex - 1].value = value;
		} else {
			matches.push({
				path: path,
				value: value
			});
		}


		matches.sort(sort);

		matches.forEach(function (m, i) {
			index[m.path] = i + 1;
		});

		if (matches.length < from && lastMatchesLength < from) {
			return;
		}

		newIndex = index[path];

		if (isDefined(lastIndex) && isDefined(newIndex) && newIndex === lastIndex && isInRange(newIndex)) {
			if (event === 'change') {
				notify({
					n: n,
					changes: [{
						path: path,
						value: value,
						index: newIndex,
                        }]
				});
			}
			return;
		}

		isIn = isInRange(newIndex);
		wasIn = isInRange(lastIndex);

		if (isIn && wasIn) {
			start = Math.min(lastIndex, newIndex);
			stop = Math.max(lastIndex, newIndex);
		} else if (isIn && !wasIn) {
			start = newIndex;
			stop = Math.min(to, matches.length);
		} else if (!isIn && wasIn) {
			start = lastIndex;
			stop = Math.min(to, matches.length);
		} else {
			start = from;
			stop = Math.min(to, matches.length);
		}

		for (i = start; i <= stop; i = i + 1) {
			ji = i - 1; // javascript index is 0 based
			news = matches[ji];
			olds = sorted[ji];
			if (news && news !== olds) {
				changes.push({
					path: news.path,
					value: news.value,
					index: i
				});
			}
			sorted[ji] = news;
			if (news === undefined) {
				break;
			}
		}

		newN = Math.min(to, matches.length) - from + 1;
		if (newN !== n || changes.length > 0) {
			n = newN;
			notify({
				changes: changes,
				n: n
			});
		}
	};

	var flush = function () {
		var changes = [],
			news,
			ji,
			i;
		matches.sort(sort);
		matches.forEach(function (m, i) {
			index[m.path] = i + 1;
		});

		n = 0;

		for (i = from; i <= to; i = i + 1) {
			ji = i - 1;
			news = matches[ji];
			if (news) {
				news.index = i;
				n = i - from + 1;
				sorted[ji] = news;
				changes.push(news);
			}
		}

		notify({
			changes: changes,
			n: n
		});
	};

	return {
		sorter: sorter,
		flush: flush
	};
};
},{"./utils":11}],11:[function(require,module,exports){
var invalidParams = function (data) {
	return {
		message: 'Invalid params',
		code: -32602,
		data: data
	};
};

exports.invalidParams = invalidParams;

exports.responseTimeout = function (data) {
	return {
		message: 'Response Timeout',
		code: -32001,
		data: data
	};
};

exports.parseError = function (data) {
	return {
		message: 'Parse error',
		code: -32700,
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

var isDefined = function (x) {
	if (typeof x === 'undefined' || x === null) {
		return false;
	}
	return true;
};

exports.checked = function (tab, key, typename) {
	var p = tab[key];
	if (isDefined(p)) {
		if (typename) {
			if (typeof (p) === typename) {
				return p;
			} else {
				throw invalidParams({
					wrongType: key,
					got: tab
				});
			}
		} else {
			return p;
		}
	} else {
		throw invalidParams({
			missingParam: key,
			got: tab
		});
	}
};

exports.optional = function (tab, key, typename) {
	var p = tab[key];
	if (isDefined(p)) {
		if (typename) {
			if (typeof (p) === typename) {
				return p;
			}
		} else {
			throw invalidParams({
				wrongType: key,
				got: tab
			});
		}
	}
};

exports.isDefined = isDefined;

exports.noop = function () {};

exports.accessField = function (fieldStr) {
	if (fieldStr.substr(0, 1) !== '[') {
		fieldStr = '.' + fieldStr;
	}
	var funStr = 'return t' + fieldStr;
	/*jshint -W061 */
	return new Function('t', funStr);
};

exports.errorObject = function (err) {
	var data;
	if (typeof err === 'object' && isDefined(err.code) && isDefined(err.message)) {
		return err;
	} else {
		if (typeof err === 'object') {
			data = {};
			data.message = err.message;
			data.lineNumber = err.lineNumber;
			data.fileName = err.fileName;
		}
		return {
			code: -32602,
			message: 'Internal error',
			data: data || err
		};
	}
};

exports.eachKeyValue = function (obj) {
	return function (f) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				f(key, obj[key]);
			}
		}
	};
};
},{}],12:[function(require,module,exports){
'use strict';

var jetUtils = require('./utils');

var generators = {};

generators.lessThan = function (other) {
	return function (x) {
		return x < other;
	};
};

generators.greaterThan = function (other) {
	return function (x) {
		return x > other;
	};
};

generators.equals = function (other) {
	return function (x) {
		return x === other;
	};
};

generators.equalsNot = function (other) {
	return function (x) {
		return x !== other;
	};
};

generators.isType = function (type) {
	return function (x) {
		return typeof x === type;
	};
};

var isDefined = jetUtils.isDefined;

var generatePredicate = function (op, val) {
	var gen = generators[op];
	if (!gen) {
		throw jetUtils.invalidParams('unknown generator ' + op);
	} else {
		return gen(val);
	}
};

var createValuePredicates = function (valueOptions) {
	var predicates = [];
	jetUtils.eachKeyValue(valueOptions)(function (op, val) {
		predicates.push(generatePredicate(op, val));
	});
	return predicates;
};

var createValueFieldPredicates = function (valueFieldOptions) {
	var predicates = [];
	jetUtils.eachKeyValue(valueFieldOptions)(function (fieldStr, rule) {
		var fieldPredicates = [];
		var accessor = jetUtils.accessField(fieldStr);
		jetUtils.eachKeyValue(rule)(function (op, val) {
			fieldPredicates.push(generatePredicate(op, val));
		});
		var fieldPredicate = function (value) {
			if (typeof value !== 'object') {
				return false;
			}
			try {
				var field = accessor(value);
				for (var i = 0; i < fieldPredicates.length; ++i) {
					if (!fieldPredicates[i](field)) {
						return false;
					}
				}
				return true;
			} catch (e) {
				return false;
			}
		};
		predicates.push(fieldPredicate);

	});

	return predicates;
};

exports.create = function (options) {
	// sorting by value implicitly defines value matcher rule against expected type
	if (options.sort) {
		if (options.sort.byValue) {
			options.value = options.value || {};
			options.value.isType = options.sort.byValue;
		} else if (options.sort.byValueField) {
			var fieldName = Object.keys(options.sort.byValueField)[0];
			var type = options.sort.byValueField[fieldName];
			options.valueField = options.valueField || {};
			options.valueField[fieldName] = options.valueField[fieldName] || {};
			options.valueField[fieldName].isType = type;
		}
	}

	if (!isDefined(options.value) && !isDefined(options.valueField)) {
		return;
	}

	var predicates;

	if (isDefined(options.value)) {
		predicates = createValuePredicates(options.value);
	} else if (isDefined(options.valueField)) {
		predicates = createValueFieldPredicates(options.valueField);
	}

	return function (value) {
		try {
			for (var i = 0; i < predicates.length; ++i) {
				if (!predicates[i](value)) {
					return false;
				}
			}
			return true;
		} catch (e) {
			return false;
		}
	};
};
},{"./utils":11}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding) {
  var self = this
  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

  var type = typeof subject
  var length

  if (type === 'number') {
    length = +subject
  } else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) {
    // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
    length = +subject.length
  } else {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (length > kMaxLength) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
      kMaxLength.toString(16) + ' bytes')
  }

  if (length < 0) length = 0
  else length >>>= 0 // coerce to uint32

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    self.length = length
    self._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    self._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++) {
        self[i] = subject.readUInt8(i)
      }
    } else {
      for (i = 0; i < length; i++) {
        self[i] = ((subject[i] % 256) + 256) % 256
      }
    }
  } else if (type === 'string') {
    self.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < length; i++) {
      self[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

  return self
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, totalLength) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function byteLength (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function toString (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, target_start, start, end) {
  var self = this // source

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || self.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= self.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - target_start < end - start) {
    end = target.length - target_start + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":15,"ieee754":16,"is-array":17}],15:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],16:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],17:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],18:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],19:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],20:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],21:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],22:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":21,"_process":20,"inherits":19}],23:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}]},{},[1])(1)
});