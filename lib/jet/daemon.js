var util = require('util');
var net = require('net');
var WebSocketServer = require('ws').Server;
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket.js').MessageSocket;
var jetUtils = require('./utils');
var jetSorter = require('./daemon/sorter');
var jetFetcher = require('./daemon/fetcher');
var router = require('./daemon/router');
var jsonrpc = require('./daemon/jsonrpc');

var isDefined = jetUtils.isDefined;
var noop = jetUtils.noop;
var invalidParams = jetUtils.invalidParams;
var invalidRequest = jetUtils.invalidRequest;
var responseTimeout = jetUtils.responseTimeout;
var checked = jetUtils.checked;
var optional = jetUtils.optional;
var errorObject = jetUtils.errorObject;

var createDaemon = function (options) {
	options = options || {};
	var log = options.log || noop;
	var crit = options.crit || console.log;

	router.setLog(log);

	// all connected peers (clients)
	// key and value are peers itself
	var peers = {};

	// all elements which have been added
	// key is unique path, value is element (object)
	var elements = {};

	// global for tracking the neccessaity of lower casing
	// paths when publishing / notifying
	// TODO: keep track of case sensitive fetchers as lua-jet does.
	var hasCaseInsensitives = true;

	// holds all case insensitive fetchers
	// key is fetcher (Object) value is true;
	// var caseInsensitives = {};

	var daemon = new EventEmitter();

	// publishes a notification to all subsbribers / fetchers
	var publish = function (path, event, value, element) {
		daemon.emit('publish', path, event, value, element);
		var lowerPath = hasCaseInsensitives && path.toLowerCase();
		var fetchers = element.fetchers;
		var i=0;j=0;
		for (var fetcherId in fetchers) {
			if (fetchers.hasOwnProperty(fetcherId)) {
				try {
					++i;
					fetchers[fetcherId](path, lowerPath, event, value);
					++j;
				} catch (e) {
					console.log(e,444);
					crit('fetcher failed', e);
				}
			}
		}
		if (event === 'change' && value === 'foobarX') {
			console.log('publish',i,path);
		}

	};

	// dispatches the 'change' jet call.
	// updates the internal cache (element table)
	// and publishes a change event.
	var change = function (peer, message) {
		var notification = checked(message, 'params', 'object');
		var path = checked(notification, 'path', 'string');
		var element = elements[path];
		if (element && element.peer === peer) {
			element.value = notification.value;
			publish(path, 'change', element.value, element);
		} else if (!isDefined(element)) {
			throw invalidParams({
				pathNotExists: path
			});
		} else {
			assert(peer !== element.peer);
			throw invalidParams({
				foreignPath: path
			});
		}
	};

	var appendFetcherToElements = function (fetcher, fetchPeerId) {
		var mayHaveInterest;
		for (var path in elements) {
			if (elements.hasOwnProperty(path)) {
				try {
				mayHaveInterest = fetcher(
					path,
					path.toLowerCase(),
					'add',
					elements[path].value
				);
			} catch(e) {
				crit('ablabslkjdlkjd',e);
			}
									if (path === 'PPPPXXXX') {
						console.log('AA',Object.keys(elements[path].fetchers).length);
					}

				if (mayHaveInterest) {
					elements[path].fetchers[fetchPeerId] = fetcher;
				}
			}
		}
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
		console.log('fe',Object.keys(peer.fetchers).length,peer.id);
		appendFetcherToElements(fetcher, peer.id + fetchId);
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
console.log('ufe',Object.keys(peer.fetchers).length);
		for (var path in elements) {
			if (elements.hasOwnProperty(path)) {
				delete elements[path].fetchers[fetchPeerId];
			}
		}
	};


	// forwards / forwards a peer request or notification ("call","set") to the peer
	// of the corresponding element specified by "params.path".
	// creates an entry in the "route" table if it is a request and sets up a timer
	// which will respond a response timeout error to the requestor if
	// no corresponding response is received.
	var forward = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		var element = elements[path];
		var req = {};
		if (element) {
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
		} else {
			if (isDefined(message.id)) {
				peer.sendMessage({
					id: message.id,
					error: invalidParams({
						pathNotExists: path
					})
				});
			}
		}
	};

	var add = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		var value = params.value;
		var lowerPath = path.toLowerCase();
		var element = elements[path];
		var mayHaveInterest;
		var peerId;
		var fetcher, fetcherId;
		var fetchers;
		if (element) {
			throw invalidParams({
				pathAlreadyExists: path
			});
		}
		element = {
			peer: peer,
			value: value,
			fetchers: {}
		};

if (path === 'PPPPXXXX') {
	console.log('X',Object.keys(peers));
}
		for (peerId in peers) {
			if (peers.hasOwnProperty(peerId)) {
				fetchers = peers[peerId].fetchers;
				if (path === 'PPPPXXXX') {
				console.log(peerId,Object.keys(fetchers));
			}
				for (fetcherId in fetchers) {
					if (fetchers.hasOwnProperty(fetcherId)) {
						fetcher = peers[peerId].fetchers[fetcherId];
						try {
						mayHaveInterest = fetcher(path, lowerPath, 'add', value);
						if (path === 'PPPPXXXX') {
								console.log('i?',	mayHaveInterest);
							}
						if (mayHaveInterest) {
							element.fetchers[peerId + fetcherId] = fetcher;
						}
					} catch(e) {
						console.log('arggh');
						crit(e);
					}
					}
				}
			}
		}
		elements[path] = element;
		daemon.emit('publish', path, 'add', value, element);
	};

	var remove = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		var value;
		if (!isDefined(elements[path])) {
			throw invalidParams({
				pathNotExists: path
			});
		}
		if (elements[path].peer !== peer) {
			throw invalidParams({
				foreignPath: path
			});
		}
		value = elements[path].value;
		publish(path, 'remove', value, elements[path]);
		delete elements[path];
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

	jsonrpc.setServices({
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
	});

	var releasePeer = function (peer) {
		var path;
		console.log('RELEASE',peer.id);
		if (peer) {
			daemon.emit('close', peer);
			for (var fetchId in peer.fetchers) {
				if (peer.fetchers.hasOwnProperty(fetchId)) {
					for (path in elements) {
						console.log('deleting',path);
						if (elements.hasOwnProperty(path)) {
							console.log('deleting',peer.is + fetchId);
							delete elements[path].fetchers[peer.id + fetchId];
						}
					}
				}
			}
			peer.fetchers = {};
			for (path in elements) {
				if (elements.hasOwnProperty(path)) {
					var element = elements[path];
					if (element.peer === peer) {
						publish(path, 'remove', element.value, element);
						delete elements[path];
					}
				}
			}
			delete peers[peer.id];
		}
	};


	var registerPeer = function (peerId, sock) {
		var peer = {};
		console.log('REGISTER',peerId);
		peer.sendMessage = function (message) {
			if (message.params && message.params.value && message.params.value === 'foobarX') {
				console.log(message);
			}
			message = JSON.stringify(message);
			sock.send(message);
		};
		sock.on('message', function (message) {
			try {
				jsonrpc.dispatch(peer, message);
			} catch (e) {
				console.log('PANIC',e);
				releasePeer(peer);
				return;
			}
		});

		peer.id = peerId;
		peer.fetchers = {};
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
				var peerId = peerSocket.remoteAddress + peerSocket.remotePort;
				var sock = new MessageSocket(peerSocket);
				registerPeer(peerId, sock);
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
				var id = require('uuid').v1();//Math.random();
				console.log(id);
				registerPeer(id, ws);
			});
		}
	};
	return daemon;
};

module.exports = createDaemon;
