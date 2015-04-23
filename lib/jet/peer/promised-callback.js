require('setimmediate');
var Bluebird = require('bluebird');
var util = require('util');


var PromisedCallback = function (functionWithOptionalCallbackObject) {
	var callbacks = {};
	var resolve;
	var reject;
	var promise = new Bluebird(function (resolve_, reject_) {
		resolve = resolve_;
		reject = reject_;
	});

	Bluebird.onPossiblyUnhandledRejection(function () {});

	setImmediate(function () {
		functionWithOptionalCallbackObject(callbacks);
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