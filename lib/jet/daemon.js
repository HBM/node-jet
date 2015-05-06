var net = require('net');

var WebSocketServer = require('ws').Server;

var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket').MessageSocket;

var jetUtils = require('./utils');
var jetAccess = require('./daemon/access');
var Router = require('./daemon/router').Router;
var JsonRPC = require('./daemon/jsonrpc');
var jetFetcher = require('./fetcher');
var fetchCommon = require('./fetch-common');
var Router = require('./daemon/router').Router;
var Peers = require('./daemon/peers').Peers;
var Elements = require('./element').Elements;

var isDefined = jetUtils.isDefined;
var noop = jetUtils.noop;
var checked = jetUtils.checked;
var optional = jetUtils.optional;
var errorObject = jetUtils.errorObject;
var version = '0.3.4';

var InfoObject = function (options) {
	options.features = options.features || {};
	this.name = options.name || 'node-jet';
	this.version = version;
	this.protocolVersion = 2;
	this.features = {};
	this.features.batches = true;
	this.features.authentication = true;
	this.features.fetch = options.features.fetch || 'full';
	return this;
};

var createDaemon = function (options) {
	options = options || {};
	var log = options.log || noop;

	var users = options.users || {};
	delete options.users;
	options.users = false;
	var router = new Router(log);
	var elements = new Elements();
	var daemon = new EventEmitter();
	var infoObject = new InfoObject(options);
	var peers;

	// dispatches the 'change' jet call.
	// updates the internal cache (element table)
	// and publishes a change event.
	var change = function (peer, message) {
		var params = checked(message, 'params', 'object');
		fetchCommon.changeCore(peer, elements, params);
	};

	var fetchSimpleId = 'fetch_all';

	// dispatches the 'fetch' (simple variant) jet call.
	// sets up simple fetching for this peer (fetch all (with access), unsorted).
	var fetchSimple = function (peer, message) {
		if (peer.fetchingSimple === true) {
			throw jetUtils.invalidParams('already fetching');
		}
		var queueNotification = function (nparams) {
			peer.sendMessage({
				method: fetchSimpleId,
				params: nparams
			});
		};
		// create a "fetch all" fetcher
		var fetcher = jetFetcher.create({}, queueNotification);
		peer.fetchingSimple = true;
		if (isDefined(message.id)) {
			peer.sendMessage({
				id: message.id,
				result: fetchSimpleId
			});
		}
		peer.addFetcher(fetchSimpleId, fetcher);
		elements.addFetcher(peer.id + fetchSimpleId, fetcher, peer);
	};

	// dispatchers the 'unfetch' (simple variant) jet call.
	// removes all ressources associated with the fetcher.
	var unfetchSimple = function (peer, message) {
		if (!!!peer.fetchingSimple) {
			throw jetUtils.invalidParams('not fetching');
		}
		var fetchId = fetchSimpleId;
		var fetchPeerId = peer.id + fetchId;

		peer.removeFetcher(fetchId);
		elements.removeFetcher(fetchPeerId);
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

		var queueSuccess = function () {
			if (isDefined(message.id)) {
				peer.sendMessage({
					id: message.id,
					result: true
				});
			}
		};
		fetchCommon.fetchCore(peer, elements, params, queueNotification, queueSuccess);
	};

	// dispatchers the 'unfetch' jet call.
	// removes all ressources associated with the fetcher.
	var unfetch = function (peer, message) {
		var params = message.params;
		fetchCommon.unfetchCore(peer, elements, params);
	};


	// route / forwards a peer request or notification ("call","set") to the peer
	// of the corresponding element specified by "params.path".
	// creates an entry in the "route" table if it is a request and sets up a timer
	// which will respond a response timeout error to the requestor if
	// no corresponding response is received.
	var route = function (peer, message) {
		var params = message.params;
		var path = checked(params, 'path', 'string');
		var element = elements.get(path);
		if (!jetAccess.hasAccess(message.method, peer, element)) {
			throw jetUtils.invalidParams('no access');
		}
		var req = {};
		if (isDefined(message.id)) {
			req.id = router.request(message, peer, element);
		}
		req.method = path;

		if (message.method === 'set') {
			req.params = {
				value: params.value,
				valueAsResult: params.valueAsResult
			};
		} else {
			req.params = params.args;
		}
		element.peer.sendMessage(req);
	};

	var add = function (peer, message) {
		var params = checked(message, 'params', 'object');
		fetchCommon.addCore(peer, peers.eachPeerFetcherWithAccess(), elements, params);
	};

	var remove = function (peer, message) {
		var params = checked(message, 'params', 'object');
		fetchCommon.removeCore(peer, elements, params);
	};

	var config = function (peer, message) {
		var params = message.params;
		var name = params.name;
		delete params.name;

		if (Object.keys(params).length > 0) {
			throw jetUtils.invalidParams('unsupported config field');
		}

		if (name) {
			peer.name = name;
		}
	};

	var info = function (peer, message) {
		return infoObject;
	};

	var authenticate = function (peer, message) {
		var params = checked(message, 'params', 'object');
		var user = checked(params, 'user', 'string');
		var password = checked(params, 'password', 'string');

		if (peer.hasFetchers()) {
			throw jetUtils.invalidParams('already fetching');
		}

		if (!users[user]) {
			throw jetUtils.invalidParams('invalid user');
		}

		if (users[user].password !== password) {
			throw jetUtils.invalidParams('invalid password');
		}

		peer.auth = users[user].auth;
		return peer.auth;
	};

	var safe = function (f) {
		return function (peer, message) {
			try {
				var result = f(peer, message) || true;
				if (isDefined(message.id)) {
					peer.sendMessage({
						id: message.id,
						result: result
					});
				}
			} catch (err) {
				if (isDefined(message.id)) {
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
		call: safeForward(route),
		set: safeForward(route),
		change: safe(change),
		config: safe(config),
		info: safe(info),
		authenticate: safe(authenticate),
		echo: safe(function (peer, message) {
			return message.params;
		})
	};

	if (infoObject.features.fetch === 'full') {
		services.fetch = safeForward(fetch);
		services.unfetch = safe(unfetch);
	} else {
		services.fetch = safeForward(fetchSimple);
		services.unfetch = safe(unfetchSimple);
	}

	var jsonrpc = new JsonRPC(services, router);

	peers = new Peers(jsonrpc, elements);

	daemon.listen = function (options) {
		if (options.tcpPort) {
			var listener = net.createServer(function (peerSocket) {
				var sock = new MessageSocket(peerSocket);
				var peer = peers.add(sock);
				peer.on('disconnect', function () {
					daemon.emit('disconnect', peer);
				});
				daemon.emit('connection', peer);
			});
			listener.listen(options.tcpPort);
		}
		if (options.wsPort || options.server) {
			var wsServer = new WebSocketServer({
				port: options.wsPort,
				server: options.server,
				handleProtocols: function (protocols, cb) {
					if (protocols.indexOf('jet') > -1) {
						cb(true, 'jet');
					} else {
						cb(false);
					}
				}
			});
			wsServer.on('connection', function (ws) {
				var peer = peers.add(ws);
				peer.on('disconnect', function () {
					daemon.emit('disconnect', peer);
				});
				daemon.emit('connection', peer);
			});
		}
	};
	return daemon;
};

module.exports = createDaemon;