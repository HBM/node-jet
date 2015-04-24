require('setimmediate');
var Bluebird = require('bluebird');
var util = require('util');

var immediate = false;

var postponed = [];

var detachCallContext = function (f) {

	postponed.push(f);
	// setImmediate does not make any guarentees about the 
	// execution order. thus only setup one immediate handler
	// and queue actions in "postponed"
	if (!immediate) {
		setImmediate(function () {
			// dont use forEach, since postponed[i]()
			// may call postponed.push(x);
			for (var i = 0; i < postponed.length; ++i) {
				postponed[i]();
			}
			postponed.length = 0;
			immediate = false;
		});
		immediate = true;
	}
};

var PromisedCallback = function (functionWithOptionalCallbackObject) {
	var callbacks = {};
	var resolve;
	var reject;
	var promise = new Bluebird(function (resolve_, reject_) {
		resolve = resolve_;
		reject = reject_;
	});

	Bluebird.onPossiblyUnhandledRejection(function () {});

	detachCallContext(function () {
		functionWithOptionalCallbackObject(callbacks);
		// resolve if neither .then nor .catch where called
		if (!callbacks.success && !callbacks.error) {
			resolve();
		}
	});

	this.then = function (fulfillHandler, rejectHandler) {
		if (fulfillHandler.length === 0) {
			callbacks.success = function () {
				resolve();
			};
		} else {
			callbacks.success = function (value) {
				resolve(value);
			};
		}
		if (rejectHandler) {
			callbacks.error = function (err) {
				reject(err);
			};
		}
		promise.then.apply(promise, arguments);
		return this;
	};

	this.catch = function (handler) {
		callbacks.error = function (err) {
			reject(err);
		};
		promise.catch.apply(promise, arguments);
		return this;

	};

	var that = this;

	['isPending', 'isFulfilled', 'finally', 'bind', 'spread'].forEach(function (fname) {
		that[fname] = function () {
			return promise[fname].apply(promise, arguments);
		};
	});

	return this;
};

module.exports.PromisedCallback = PromisedCallback;