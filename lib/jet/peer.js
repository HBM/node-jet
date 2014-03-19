var util = require('util');
var events = require('events');
var assert = require('assert');
var net = require('net');
var MessageSocket = require('./message-socket.js').MessageSocket;

var isDefined = function (x) {
    if (typeof x === 'undefined' || x === null) {
        return false;
    }
    return true;
};

var errorObject = function (err) {
    if (typeof err == 'Object' && isDefined(err.code) && isDefined(err.message)) {
        return err;
    } else {
        return {
            code: -32602,
            message: 'Internal error',
            data: err
        };
    }
};

var Peer = function (config) {
    config = config || {};
    config.port = config.port || 11122;
    config.ip = config.ip || 'localhost';
    var requestDispatchers = {};
    var responseDispatchers = {};
    var msock = new MessageSocket(net.connect(config.port, config.ip));
    var self = this;
    var dispatchResponse = function (message) {
        var mid = message.id;
        var callback = responseDispatchers[mid];
        delete responseDispatchers[mid];
        assert(callback);
        callback(message.error, message.result);
    };
    var dispatchRequest = function (message) {
        var dispatcher = requestDispatchers[message.method];
        try {
            dispatcher(message);
        } catch (err) {
            if (isDefined(message.id)) {
                msock.sendMessage(errorObject(err));
            }
        }
    };
    var dispatchSingleMessage = function (message) {
        if (isDefined(message.method)) {
            dispatchRequest(message);
        } else {
            dispatchResponse(message)
        }
    };
    var id = 0;
    var service = function (method, params, complete, callback, timeout) {
        var reqId;
        var callbackBak;
        var error;
        var message = {};
        if (callback) { // make a request
            params.timeout = timeout;
            id = id + 1;
            reqId = id;
            message.id = reqId;
            if (complete) {
                callbackBak = callback;
                callback = function (err, result) {
                    complete(err, result);
                    callbackBak(err, result);
                }
            }
            responseDispatchers[reqId] = callback;
        } else {
            if (complete) {
                complete(null, true);
            }
        }
        message.params = params;
        message.method = method;
        msock.sendMessage(message);
    };
    var add = function (desc, dispatch, callback) {
        var params = {};
        var path = desc.path;
        var ref = {};
        var assignDispatcher = function (err, result) {
            if (!isDefined(err)) {
                requestDispatchers[path] = dispatch;
            }
        };
        params.path = desc.path;
        params.value = desc.value;
        service('add', params, assignDispatcher, callback);
        ref.remove = function (callback) {
            assert(ref.isAdded());
            remove(path, callback);
        };
        ref.isAdded = function () {
            return isDefined(requestDispatchers[desc.path]);
        };
        ref.add = function (value, callback) {
            if (value !== undefined) {
                desc.value = value;
            }
            add(desc.dispatch, callback);
        };
        ref.path = function () {
            return path;
        };
        return ref;
    };

    var remove = function (path, callback) {
        var removeDispatcher = function (err, result) {
            if (!isDefined(err)) {
                delete requestDispatchers[path];
            }
        };
        service('remove', {
            path: path
        }, removeDispatcher, callback);
    };

    msock.on('messages', function (message) {
        if (util.isArray(message)) {
            var batch = message;
            batch.forEach(function (message) {
                dispatchSingleMessage(message);
            });
        } else {
            dispatchSingleMessage(message);
        }
    });

    msock.on('error', function (err) {
        self.emit('error', err);
    });

    self.close = function () {
        msock.close();
    };

    self.call = function (path, params, callback) {
        var params = {
            path: path,
            args: params || []
        };
        service('call', params, null, callback);
    };

    self.config = function (params, callback) {
        service('config', params, null, callback);
    };

    self.set = function (path, value, callback) {
        var params = {
            path: path,
            value: value
        };
        service('set', params, null, callback);
    };

    var fetchId = 0;

    self.fetch = function (params, onFetchData, callback) {
        var id;
        var ref = {};
        var sorting = params.sort;
        var addFetcher;
        fetchId = fetchId + 1;
        id = 'f' + fetchId;
        addFetcher = function (err, result) {
            if (result) {
                requestDispatchers[id] = function (message) {
                    var params = message.params;
                    if (sorting) {
                        onFetchData(params.changes, params.n, ref);
                    } else {
                        onFetchData(params.path, params.event, params.value || null, ref);
                    }
                };
            }
        };

        if (typeof params === 'string') {
            params = {
                match: [params]
            };
        }
        params.id = id;
        service('fetch', params, addFetcher, callback);
        ref.unfetch = function (callback) {
            var removeDispatcher = function () {
                delete requestDispatcher[id];
            };
            service('unfetch', {
                id: id
            }, removeDispatcher, callback);
        };
        return ref;
    };

    self.state = function (desc, callback) {
        var dispatch;
        var value;
        var path = desc.path;
        var ref;
        if (!isDefined(desc.set)) {
            dispatch = function (message) {
                if (isDefined(message.id)) {
                    msock.sendMessage({
                        id: message.id,
                        error: {
                            code: -32602,
                            message: 'Invalid params',
                            data: 'Unsettable state'
                        }
                    });
                }
            };
        } else {
            var isAsync = desc.set.length == 2;
            if (!isAsync) {
                dispatch = function (message) {
                    var value = message.params.value
                    var resp;
                    try {
                        var newValue;
                        var dontNotify;
                        var res = desc.set(value);
                        if (res) {
                            if (isDefined(res.value)) {
                                newValue = res.value
                            } else {
                                newValue = value;
                            }
                            dontNotify = res.dontNotify;
                        } else {
                            newValue = value;
                        }
                        desc.value = newValue;
                        dontNotify = dontNotify || false;
                        if (isDefined(message.id)) {
                            msock.sendMessage({
                                id: message.id,
                                result: true
                            });
                        }
                        if (!dontNotify) {
                            msock.sendMessage({
                                method: 'change',
                                params: {
                                    path: path,
                                    value: newValue
                                }
                            });
                        }
                    } catch (e) {
                        if (isDefined(message.id)) {
                            msock.sendMessage({
                                id: message.id,
                                error: errorObject(e)
                            });
                        }
                    }
                };
            } else {
                dispatch = function (message) {
                    var value = message.params.value;
                    var reply = function (result) {};
                    if (isDefined(message.id)) {
                        reply = function (result) {
                            var dontNotify;
                            var newValue;
                            var response = {
                                id: message.id
                            };
                            if (result === undefined) {
                                dontNotify = false;
                                newValue = value;
                                response.result = true;
                                msock.sendMessage(response);
                            } else {
                                if (!isDefined(result.error)) {
                                    response.result = true;
                                    msock.sendMessage(response);
                                } else {
                                    response.error = errorObject(result.error);
                                    msock.sendMessage(response);
                                    return;
                                }
                                dontNotify = result.dontNotify || false;
                                if (isDefined(result.value)) {
                                    newValue = result.value;
                                } else {
                                    newValue = value;
                                }
                            }
                            desc.value = newValue;
                            if (!dontNotify) {
                                msock.sendMessage({
                                    method: 'change',
                                    params: {
                                        path: path,
                                        value: newValue
                                    }
                                });
                            }
                        };
                    }
                    try {
                        desc.set(value, reply);
                    } catch (e) {
                        if (isDefined(message.id)) {
                            msock.sendMessage({
                                id: message.id,
                                error: errorObject(e)
                            });
                        }
                    }
                };
            }
        }
        ref = add(desc, dispatch, callback);
        ref.value = function (value) {
            if (value !== null && value !== undefined) {

            }
        };
        return ref;
    };
    return self;
};

util.inherits(Peer, events.EventEmitter);

module.exports = Peer;
