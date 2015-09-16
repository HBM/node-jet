'use strict';

var jetUtils = require('../utils');
var Bluebird = require('bluebird');

/**
 * Helpers
 */
var isDef = jetUtils.isDefined;
var errorObject = jetUtils.errorObject;
var noop = function () {};

/**
 * State
 */

var State = function (path, initialValue, access) {
	this._path = path;
	this._value = initialValue;
	this._access = access;
	this._dispatcher = noop;
	var that = this;
	this._isAddedPromise = new Bluebird(function (resolve, reject) {
		that._isAddedPromiseResolve = resolve;
		that._isAddedPromiseReject = reject;
	});
};

State.acceptAny = function (newval) {};

State.acceptNone = function (newval) {
	return false
};

State.prototype.path = function () {
	return this._path;
};

State.prototype.on = function (event, cb) {
	if (event === 'set') {
		if (cb.length === 1) {
			this._dispatcher = this.createSyncDispatcher(cb);
		} else {
			this._dispatcher = this.createAsyncDispatcher(cb);
		}
	} else {
		throw new Error('event not available');
	}
};

State.prototype.createSyncDispatcher = function (cb) {
	var that = this;
	var dispatcher = function (message) {
		var value = message.params.value;
		try {
			var result = cb.call(that, value) || {};
			if (isDef(result.value)) {
				that._value = result.value;
			} else {
				that._value = value;
			}
			/* istanbul ignore else */
			if (isDef(message.id)) {
				var resp = {};
				resp.id = message.id;
				if (message.params.valueAsResult) {
					resp.result = that._value;
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
						path: that._path,
						value: that._value
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
	return dispatcher;
};

State.prototype.createAsyncDispatcher = function (cb) {
	var that = this;

	var dispatch = function (message) {
		var value = message.params.value;
		var mid = message.id;
		var reply = function (resp) {
			resp = resp || {};
			if (isDef(resp.value)) {
				that._value = resp.value;
			} else {
				that._value = value;
			}
			/* istanbul ignore else */
			if (isDef(mid)) {
				var response = {
					id: mid
				};
				if (!isDef(resp.error)) {
					if (message.params.valueAsResult) {
						response.result = that._value;
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
						path: that._path,
						value: that._value
					}
				});
			}
			that.jsonrpc.flush(resp.dontNotify);
		};
		try {
			cb.call(that, value, reply);
		} catch (err) {
			/* istanbul ignore else */
			if (isDef(mid)) {
				that.jsonrpc.queue({
					id: mid,
					error: errorObject(err)
				});

			}
		}
	};
	return dispatch;
};

State.prototype.add = function () {
	var that = this;
	var addDispatcher = function (success) {
		if (success) {
			that.jsonrpc.addRequestDispatcher(that._path, that._dispatcher);
			that._isAddedPromiseResolve();
		} else {
			that._isAddedPromise.catch(function () {});
			that._isAddedPromiseReject('add failed');
		}
	};
	var params = {
		path: this._path,
		value: this._value,
		access: this._access
	};
	if (this._dispatcher === noop) {
		params.fetchOnly = true;
	}
	return this.connectPromise.then(function () {
		return that.jsonrpc.service('add', params, addDispatcher);
	});
};

State.prototype.remove = function () {
	var that = this;
	var params = {
		path: this._path
	};
	var removeDispatcher = function (success) {
		/* istanbul ignore else */
		if (success) {
			that._isAddedPromise = new Bluebird(function (resolve, reject) {
				that._isAddedPromiseResolve = resolve;
				that._isAddedPromiseReject = reject;
			});
			that.jsonrpc.removeRequestDispatcher(that._path, that._dispatcher);
		}
	};
	return this.connectPromise.then(function () {
		return that.jsonrpc.service('remove', params, removeDispatcher);
	});
};

State.prototype.isAdded = function () {
	return this.jsonrpc.hasRequestDispatcher(this._path);
};

State.prototype.value = function (newValue, notAsNotification) {
	if (isDef(newValue)) {
		this._value = newValue;
		var that = this;
		return this._isAddedPromise.then(function () {
			return that.jsonrpc.service('change', {
				path: that._path,
				value: newValue
			}, null, !notAsNotification);
		});
	} else {
		return this._value;
	}
};

module.exports = State;