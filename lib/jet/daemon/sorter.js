'use strict';

var jetUtils = require('../utils');
var isDefined = jetUtils.isDefined;

exports.create = function (options, notify) {
	var from,
		to,
		matches = [],
		sorted = {},
		index = [],
		sort,
		lt,
		gt,
		psort,
		fieldStr,
		getField,
		n = -1;
	if (!options.sort) {
		return;
	}

	from = options.sort.from || 1;
	to = options.sort.to || 10;
	if (!options.sort.byValue || options.sort.byPath) {
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
			fieldStr = Object.keys(options.sort.byValue)[0];
			getField = jetUtils.accessField(fieldStr);
			lt = function (a, b) {
				return getField(a) < getField(b);
			};
			gt = function (a, b) {
				return getField(a) > getField(b);
			};
		}
	}
	psort = function (s, a, b) {
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

	from = options.sort.from || 1;
	to = options.sort.to || 10;

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