var util = require('util');
var net = require('net');
var assert = require('assert');
var errors = require('./errors');

var MessageSocket = require('./message-socket.js').MessageSocket;

var peers = {};
var nodes = {};
var leaves = {};
var routes = {};

var routeResponse = function(peer, message) {
    var route = routes[message.id];
    if (route) {
        delete routes[message.id];
        message.id = route.id;
        route.receiver.sendMessage(message);
    }
    else {
        console.log('cannot router message', message);
    }
};

/* publishes a notification to all subsbribers / fetchers */
var publish = function(notification) {
    var path = notification.path;
    for (var peerId in peers) {
        var peer = peers[peerId];
        var fetchers = peer.fetchers;
        for (var fetchId in fetchers) {
            if (fetchers[fetchId](path)) {
                peer.sendMessage({
                    method: fetchId,
                    params: notification
                });
            }
        }
    }
};

/* creates a match function from an array of match and unmatch
   expressions.
*/
var matcher = function(match, unmatch) {
    return function(path) {
        for (var i = 0; i < unmatch.length; ++i) {
            if (path.match(unmatch[i])) {
                return false;
            }
        }
        for (i = 0; i < match.length; ++i) {
            if (path.match(match[i])) {
                return true;
            }
        }
        return false;
    };
};

var post = function(peer, message) {
    var notification = message.params;
    var path = notification.path;
    var event = notification.event;
    var data = notification.data;
    var leave = leaves[path];
    if (leave) {
        if (event === 'change') {
            if (data.value) {
                leave.element.value = data.value;
            }
            if (data.schema) {
                leave.element.schema = data.schema;
            }
        }
        publish(notification);
    }
    else {
        var error = errors.invalidParams({
            invalidPath: path
        });
        if (message.id) {
            peer.sendMessage({
                id: message.id,
                error: error
            });
        }
        else {
            console.log('post failed with invalid path', message);
        }
    }
};

var fetch = function(peer, message) {
    var params = message.params;
    var fetchId = params.id;
    var match = params.match;
    var unmatch = params.unmatch || [];
    var matchf = matcher(match, unmatch);
    if (!peer.fetchers[fetchId]) {
        var nodeNotifications = [];
        for (var path in nodes) {
            if (matchf(path)) {
                var notification = {
                    method: fetchId,
                    params: {
                        path: path,
                        event: 'add',
                        data: {
                            type: 'node'
                        }
                    }
                };
                nodeNotifications.push(notification);
            }
        }
        nodeNotifications.sort(function(a, b) {
            return a.length - b.length;
        });
        nodeNotifications.forEach(function(nodeNotification) {
            peer.sendMessage(nodeNotification);
        });
        for (path in leaves) {
            if (matchf(path)) {
                var leave = leaves[path];
                peer.sendMessage({
                    method: fetchId,
                    params: {
                        path: path,
                        event: 'add',
                        data: leave.element
                    }
                });
            }
        }
    }
    peer.fetchers[fetchId] = matchf;
    if (message.id) {
        peer.sendMessage({
            id: message.id,
            result: true
        });
    }
};

var set = function(peer, message) {
    var params = message.params;
    var path = params.path;
    var value = params.value;
    var leave = leaves[path];
    if (leave && leave.element.type === 'state') {
        var id;
        if (message.id) {
            id = message.id + '_' + peer.id;
            assert.equal(routes[id], null);
            routes[id] = {
                receiver: peer,
                id: message.id
            };
        }
        peer.sendMessage({
            id: id, // maybe null
            method: path,
            params: {
                value: value
            }
        });
    }
    else {
        var error;
        if (leave) {
            error = errors.invalidParams({
                pathIsNotState: path
            });
        }
        else {
            error = errors.invalidParams({
                invalidPath: path
            });
        }
        if (message.id) {
            peer.sendMessage({
                id: message.id,
                error: error
            });
        }
        console.log('set failed', error);
    }
};

var call = function(peer, message) {
    var params = message.params;
    var path = params.path;
    var args = params.args;
    var leave = leaves[path];
    if (leave && leave.element.type === 'method') {
        var id;
        if (message.id) {
            id = message.id + '_' + peer.id;
            assert.equal(routes[id], null);
            routes[id] = {
                receiver: peer,
                id: message.id
            };
        }
        peer.sendMessage({
            id: id, // maybe null
            method: path,
            params: args
        });
    }
    else {
        var error;
        if (leave) {
            error = errors.invalidParams({
                pathIsNotMethod: path
            });
        }
        else {
            error = errors.invalidParams({
                invalidPath: path
            });
        }
        if (message.id) {
            peer.sendMessage({
                id: message.id,
                error: error
            });
        }
        console.log('call failed', error);
    }
};

var incrementNodes = function(path) {
    var parts = path.split('/');
    for (var i = 1; i < parts.length; ++i) {
        path = parts.slice(0, i).join('/');
        var count = nodes[path];
        if (count) {
            ++nodes[path];
        }
        else {
            nodes[path] = 1;
            publish({
                event: 'add',
                path: path,
                data: {
                    type: 'node'
                }
            });
        }
    }
};

var decrementNodes = function(path) {
    var parts = path.split('/');
    for (var i = parts.length - 1; i > 0; --i) {
        path = parts.slice(0, i).join('/');
        var count = nodes[path];
        assert.ok(count > 0);
        if (count > 1) {
            --nodes[path];
        }
        else {
            delete nodes[path];
            publish({
                event: 'remove',
                path: path,
                data: {
                    type: 'node'
                }
            });
        }
    }
};

var add = function(peer, message) {
    var params = message.params;
    var path = params.path;
    if (nodes[path] || leaves[path]) {
        throw errors.invalidParams({
            occupiedPath: path
        });
    }
    incrementNodes(path);
    var element = params.element;
    if (element.type !== 'state' && element.type !== 'method') {
        throw errors.invalidParams({
            missingParam: 'element.type',
            got: params
        });
    }
    leaves[path] = {
        peer: peer,
        element: element
    };
    publish({
        path: path,
        event: 'add',
        data: element
    });
};

var remove = function(peer, message) {
    var params = message.params;
    var path = params.path;
    if (!leaves[path]) {
        throw errors.invalidParams({
            invalidPath: path
        });
    }
    var element = leaves[path].element;
    assert.ok(element);
    delete leaves[path];
    publish({
        path: path,
        event: 'remove',
        data: element
    });
    decrementNodes(path);
};

var safe = function(f) {
    return function(peer, message) {
        try {
            var result = f(peer, message) || true;
            if (message.id) {
                peer.sendMessage({
                    id: message.id,
                    result: result
                });
            }
        }
        catch (err) {
            console.log('jetd.safe failed', err, message);
            if (message.id) {
                if (typeof(err) === 'object') {
                    assert.ok(err.code && err.message, err);
                    peer.sendMessage({
                        id: message.id,
                        error: err
                    });
                }
                else {
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

var safeForward = function(f) {
    return function(peer, message) {
        try {
            f(peer, message);
        }
        catch (err) {
            console.log('jetd.safeForward failed', err, message);
            if (message.id) {
                if (typeof(err) === 'object') {
                    assert.ok(err.code && err.message, err);
                    peer.sendMessage({
                        id: message.id,
                        error: err
                    });
                }
                else {
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
    call: safeForward(call),
    set: safeForward(set),
    fetch: safeForward(fetch),
    post: safe(post),
    echo: safe(function(peer, message) {
        return message.params;
    })
};

var dispatchRequest = function(peer, message) {
    assert.ok(message.method);
    var service = services[message.method];
    if (service) {
        service(peer, message);
    }
    else {
        var error = errors.methodNotFound(message.method);
        peer.sendMessage({
            id: message.id,
            error: error
        });
    }
};

var dispatchNotification = function(peer, message) {
    assert.ok(message.method);
    var service = services[message.method];
    if (service) {
        service(peer, message);
    }
};

exports.createDaemon = function() {
    var listener = net.createServer(function(peerSocket) {
        var peer;
        var releasePeer = function() {
            if (peer) {
                peer.fetchers = {};
                for (var path in leaves) {
                    var leave = leaves[path];
                    if (leave.peer == peer) {
                        publish({
                            event: 'remove',
                            path: path,
                            data: {
                                type: leave.element.type
                            }
                        });
                        decrementNodes(path);
                        delete leaves[path];
                    }
                }
            }
        };
        peer = new MessageSocket(peerSocket);
        var dispatchMessage = function(message) {
            if (message.id) {
                if (message.method) {}
                else if (message.result !== null || message.error !== null) {
                    routeResponse(peer, message);
                }
                else {
                    var error = errors.invalidRequest(message);
                    peer.sendMessage({
                        id: message.id,
                        error: error
                    });
                    console.log('invalid request', message);
                }
            }
            else if (message.method) {
                dispatchNotification(peer, message);
            }
            else {
                console.log('invalid message', message);
            }
        };
        peer.on('messages', function(batch) {
            assert.equal(util.isArray(batch), true);
            batch.forEach(function(message) {
                dispatchMessage(message);
            });
        });
        var peerId = peerSocket.remoteAddress + peerSocket.remotePort;
        peer.id = peerId;
        peer.fetchers = {};
        peers[peerId] = peer;
        peerSocket.on('close', releasePeer);
        peerSocket.on('error', releasePeer);
    });
    return listener;
}
