var util = require('util');
var net = require('net');
var http = require('http');
var WebsocketServer = require('websocket').server;
var assert = require('assert');
var errors = require('./errors');
var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket.js').MessageSocket;

var isDefined = function (x) {
    if (typeof x === 'undefined' || x === null) {
        return false;
    }
    return true;
};

var createDaemon = function () {
    var peers = {};
    var elements = {};
    var routes = {};

    var daemon = new EventEmitter();

    var routeResponse = function (peer, message) {
        var route = routes[message.id];
        if (route) {
            delete routes[message.id];
            message.id = route.id;
            route.receiver.sendMessage(message);
        } else {
            console.log('cannot router message', message);
        }
    };

    /* publishes a notification to all subsbribers / fetchers */
    var publish = function (notification) {
        daemon.emit('publish', notification);
        for (var peerId in peers) {
            var peer = peers[peerId];
            var fetchers = peer.fetchers;
            var refetch;
            for (var fetchId in fetchers) {
                try {
                    refetch = fetchers[fetchId](notification);
                } catch (e) {
                    console.log('fetch failed', e);
                }
                if (refetch) {
                    for (var path in elements) {
                        fetchers[fetchId]({
                            path: path,
                            value: elements[path].value,
                            event: 'add'
                        });
                    }
                }
            }
        }
    };

    var createPathMatcher = function (options) {
        var match = options.match;
        var unmatch = options.unmatch;
        var equalsNot = options.equalsNot;
        if (!match && !unmatch && !equalsNot) {
            return function () {
                return true;
            };
        }
        match = match || [];
        unmatch = unmatch || [];
        equalsNot = equalsNot || [];
        if (options.caseInsensitive) {
            var t = [match, unmatch, equalsNot];
            var m;
            for (var i in t) {
                m = t[i];
                for (var i in m) {
                    m[i] = m[i].toLowerCase();
                }
            }
        }
        return function (path) {
            if (options.caseInsensitive) {
                path = path.toLowerCase();
            }
            for (var i in unmatch) {
                if (path.match(unmatch[i])) {
                    return false;
                }
            }
            for (var i in equalsNot) {
                if (path == equalsNot[i])
                    return false;
            }
            for (var i in match) {
                if (path.match(match[i])) {
                    return true;
                }
            }
            return false;
        };
    };

    var createValueMatcher = function (options) {
        var ops = {
            lessThan: function (a, b) {
                return a < b;
            },
            greaterThan: function (a, b) {
                return a > b;
            },
            equals: function (a, b) {
                return a === b;
            },
            equalsNot: function (a, b) {
                return a !== b;
            }
        };
        if (options.where) {
            if (util.isArray(options.where) && options.where.length > 1) {
                return function (value) {
                    var isObject = typeof value === 'object';
                    var w;
                    var needObject;
                    var op;
                    var comp;
                    for (var i in options.where) {
                        w = options.where[i];
                        if (!w.prop || w.prop === '') {
                            needObject = false;
                        } else {
                            needObject = true;
                        }
                        if (needObject && !isObject) {
                            return false;
                        }
                        op = ops[w.op];
                        if (needObject) {
                            comp = value[w.prop];
                        } else {
                            comp = value;
                        }
                        try {
                            return op(comp, w.value);
                        } catch (e) {
                            return false;
                        }
                    }
                };
            } else {
                if (util.isArray(options.where) && options.where.length === 1) {
                    options.where = options.where[0];
                }
                var where = options.where;
                var op = ops[where.op];
                var ref = where.value;
                if (!where.prop || where.prop === '') {
                    return function (value) {
                        var isObject = typeof value === 'object';
                        if (isObject) {
                            return false;
                        }
                        try {
                            return op(value, ref);
                        } catch (e) {
                            return false;
                        }
                    };
                } else {
                    return function (value) {
                        var isObject = typeof value === 'object';
                        if (!isObject) {
                            return false;
                        }
                        try {
                            return op(value[where.prop], ref);
                        } catch (e) {
                            return false;
                        }
                    };
                }
            }
        }
    };

    var createFetcherWithoutDeps = function (options, notify) {
        var pathMatcher = createPathMatcher(options);
        var valueMatcher = createValueMatcher(options);
        var max = options.max;
        var added = {};
        var n = 0;

        return function (notification) {
            var path = notification.path;
            var value = notification.value;
            var isAdded = added[path];
            var pathMatching = true;
            var valueMatching = true;
            var isMatching = false;
            if (!isAdded && max && n === max) {
                return;
            }
            if (pathMatcher && !pathMatcher(path)) {
                pathMatching = false;
            }
            if (valueMatcher && !valueMatcher(value)) {
                valueMatching = false;
            }
            if (pathMatching && valueMatching) {
                isMatching = true;
            }
            if (!isMatching || notification.event == 'remove') {
                if (isAdded) {
                    delete isAdded[path];
                    n = n - 1;
                    notify({
                        path: path,
                        event: 'remove',
                        value: value
                    });
                    if (max && n === (max - 1)) {
                        return true;
                    }
                }
                return;
            }
            var event;
            if (!isAdded) {
                event = 'add';
                added[path] = true;
                n = n + 1;
            } else {
                event = 'change';
            }
            notify({
                path: path,
                event: event,
                value: value
            });
        }
    };

    var createSorter = function (options, notify) {
        var from;
        var to;
        var matches = [];
        var sorted = {};
        var index = [];
        var sort;
        var lt;
        var gt;
        var prop;
        var psort;
        var n = -1;
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
        } else if (options.sort.byValue) {
            if (options.sort.prop) {
                prop = options.sort.prop;
                lt = function (a, b) {
                    return a.value[prop] < b.value[prop];
                };
                gt = function (a, b) {
                    return a.value[prop] > b.value[prop];
                };
            } else {
                lt = function (a, b) {
                    return a.value < b.value;
                };
                gt = function (a, b) {
                    return a.value > b.value;
                };
            }
        }
        psort = function (s, a, b) {
            try {
                if (s(a, b)) {
                    return -1;
                }
            } catch (e) {}
            return 1;
        };

        if (options.sort.descending) {
            sort = function (a, b) {
                return psort(gt, a, b);
            }
        } else {
            sort = function (a, b) {
                return psort(lt, a, b);
            }
        }

        from = options.sort.from || 1;
        to = options.sort.to || 10;

        var isInRange = function (i) {
            return typeof i === 'number' && i >= from && i <= to;
        };

        var sorter = function (notification, initializing) {
            var event = notification.event;
            var path = notification.path;
            var value = notification.value;
            var lastMatchesLength = matches.length;
            var lastIndex;
            var newIndex;
            var wasIn;
            var isIn;
            var start;
            var stop;
            var changes = [];
            var newN;

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

            if (isDefined(lastIndex) && isDefined(newIndex) && newIndex === lastIndex) {
                if (event === 'change') {
                    notify({
                        n: n,
                        changes: [{
                            path: path,
                            value: value,
                            index: newIndex,
                        }]
                    })
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

            for (var i = start; i <= stop; ++i) {
                var ji = i - 1; // javascript index is 0 based
                var news = matches[ji];
                var olds = sorted[ji];
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

            newN = Math.min(to, matches.length);
            if (newN !== n || changes.length > 0) {
                n = newN;
                notify({
                    changes: changes,
                    n: n
                });
            }
        };

        var flush = function () {
            var changes = [];
            matches.sort(sort)
            matches.forEach(function (m, i) {
                index[m.path] = i + 1;
            });

            n = 0;

            for (var i = from; i <= to; ++i) {
                var ji = i - 1;
                var news = matches[ji];
                if (news) {
                    news.index = i;
                    n = i;
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

    var createFetcher = function (options, notify) {
        return createFetcherWithoutDeps(options, notify);
    };

    var change = function (peer, message) {
        var notification = message.params;
        var path = notification.path;
        var element = elements[path];
        if (element) {
            element.value = notification.value;
            notification.event = 'change';
            publish(notification);
        } else {
            var error = errors.invalidParams({
                invalidPath: path
            });
            if (isDefined(message.id)) {
                peer.sendMessage({
                    id: message.id,
                    error: error
                });
            } else {
                console.log('change failed with invalid path', message);
            }
        }
    };

    var fetch = function (peer, message) {
        var params = message.params;
        var fetchId = params.id;
        var queueNotification = function (nparams) {
            assert(false, 'fetcher misbehaves: must not be called yet');
        };
        var notify = function (nparams) {
            queueNotification(nparams);
        };
        var initializing = true;
        var sorter = createSorter(params, notify);
        if (sorter) {
            notify = function (nparams) {
                sorter.sorter(nparams, initializing);
            };
        }
        var fetcher = createFetcher(params, notify);
        peer.fetchers[fetchId] = fetcher;

        if (!isDefined(sorter) || (isDefined(sorter) && !isDefined(sorter.flush))) {
            if (isDefined(message.id)) {
                peer.sendMessage({
                    id: message.id,
                    result: true
                });
            }
        }

        queueNotification = function (nparams) {
            peer.sendMessage({
                method: fetchId,
                params: nparams
            });
        };

        for (var path in elements) {
            fetcher({
                path: path,
                value: elements[path].value,
                event: 'add',
            });
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

    var unfetch = function (peer, message) {
        var params = message.params;
        var fetchId = params.id;
        var fetcher = peer.fetchers[fetchId];
        delete peer.fetchers[fetchId];
        if (fetcher && isDefined(message.id)) {
            peer.sendMessage({
                id: message.id,
                result: true
            });
        }
    };

    var route = function (peer, message) {
        var params = message.params;
        var path = params.path;
        var value = params.value;
        var args = params.args;
        var element = elements[path];
        var req = {};
        var id;
        if (element) {
            if (isDefined(message.id)) {
                id = message.id + '_' + peer.id;
                assert.equal(routes[id], null);
                routes[id] = {
                    receiver: peer,
                    id: message.id
                };
            }
            req.id = id;
            req.method = path;

            if (value !== undefined) {
                req.params = {
                    value: value
                };
            } else {
                req.params = params.args;
            }
            element.peer.sendMessage(req);
        } else {
            var error = errors.invalidParams({
                notExists: path
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
        var path = params.path;
        var value = params.value;
        if (elements[path]) {
            throw errors.invalidParams({
                exists: path
            });
        }
        elements[path] = {
            peer: peer,
            value: value
        };
        publish({
            path: path,
            event: 'add',
            value: value
        });
    };

    var remove = function (peer, message) {
        var params = message.params;
        var path = params.path;
        var value;
        if (!isDefined(elements[path])) {
            throw errors.invalidParams({
                notExists: path
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
        unfetch: safeForward(unfetch),
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
            var error = errors.methodNotFound(message.method);
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
        if (peer) {
            daemon.emit('close', peer);
            peer.fetchers = {};
            for (var path in elements) {
                var element = elements[path];
                if (element.peer == peer) {
                    publish({
                        event: 'remove',
                        path: path,
                        value: element.value
                    });
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
                var error = errors.invalidRequest(message);
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
    });

    daemon.listen = function (options) {
        listener.listen(options.tcpPort);
        httpServer.listen(options.wsPort);
    };
    return daemon;
}

module.exports = createDaemon;
