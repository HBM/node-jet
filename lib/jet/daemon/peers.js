var jetUtils = require('../utils');
var net = require('net');
var uuid = require('uuid');

var genPeerId = function (sock) {
	if (sock instanceof net.Socket) {
		return sock.remoteAddress + ':' + sock.remotePort;
	} else {
		// this is a websocket
		try {
			sock = ws._sender._socket;
			return sock.remoteAddress + ':' + sock.remotePort;
		} catch (e) {
			return uuid.v1();
		}
	}
};

exports.Peers = function (jsonrpc, elements) {

	var instances = {};

	var remove = function (peer) {
		if (peer && instances[peer.id]) {
			peer.eachFetcher(function (fetchId) {
				elements.removeFetcher(peer.id + fetchId);
			});
			peer.fetchers = {};;
			elements.removePeer(peer);
			delete instances[peer.id];
		}
	};

	var eachInstance = jetUtils.eachKeyValue(instances);

	var eachPeerFetcherIterator = function (f) {
		eachInstance(function (peerId, peer) {
			peer.eachFetcher(function (fetchId, fetcher) {
				f(peerId + fetchId, fetcher);
			});
		});
	};

	this.eachPeerFetcher = function () {
		return eachPeerFetcherIterator;
	};

	this.add = function (sock) {
		var peer = {};
		var peerId = genPeerId(sock);

		peer.sendMessage = function (message) {
			message = JSON.stringify(message);
			sock.send(message);
		};

		sock.on('message', function (message) {
			try {
				jsonrpc.dispatch(peer, message);
			} catch (e) {
				remove(peer);
				return;
			}
		});

		peer.id = peerId;
		peer.fetchers = {};
		peer.eachFetcher = jetUtils.eachKeyValue(peer.fetchers);
		peer.addFetcher = function (id, fetcher) {
			peer.fetchers[id] = fetcher;
		};
		peer.removeFetcher = function (id) {
			delete peer.fetchers[id];
		};
		instances[peerId] = peer;
		sock.once('close', function () {
			remove(peer);
		});
		return peer;
	};

};