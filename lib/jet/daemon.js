var util = require('util');
var net = require('net');
var http = require('http');
var WebsocketServer = require('websocket').server;
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket.js').MessageSocket;
var jetUtils = require('./utils');
var jetSorter = require('./daemon/sorter');
var jetFetcher = require('./daemon/fetcher');


var isDefined = jetUtils.isDefined;
var noop = jetUtils.noop;
var invalidParams = jetUtils.invalidParams;
var invalidRequest = jetUtils.invalidRequest;
var responseTimeout = jetUtils.responseTimeout;
var methodNotFound = jetUtils.methodNotFound;
var internalError = jetUtils.internalError;
var parseError = jetUtils.parseError;


var createDaemon = function (options) {
    options = options || {};
    var log = options.log || noop;
    var info = options.info || noop;
    var debug = options.debug || noop;
    var crit = options.crit || console.log;

    // all connected peers (clients)
    // key and value are peers itself
    var peers = {};

    // all elements which have been added
    // key is unique path, value is element (object)
    var elements = {};

    // holds info about all pending requests (which are routed)
    // key is (daemon generated) unique id, value is Object
    // with original request id and receiver (peer) and request
    // timer
    var routes = {};

    // global for tracking the neccessaity of lower casing
    // paths when publishing / notifying
    // TODO: keep track of case sensitive fetchers as lua-jet does.
    var hasCaseInsensitives = true;

    // holds all case insensitive fetchers
    // key is fetcher (Object) value is true;
    // var caseInsensitives = {};

    var daemon = new EventEmitter();

    // routes an incoming response to the requestor (peer)
    // which made the request.
    // stops timeout timer eventually.
    var routeResponse = function (peer, message) {
        var route = routes[message.id];
        if (route) {
            clearTimeout(route.timer);
            delete routes[message.id];
            message.id = route.id;
            route.receiver.sendMessage(message);
        } else {
            console.log('cannot router message', message);
        }
    };

    // publishes a notification to all subsbribers / fetchers
    var publish = function (path, event, value, element) {
        daemon.emit('publish', path, event, value, element);
        var lowerPath = hasCaseInsensitives && path.toLowerCase();
        for (var fetcherId in element.fetchers) {
            try {
                element.fetchers[fetcherId](path, lowerPath, event, value);
            } catch (e) {
                crit('fetcher failed', e);
            }
        }
    };

    // flushes all outstanding / queued messages to the peer underlying transport
    var flushPeers = function () {
        for (var peer in peers) {
            peer.flush();
        }
    };

    var checked = function (tab, key, typename) {
        var p = tab[key];
        if (isDefined(p)) {
            if (typename) {
                if (typeof (p) === typename) {
                    return p;
                } else {
                    throw invalidParams({
                        wrongType: key,
                        got: tab
                    });
                }
            } else {
                return p;
            }
        } else {
            throw invalidParams({
                missingParam: key,
                got: tab
            });
        }
    };

    var optional = function (tab, key, typename) {
        var p = tab[key];
        if (isDefined(p)) {
            if (typename) {
                if (typeof (p) === typename) {
                    return p;
                }
            } else {
                throw invalidParams({
                    wrongType: key,
                    got: tab
                });
            }
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

    // dispatches the 'fetch' jet call.
    // creates a fetch operation and optionally a sorter.
    // all elements are inputed as "fake" add events. The
    // fetcher is only asociated with the element if
    // it "shows interest".
    var fetch = function (peer, message) {
        var params = checked(message, 'params', 'object');
        var fetchId = checked(params, 'id');
        var queueNotification;
        var mayHaveInterest;
        var fetchPeerId;
        var notify = function (nparams) {
            assert(queueNotification);
            queueNotification(nparams);
        };
        var initializing = true;
        var sorter = jetSorter.create(params, notify);
        if (isDefined(sorter)) {
            notify = function (nparams) {
                sorter.sorter(nparams, initializing);
            };
        }
        var fetcher = jetFetcher.create(params, notify);
        peer.fetchers[fetchId] = fetcher;

        if (isDefined(message.id) && !isDefined(sorter)) {
            peer.sendMessage({
                id: message.id,
                result: true
            });
        }

        queueNotification = function (nparams) {
            peer.sendMessage({
                method: fetchId,
                params: nparams
            });
        };

        fetchPeerId = peer.id + fetchId;

        for (var path in elements) {
            mayHaveInterest = fetcher(
                path,
                path.toLowerCase(),
                'add',
                elements[path].value
            );
            if (mayHaveInterest) {
                elements[path].fetchers[fetchPeerId] = fetcher;
            }
        }

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

        for (var path in elements) {
            delete elements[path].fetchers[fetchPeerId];
        }
    };

    // counter to make the routed request more unique.
    // addresses situation if a peer makes two requests with
    // same message.id.
    var rcount = 0;

    // routes / forwards a peer request or notification ("call","set") to the peer
    // of the corresponding element specified by "params.path".
    // creates an entry in the "route" table if it is a request and sets up a timer
    // which will respond a response timeout error to the requestor if
    // no corresponding response is received.
    var route = function (peer, message) {
        var params = message.params;
        var path = checked(params, 'path', 'string');
        var value = params.value;
        var args = params.args;
        var element = elements[path];
        var req = {};
        var id;
        var timeout;
        if (element) {
            if (isDefined(message.id)) {
                timeout = optional(params, 'timeout', 'number') || element.timeout || 5;
                rcount = (rcount + 1) % 2 ^ 31;
                id = message.id.toString() + peer.id + rcount;
                assert.equal(routes[id], null);
                routes[id] = {
                    receiver: peer,
                    id: message.id,
                    timer: setTimeout(function(){
                      peer.sendMessage({
                        id: message.id,
                        error: responseTimeout(params)
                      });
                    },timeout*1000)
                };
            }
            req.id = id;
            req.method = path;

            if (value !== undefined) {
                req.params = {
                    value: value,
                    valueAsResult: params.valueAsResult
                };
            } else {
                req.params = params.args;
            }
            element.peer.sendMessage(req);
        } else {
            var error = invalidParams({
                pathNotExists: path
            });
            if (isDefined(message.id)) {
                peer.sendMessage({
                    id: message.id,
                    error: error
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
        if (element) {
            throw invalidParams({
                pathAlreadyExists: path
            });
        }
        element = {
            peer: peer,
            value: value,
            timeout: params.timeout, // optional
            fetchers: {}
        };

        for (peerId in peers) {
            for (fetcherId in peers[peerId].fetchers) {
                fetcher = peers[peerId].fetchers[fetcherId];
                mayHaveInterest = fetcher(path, lowerPath, 'add', value);
                if (mayHaveInterest) {
                    element.fetchers[peerId + fetcherId] = fetcher;
                }
            }
        }
        elements[path] = element;
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
        if (element.peer !== peer) {
            throw invalidParams({
                foreignPath: path
            });
        }
        value = elements[path].value;
        delete elements[path];
        publish({
            path: path,
            event: 'remove',
            value: value
        });
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
                    if (typeof (err) === 'object') {
                        assert.ok(err.code && err.message, err);
                        peer.sendMessage({
                            id: message.id,
                            error: err
                        });
                    } else {
                        peer.sendMessage({
                            id: message.id,
                            error: {
                                code: -32603,
                                message: 'Internal error',
                                data: err
                            }
                        });
                    }
                }
            }
        };
    };

    var safeForward = function (f) {
        return function (peer, message) {
            try {
                f(peer, message);
            } catch (err) {
                console.log('jetd.safeForward failed', err, message);
                if (message.id) {
                    if (typeof (err) === 'object') {
                        assert.ok(err.code && err.message, err);
                        peer.sendMessage({
                            id: message.id,
                            error: err
                        });
                    } else {
                        peer.sendMessage({
                            id: message.id,
                            error: {
                                code: -32603,
                                message: 'Internal error',
                                data: err
                            }
                        });
                    }
                }
            }
        };
    };

    var services = {
        add: safe(add),
        remove: safe(remove),
        call: safeForward(route),
        set: safeForward(route),
        fetch: safeForward(fetch),
        unfetch: safe(unfetch),
        change: safe(change),
        config: safe(config),
        echo: safe(function (peer, message) {
            return message.params;
        })
    };

    var dispatchRequest = function (peer, message) {
        assert.ok(message.method);
        var service = services[message.method];
        if (service) {
            service(peer, message);
        } else {
            var error = methodNotFound(message.method);
            peer.sendMessage({
                id: message.id,
                error: error
            });
        }
    };

    var dispatchNotification = function (peer, message) {
        assert.ok(message.method);
        var service = services[message.method];
        if (service) {
            service(peer, message);
        }
    };

    var releasePeer = function (peer) {
        var fetcher;
        var path;
        if (peer) {
            daemon.emit('close', peer);
            for (var fetchId in peer.fetchers) {
                for (path in elements) {
                    delete elements[path].fetchers[peer.id + fetchId];
                }
            }
            peer.fetchers = {};
            for (path in elements) {
                var element = elements[path];
                if (element.peer == peer) {
                    publish(path, 'remove', element.value, element);
                    delete elements[path];
                }
            }
            delete peers[peer.id];
        }
    };

    var dispatchMessage = function (peer, message) {
        if (message.id) {
            if (message.method) {
                dispatchRequest(peer, message);
            } else if (message.result !== null || message.error !== null) {
                routeResponse(peer, message);
            } else {
                var error = invalidRequest(message);
                peer.sendMessage({
                    id: message.id,
                    error: error
                });
                console.log('invalid request', message);
            }
        } else if (message.method) {
            dispatchNotification(peer, message);
        } else {
            console.log('invalid message', message);
        }
    };


    var listener = net.createServer(function (peerSocket) {
        var peer = new MessageSocket(peerSocket);
        peer.on('messages', function (batch) {
            assert.equal(util.isArray(batch), true);
            batch.forEach(function (message) {
                dispatchMessage(peer, message);
            });
        });
        var peerId = peerSocket.remoteAddress + peerSocket.remotePort;
        peer.id = peerId;
        peer.fetchers = {};
        peers[peerId] = peer;
        peer.once('close', function (b) {
            releasePeer(peer);
        });
        daemon.emit('connection', peer);
    });

    var httpServer = http.createServer();
    var wsServer = new WebsocketServer({
        httpServer: httpServer
    });

    wsServer.on('request', function (request) {
        try {
        var peer = request.accept('jet', request.origin);
        var peerId = peer.socket._peername.address = peer.socket._peername.port;
        peer.id = peerId;
        peer.fetchers = {};
        peers[peerId] = peer;
        peer.sendMessage = function (message) {
            peer.sendUTF(JSON.stringify(message));
        };
        peer.on('message', function (message) {
            if (message.type === 'utf8') {
                try {
                    message = JSON.parse(message.utf8Data);
                    if (util.isArray(message)) {
                        message.forEach(function (message) {
                            dispatchMessage(peer, message);
                        });
                    } else {
                        dispatchMessage(peer, message);
                    }
                } catch (e) {
                    console.log('error', e);
                }
            }
        });
        peer.on('close', function () {
            releasePeer(peer);
        });
        peer.on('error', function () {
            releasePeer(peer);
        });
        } catch(e) {
            console.log('websocket accept failed',e);
            request.reject(102,'bla');
}
    });

    daemon.listen = function (options) {
	if (options.tcpPort) {
            listener.listen(options.tcpPort);
	}
	if (options.wsPort) {
            httpServer.listen(options.wsPort);
	}
    };
    return daemon;
};

module.exports = createDaemon;
