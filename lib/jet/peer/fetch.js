var jetUtils = require('../utils');
var fetchCommon = require('../fetch-common');
var Elements = require('../element').Elements;
var Bluebird = require('bluebird');
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
				f.call(ref, arr, ref);
			};
		} else {
			return function (message) {
				var params = message.params;
				f.call(ref, params.changes, params.n);
			};
		}
	} else {
		return function (message) {
			var params = message.params;
			f.call(ref, params.path, params.event, params.value);
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

	var fetchDispatcher;

	var wrappedFetchDispatcher = function (nparams) {
		fetchDispatcher = fetchDispatcher || createFetchDispatcher(fetchParams, fetchCb, this);
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

		this.fetch = function () {
			return new Bluebird(function (resolve, reject) {
				jsonrpc.service('fetch', {})
					.then(function (fetchSimpleId) {
						jsonrpc.addRequestDispatcher(fetchSimpleId, fetchSimpleDispatcher);
						fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, resolve);
					}).catch(reject);
			});
		};
	} else {
		this.fetch = function () {
			return new Bluebird(function (resolve) {
				fetchCommon.fetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams, wrappedFetchDispatcher, resolve);
			});
		};
	}

	this.unfetch = function () {
		fetchCommon.unfetchCore(FakeFetcher.peer, FakeFetcher.elements, fetchParams);
		return new Bluebird(function (resolve) {
			resolve();
		});
	};

	this.isFetching = function () {
		return FakeFetcher.peer.hasFetcher(fetchParams.id);
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
var Fetcher = function (jsonrpc, params, fetchCb) {
	var id = '__f__' + fetchId;
	params.id = id;
	++fetchId;

	var fetchDispatcher = createFetchDispatcher(params, fetchCb, this);

	var addFetchDispatcher = function () {
		jsonrpc.addRequestDispatcher(id, fetchDispatcher);
	};

	var removeFetchDispatcher = function () {
		jsonrpc.removeRequestDispatcher(id);
	};

	this.unfetch = function () {
		return jsonrpc.service('unfetch', {
			id: id
		}, removeFetchDispatcher);
	};

	this.isFetching = function () {
		return jsonrpc.hasRequestDispatcher(id);
	};

	this.fetch = function () {
		return jsonrpc.service('fetch', params, addFetchDispatcher);
	};

};

module.exports = {
	FakeFetcher: FakeFetcher,
	Fetcher: Fetcher
};