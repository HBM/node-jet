var jetUtils = require('../utils');
var fetchCommon = require('../fetch-common');
var Elements = require('../element').Elements;
var PromisedCallback = require('./promised-callback').PromisedCallback;
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
	var eachFetcherIterator = jetUtils.eachKeyValue(this.fetchers);
	this.eachFetcher = function (element, f) {
		eachFetcherIterator(f);
	};
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

	var ref = new PromisedCallback(function (callbacks) {
		if (callbacks.success) {
			callbacks.success();
		}
	});

	this.unfetch = function () {
		fetchCommon.unfetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams);
		return new PromisedCallback(function (callbacks) {
			if (callbacks.success) {
				callbacks.success();
			}
		});
	};

	this.isFetching = function () {
		return FakeFetcher.peer.hasFetcher(fetchParams.id);
	};

	this.fetch = function () {
		return new PromisedCallback(function (callback) {
			fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks && callbacks.success);
		});
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
var Fetcher = function (jsonrpc, params, f) {
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

	var ref = new PromisedCallback(function (callbacks) {

		jsonrpc.service('fetch', params, addFetcher, callbacks);
	});

	ref.unfetch = function () {
		var removeDispatcher = function () {
			jsonrpc.removeRequestDispatcher(id);
		};
		return new PromisedCallback(function (callbacks) {
			jsonrpc.service('unfetch', {
				id: id
			}, removeDispatcher, callbacks);
		});
	};

	ref.isFetching = function () {
		return jsonrpc.hasRequestDispatcher(id);
	};

	ref.fetch = function () {
		return new PromisedCallback(function (callbacks) {
			jsonrpc.service('fetch', params, addFetcher, callbacks);
		});
	};
};

module.exports = {
	FakeFetcher: FakeFetcher,
	Fetcher: Fetcher
};