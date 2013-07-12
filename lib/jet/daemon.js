var util = require('util');
var net = require('net');
var http = require('http');
var WebsocketServer = require('websocket').server;
var assert = require('assert');
var errors = require('./errors');
var EventEmitter = require('events').EventEmitter;
var MessageSocket = require('./message-socket.js').MessageSocket;

exports.createDaemon = function() {
    var peers = {};
    var leaves = {};
    var routes = {};

    var daemon = new EventEmitter();

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
        daemon.emit('publish', notification);
        for (var peerId in peers) {
            var peer = peers[peerId];
            var fetchers = peer.fetchers;
	    var refetch;
            for (var fetchId in fetchers) {
                try {
		    refetch = fetchers[fetchId](notification);
		}
		catch(e) {
		    console.log('fetch failed',e);
		}
		if (refetch) {
		    for(var path in leaves) {
			fetchers[fetchId]({
			    path: path,
			    value: leaves[path].value,
			    event: 'add'
			});
		    }
		}
            }
        }
    };

    var createPathMatcher = function(options) {
	var match = options.match;
	var unmatch = options.unmatch;
	var equalsNot = options.equalsNot;	
	if (!match && !unmatch && !equalsNot) {
	    return function() {return true;};
	}
	match = match || [];
	unmatch = unmatch || [];
	equalsNot = equalsNot || [];
	if (options.caseInsensitive) {
	    var t = [match,unmatch,equalsNot];
	    var m;
	    for (var i in t) {
		m = t[i];
		for (var i in m) {
		    m[i] = m[i].toLowerCase();
		}
	    }
	}
	return function(path) {
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

    var createValueMatcher = function(options) {
	var ops = {
	    lessThan: function(a,b) {
		return a < b;
	    },
	    greaterThan: function(a,b) {
		return a > b;
	    },
	    equals: function(a,b) {
		return a === b;
	    },
	    equalsNot: function(a,b) {
		return a !== b;
	    }	    
	};
	if (options.where) {
	    if (utils.isArray(options.where) && options.where.length > 1) {
		return function(value) {
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
			    return op(comp,w.value);
			} catch(e) {
			    return false;
			}
		    }
		};
	    } else {
		if (utils.isArray(options.where) && options.where.length === 1) {
		    options.where = options.where[0];
		}
		var where = options.where;
		var op = ops[where.op];
		var ref = where.value;		
		if (!w.prop || w.prop === '') { 
		    return function(value) {
			var isObject = typeof value === 'object';
			if (isObject) {
			    return false;
			}
			try {
			    return op(value,ref);
			} catch(e) {
			    return false;
			}
		    };
		} else {
		    return function(value) {
			var isObject = typeof value === 'object';
			if (!isObject) {
			    return false;
			}
			try {
			    return op(value[where.prop],ref);
			} catch(e) {
			    return false;
			}
		    };
		}
	    }
	}
    };

    var createFetcherWithoutDeps = function(options,notify) {
	var pathMatcher = createPathMatcher(options);
	var valueMatcher = createValueMatcher(options);
	var max = options.max;
	var added = {};
	var n = 0;
	
	return function(notification) {
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
		    if (max && n === (max-1)) {
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

    var createSorter = function(options,notify) {
        var from;
        var to;
        var matching = {};
        var sorted = [];
        var sort;
        var lt;
        var gt;
        var prop;
        var psort;
        if (!options.sort) {
            return;
        }
        from = options.sort.from || 1;
        to = options.sort.to || 10;
        if (!options.sort.byValue || options.sort.byPath) {
            gt = function(a,b) {
                return a.path > b.path;
            };
            lt = function(a,b) {
                return a.path < b.path;
            };
        } else if(options.sort.byValue) {
            if (options.sort.prop) {
                prop = options.sort.prop;
                lt = function(a,b) {
                    return a.value[prop] < b.value[prop];
                };
                gt = function(a,b) {
                    return a.value[prop] > b.value[prop];
                };
            } else {
                lt = function(a,b) {
                    return a.value < b.value;
                };
                gt = function(a,b) {
                    return a.value > b.value;
                };
            }
        }
        psort = function(s,a,b) {
            try {
                if (s(a,b)) {
                    return -1;
                }
            } catch(e) {
            }
            return 1;
        };

        if (options.sort.descending) {
            sort = function(a,b) {
                return psort(gt,a,b);
            }
        } else {
            sort = function(a,b) {
                return psort(lt,a,b);
            }
        }        

        var sorter = function(notification,initializing) {
            var event = notification.event;
            var path = notification.path;
            var value = notification.value;
            var newSorted = [];
            var changes = {};
            var moved;
            if (event == 'remove') {
                delete matching[path];
            } else {
                matching[path] = {
                    path: path,
                    value: value
                };
            }
            if (initializing) {
                return
            };
            for (var p in matching) {
                newSorted.push(matching[p]);
            }

            newSorted.sort(sort);
                          
            for (var i=from-1; i < Math.min(to,sorted.length); ++i) {
                if (!newSorted[i]) {
                    changes[i] = {
                        path: sorted[i].path,
                        event: 'remove',
                        index: i+1,
                        value: sorted[i].value
                    };
                } else {
                    if (sorted[i].path === newSorted[i].path) {
                        if (event === 'change') {
                            changes[i] = {
                                path: newSorted[i].path,
                                event: 'change',
                                index: i+1,
                                value: newSorted[i].value
                            };
                        }
                    } else {
                        moved = false;
                        for (var j=from-1; j < Math.min(to,newSorted.length); ++j) {
                            if (sorted[i].path === newSorted[j].path) {
                                changes[j] = {
                                    path: sorted[i].path,
                                    event: 'change',
                                    index: j+1,
                                    value: sorted[i].value
                                };
                                moved = true;
                                delete sorted[i];
                                break;
                            }
                        }
                    }
                }
            }
            for (var i in changes) {
                notify(changes[i]);
            }
            for (var i=from-1; i < to; ++i) {
                if (!sorted[i] and newSorted[i] and !changes[i]) {
                    notify({
                        path: newSorted[i].path,
                        value: newSorted[i].value,
                        event: 'add',
                        index: i+1
                    });
                }
            }
            sorted = newSorted;            
        };

        var flush = function() {
            sorted = {};
            for (var path in matching) {
                sorted.push(matching[path]);
            }
            newSorted.sort(sort);
            for (var i=from-1; i < to; ++i) {
                if (!sorted[i]) {
                    break;
                }
                notify({
                    path: sorted[i].path,
                    value: sorted[i].value,
                    event: 'add',
                    index: i+1
                });
            }
        };

        return {
            sorter: sorter,
            flush: flush
        };
    };

    var createFetcher = function(options,notify) {
        return createFetcherWithoutDeps(options,notify);
    };
    
    var change = function(peer, message) {
        var notification = message.params;
        var path = notification.path;
        var leave = leaves[path];
        if (leave) {
            leave.value = notification.value;
            notification.event = 'change';
            publish(notification);
        }
        else {
            var error = errors.invalidParams({
                invalidPath: path
            });
            if (isDefined(message.id)) {
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
        var queueNotification = function(nparams) {
            assert(false,'fetcher misbehaves: must not be called yet');
        };
        var notify = function(nparams) {
            queueNotification(nparams);
        };
        var initializing = true;        
        var sorter = createSorter(params,notify);
        if (sorter) {
            notify = function(nparams) {
                sorter.sorter(nparams,initializing);
            };
        }
        var fetcher = createFetcher(params,notify);
        peer.fetchers[fetchId] = fetcher;

        if (isDefined(message.id)) {
            peer.sendMessage({
                id: message.id,
                result: true;
            });
        }

        queueNotification = function(nparams) {
            peer.sendMessage({
                method: fetchId,
                params: nparams
            });
        };
        
        for (var path in leaves) {
            fetcher({
                path: path,
                value: leaves[path].value,
                event: 'add',
            });
        }
        initializing = false;
        if (sorter.flush) {
            sorter.flush();
        }
    };

    var unfetch = function(peer, message) {
        
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
            leave.peer.sendMessage({
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
            leave.peer.sendMessage({
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

    var releasePeer = function(peer) {
        if (peer) {
            daemon.emit('close', peer);
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

    var dispatchMessage = function(peer, message) {
        if (message.id) {
            if (message.method) {
                dispatchRequest(peer, message);
            }
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
    

    var listener = net.createServer(function(peerSocket) {
        var peer = new MessageSocket(peerSocket);
        peer.on('messages', function(batch) {
            assert.equal(util.isArray(batch), true);
            batch.forEach(function(message) {
                dispatchMessage(peer, message);
            });
        });
        var peerId = peerSocket.remoteAddress + peerSocket.remotePort;
        peer.id = peerId;
        peer.fetchers = {};
        peers[peerId] = peer;
        peerSocket.on('close', function() {
	    releasePeer(peer);
	});
        peerSocket.on('error', function() {
	    releasePeer(peer);
	});
        daemon.emit('connection', peer);
    });

    var httpServer = http.createServer();    
    var wsServer = new WebsocketServer({
	httpServer: httpServer	
    });

    wsServer.on('request',function(request){
	var peer = request.accept('jet', request.origin);
        var peerId = peer.socket._peername.address = peer.socket._peername.port;
        peer.id = peerId;
        peer.fetchers = {};
        peers[peerId] = peer;
	peer.sendMessage = function(message) {
	    peer.sendUTF(JSON.stringify(message));
	};
	peer.on('message', function(message) {
            if (message.type === 'utf8') {
		try{
		    message = JSON.parse(message.utf8Data);
		    if (util.isArray(message)) {
			message.forEach(function(message) {
			    dispatchMessage(peer,message);
			});
		    }
		    else {
			dispatchMessage(peer,message);
		    }
		}
		catch(e) {
		    console.log('error',e);
		}
            }
	});
	peer.on('close', function() {
	    releasePeer(peer);
	});
	peer.on('error', function() {
	    releasePeer(peer);
	});
    });
    
    daemon.listen = function(options) {
        listener.listen(options.tcpPort);
	httpServer.listen(options.wsPort);
    };
    return daemon;
}
