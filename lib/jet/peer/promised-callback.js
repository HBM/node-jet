require('setimmediate');
var Bluebird = require('bluebird');
var util = require('util');


var PromisedCallback = function (functionWithOptionalCallbackObject) {
	var that = this;
	var promise = new Bluebird(function (resolve, reject) {
		that._resolve = resolve;
		that._reject = reject;
	});
	this._callbacks = {};
	setImmediate(function () {
		functionWithOptionalCallbackObject(that._callbacks);
	});
	promise.then = function (fulfillHandler, rejectHandler) {
		if (fulfillHandler.length === 0) {
			that._callbacks.success = function () {
				that._resolve();
			};
		} else {
			that._callbacks.success = function (value) {
				that._resolve(value);
			};
		}
		if (rejectHandler) {
			that._callbacks.error = function (err) {
				that._reject(err);
			};
		}
		return Bluebird.prototype.then.apply(promise, arguments);
	};

	promise.catch = function (handler) {
		this._callbacks.error = function (err) {
			that._reject(err);
		};
		return Bluebird.prototype.catch.apply(promise, arguments);

	};

	return promise;
};

module.exports.PromisedCallback = PromisedCallback;