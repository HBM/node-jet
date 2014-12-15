var net = require('net');
var uuid = require('uuid');
var assert = require('assert');

var WebSocketServer = require('ws').Server;

var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket.js').MessageSocket;
var jetUtils = require('./utils');
var jetSorter = require('./daemon/sorter');
var jetFetcher = require('./daemon/fetcher');
var Router = require('./daemon/router').Router;
var JsonRPC = require('./daemon/jsonrpc').JsonRPC;
var Elements = require('./daemon/element').Elements;

var isDefined = jetUtils.isDefined;
var noop = jetUtils.noop;
var invalidParams = jetUtils.invalidParams;
var checked = jetUtils.checked;
var errorObject = jetUtils.errorObject;


var createDaemon = function (options) {
	options = options || {};
	var log = options.log || noop;
	var crit = options.crit || console.log;

	var router = new Router(log);

	// all connected peers (clients)
	// key and value are peers itself
	var peers = {};

	// all elements which have been added
	// key is unique path, value is element (object)
	var elements = new Elements();

	var eachPeer = jetUtils.eachKeyValue(peers);

	var daemon = new EventEmitter();

	// dispatches the 'change' jet call.
	// updates the internal cache (element table)
	// and publishes a change event.
	var change = function (peer, message) {
		var notification = checked(message, 'params', 'object');
		var path = checked(notification, 'path', 'string');
		elements.change(path, notification.value, peer);
	};


	// dispatches the 'fetch' jet call.
	// creates a fetch operation and optionally a sorter.
	// all elements are inputed as "fake" add events. The
	// fetcher is only asociated with the element if
	// it "shows interest".
	var fetch = function (peer, message) {
		var params = checked(message, 'params', 'object');
		var fetchId = checked(params, 'id');

		var queueNotification = function (nparams) {
			peer.sendMessage({
				method: fetchId,
				params: nparams
			});
		};

		var fetcher;
		var sorter;
		var initializing = true;

		if (isDefined(params.sort)) {
			sorter = jetSorter.create(params, queueNotification);
			fetcher = jetFetcher.create(params, function (nparams) {
				sorter.sorter(nparams, initializing);
			});
		} else {
			fetcher = jetFetcher.create(params, queueNotification);
			if (isDefined(message.id)) {
				peer.sendMessage({
					id: message.id,
					result: true
				});
			}
		}

		peer.fetchers[fetchId] = fetcher;
		elements.addFetcher(peer.id + fetchId, fetcher);
		initializing = false;

		if (isDefined(sorter) && sorter.flush) {
			if (isDefined(message.id)) {
				peer.sendMessage({
					id: message.id,
					result: true
				});
			}
			sorter.flush();
		}
	};

	// dispatchers the 'unfetch' jet call.
	// removes all ressources associated with the fetcher.
	var unfetch = function (peer, message) {
		var params = message.params;
		var fetchId = checked(params, 'id', 'string');
		var fetcher = peer.fetchers[fetchId];
		var fetchPeerId = peer.id + fetchId;
		if (!isDefined(fetcher)) {
			return;
		}

		delete peer.fetchers[fetchId];

		elements.removeFetcher(fetchPeerId);
	};


	// forwards / forwards a peer request or notification ("call","set") to the peer
	// of the corresponding element specified by "params.path".
	// creates an entry in the "route" table if it is a request and sets up a timer
	// which will respond a response timeout error to the requestor if
	// no corresponding response is received.
	var forward = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		try {
			var element = elements.get(path);
			var req = {};
			if (isDefined(message.id)) {
				req.id = router.request(message, peer, element);
			}
			req.method = path;

			if (params.value !== undefined) {
				req.params = {
					value: params.value,
					valueAsResult: params.valueAsResult
				};
			} else {
				req.params = params.args;
			}
			element.peer.sendMessage(req);
		} catch (err) {
			if (isDefined(message.id)) {
				peer.sendMessage({
					id: message.id,
					error: err
				});
			}
		}
	};

	var add = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		var value = params.value;
		elements.add(peers, peer, path, value);
	};

	var remove = function (peer, message) {
		var path = checked(message.params, 'path', 'string');
		elements.remove(path, peer);
	};

	var config = function (peer, message) {
		var params = message.params;
		if (params.name) {
			peer.name = params.name;
		}
		if (params.encoding) {
			throw "unsupported encoding";
		}
	};

	var safe = function (f) {
		return function (peer, message) {
			try {
				var result = f(peer, message) || true;
				if (message.id) {
					peer.sendMessage({
						id: message.id,
						result: result
					});
				}
			} catch (err) {
				if (message.id) {
					peer.sendMessage({
						id: message.id,
						error: errorObject(err)
					});
				}
			}
		};
	};

	var safeForward = function (f) {
		return function (peer, message) {
			try {
				f(peer, message);
			} catch (err) {
				log('jetd.safeForward failed', err, message);
				if (message.id) {
					peer.sendMessage({
						id: message.id,
						error: errorObject(err)
					});
				}
			}
		};
	};

	var services = {
		add: safe(add),
		remove: safe(remove),
		call: safeForward(forward),
		set: safeForward(forward),
		fetch: safeForward(fetch),
		unfetch: safe(unfetch),
		change: safe(change),
		config: safe(config),
		echo: safe(function (peer, message) {
			return message.params;
		})
	};

	var jsonrpc = new JsonRPC(services, router, log);

	var releasePeer = function (peer) {
		if (peer) {
			daemon.emit('close', peer);

			peer.eachFetcher(function (fetchId) {
				elements.removeFetcher(peer.id + fetchId);
			});

			peer.fetchers = {};

			elements.removePeer(peer);

			delete peers[peer.id];
		}
	};

	var genPeerId = function (sock) {
		return sock.remoteAddress + ':' + sock.remotePort;
	};

	var registerPeer = function (peerId, sock) {
		var peer = {};
		peer.sendMessage = function (message) {
			message = JSON.stringify(message);
			sock.send(message);
		};
		sock.on('message', function (message) {
			try {
				assert.ok(peers[peerId]);
				jsonrpc.dispatch(peer, message);
			} catch (e) {
				releasePeer(peer);
				return;
			}
		});

		peer.id = peerId;
		peer.fetchers = {};
		peer.eachFetcher = jetUtils.eachKeyValue(peer.fetchers);
		assert.ok(peers[peerId] === undefined);
		peers[peerId] = peer;
		sock.once('close', function () {
			releasePeer(peer);
		});
		daemon.emit('connection', peer);
	};

	daemon.listen = function (options) {
		if (options.tcpPort) {
			var listener = net.createServer(function (peerSocket) {
				var sock = new MessageSocket(peerSocket);
				registerPeer(genPeerId(peerSocket), sock);
			});
			listener.listen(options.tcpPort);
		}
		if (options.wsPort) {
			var wsServer = new WebSocketServer({
				port: options.wsPort,
				handleProtocols: function (protocols, cb) {
					if (protocols.indexOf('jet') > -1) {
						cb(true, 'jet');
					} else {
						cb(false);
					}
				}
			});
			wsServer.on('connection', function (ws) {
				var peerId;
				try {
					peerId = genPeerId(ws._sender._socket);
				} catch (e) {
					peerId = uuid.v1();
				}
				registerPeer(peerId, ws);
			});
		}
	};
	return daemon;
};

module.exports = createDaemon;