'use strict';
var jetPathMatcher = require('./path_matcher');
var jetValueMatcher = require('./value_matcher');
var jetUtils = require('./utils');

var isDefined = jetUtils.isDefined;

exports.create = function (options, notify) {
	var pathMatcher = jetPathMatcher.create(options);
	var valueMatcher = jetValueMatcher.create(options);
	var added = {};

	var matchValue = function (path, event, value, readOnly) {
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
		var notification = {};
		if (!isAdded) {
			event = 'add';
			if (readOnly) {
				notification.readOnly = true;
			}
			added[path] = true;
		} else {
			event = 'change';
		}
		notification.path = path;
		notification.event = event;
		notification.value = value;

		notify(notification);
		return true;
	};

	if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value, readOnly) {
			if (!pathMatcher(path, lowerPath)) {
				// return false to indicate no further interest.
				return false;
			}
			var notification = {};
			if (event == 'add' && readOnly) {
				notification.readOnly = true;
			}
			notification.path = path;
			notification.event = event;
			notification.value = value;
			notify(notification);
			return true;
		};
	} else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value, readOnly) {
			return matchValue(path, event, value, readOnly);
		};
	} else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
		return function (path, lowerPath, event, value, readOnly) {
			if (!pathMatcher(path, lowerPath)) {
				return false;
			}
			return matchValue(path, event, value, readOnly);
		};
	} else {
		return function (path, lowerPath, event, value, readOnly) {
			var notification = {};
			if (event == 'add' && readOnly) {
				notification.readOnly = true;
			}
			notification.path = path;
			notification.event = event;
			notification.value = value;
			notify(notification);
			return true;
		};
	}
};