'use strict';

var util = require('util');
var events = require('events');
var MessageSocket = require('../message-socket').MessageSocket;
var WebSocket = require('ws');
var jetUtils = require('../utils');
var Bluebird = require('bluebird');

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
			hook(result);
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
	if (config.url || (typeof (window) !== 'undefined')) {
		var url = config.url || ('ws://' + window.location.host);
		this.sock = new WebSocket(url, 'jet');
	} else {
		this.sock = new MessageSocket(config.port || 11122, config.ip);
	}
	this.config = config;
	this.messages = [];
	this.closed = false;
	this.willFlush = false;
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
		that.open = true;
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
		if (isDef(message.result) && callbacks.success) {
			callbacks.success(message.result);
		} else if (isDef(message.error) && callbacks.error) {
			callbacks.error(message.error);
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
JsonRPC.prototype.service = function (method, params, complete, asNotification) {
	/* istanbul ignore else */
	if (this.closed) {
		throw new Error('Jet Websocket connection is closed');
	}
	var that = this;
	return new Bluebird(function (resolve, reject) {
		var rpcId;
		// Only make a Request, if callbacks are specified.
		// Make complete call in case of success.
		// If no id is specified in the message, no Response
		// is expected, aka Notification.
		if (!!!asNotification) {
			rpcId = that.id;
			that.id = that.id + 1;
			var callbacks = {
				success: resolve,
				error: reject
			};
			/* istanbul ignore else */
			if (complete) {
				addHook(callbacks, 'success', function (result) {
					complete(true, result);
				});
				addHook(callbacks, 'error', function () {
					complete(false);
				});
			}
			that.responseDispatchers[rpcId] = callbacks;
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
		if (that.willFlush) {
			that.queue(message);
		} else {
			var encoded = encode(message);
			if (that.config.onSend) {
				that.config.onSend(encoded, [message]);
			}
			that.sock.send(encode(message));
		}
		if (asNotification) {
			resolve();
		}
	});
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