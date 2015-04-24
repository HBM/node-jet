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

FakePeer.prototype.hasFetcher = function (fetchId) {
	return this.fetchers[fetchId] && true || false;
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
var FakeFetcher = function (jsonrpc, fetchParams, fetchCb) {

	var id = '__f__' + fetchId;
	++fetchId;

	fetchParams.id = id;

	var ref;
	var fetchDispatcher;

	var wrappedFetchDispatcher = function (nparams) {
		fetchDispatcher = fetchDispatcher || createFetchDispatcher(fetchParams, fetchCb, ref);
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

		ref = new PromisedCallback(function (callbacks) {
			jsonrpc.service('fetch', {}, undefined).then(function (fetchSimpleId) {
				jsonrpc.addRequestDispatcher(fetchSimpleId, fetchSimpleDispatcher);
				fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks.success);
			}).catch(function (err) {
				if (callbacks.error) {
					callbacks.error(err);
				}
			});
		});
	} else {
		ref = new PromisedCallback(function (callbacks) {

			fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks.success);
		});
	}


	ref.unfetch = function () {
		fetchCommon.unfetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams);
		return new PromisedCallback(function (callbacks) {
			if (callbacks.success) {
				callbacks.success();
			}
		});
	};

	ref.isFetching = function () {
		return FakeFetcher.peer.hasFetcher(fetchParams.id);
	};

	ref.fetch = function () {
		return new PromisedCallback(function (callbacks) {
			fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, callbacks.success);
		});
	};
	return ref;
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
var Fetcher = function (jsonrpc, params, fetchCb) {
	var id = '__f__' + fetchId;
	++fetchId;

	var fetchDispatcher;

	var addFetchDispatcher = function () {
		jsonrpc.addRequestDispatcher(id, fetchDispatcher);
	};

	var removeFetchDispatcher = function () {
		jsonrpc.removeRequestDispatcher(id);
	};

	params.id = id;

	var ref = jsonrpc.service('fetch', params, addFetchDispatcher);

	fetchDispatcher = createFetchDispatcher(params, fetchCb, ref);

	ref.unfetch = function () {
		var newRef = jsonrpc.service('unfetch', {
			id: id
		}, removeFetchDispatcher);
		newRef.fetch = ref.fetch;
		newRef.unfetch = ref.unfetch;
		newRef.isFetching = ref.isFetching;
		return newRef;
	};

	ref.isFetching = function () {
		return jsonrpc.hasRequestDispatcher(id);
	};

	ref.fetch = function () {
		var newRef = jsonrpc.service('fetch', params, addFetchDispatcher);
		newRef.fetch = ref.fetch;
		newRef.unfetch = ref.unfetch;
		newRef.isFetching = ref.isFetching;
		return newRef;
	};
	return ref;
};

module.exports = {
	FakeFetcher: FakeFetcher,
	Fetcher: Fetcher
};