var util = require('util');
var events = require('events');
var assert = require('assert');
var MessageSocket = require('./message-socket.js').MessageSocket;

var isDefined = function(x) {
    if (typeof x === 'undefined' || x === null) {
        return false;
    }
    return true;
};

var errorObject = function(err) {
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

var Peer = function(config) {
    config = config || {};
    config.port = config.port || 11122;
    config.ip = config.ip || 'localhost';
    this._config = config;
    this._requestDispatchers = {};
    this._responseDispatchers = {};
    var msock = new MessageSocket(config.port, config.ip);
    var self = this;
    var dispatchResponse = function(message) {
        var mid = message.id;
        var callback = responseDispatchers[mid];
        delete responseDispatchers[mid];
        assert(callback);
        callback(message.error,message.result);
    };
    var dispatchRequest = function(message) {
        var dispatcher = self._requestDispatcher[request.method];
        assert(dispatcher);
        try {
            dispatcher(message.params);
        }
        catch (err) {
            if (isDefined(message.id)) {
                msock.sendMessage(errorObject(err));
            }
        }
    };
    var dispatchSingleMessage = function(message) {
        if (isDefined(message.method)) {
            dispatchRequest(message);
        } else {
            dispatchResponse(message)
        }
    };
    var id;
    var service = function(method,params,complete,callback,timeout) {
        var reqId;
        var callbackBak;
        var error;
        var message = {};
        if (callback) { // make a request
            params.timeout = timeout || 5;
            id = id + 1;
            reqId = id;
            message.id = reqId;
            if (complete) {
                callbackBak = complete;
                callback = function(err,result) {
                    complete(err,result);
                    callbackBak(err,result);
                }
            }
            self._responseDispatchers[reqId] = callback;
        } else {
            if (complete) {
                complete(null,true);
            }
        }
        message.params = params;
        message.method = method;
        msock.sendMessage(message);
    };
    var add = function(desc,dispatch,callback) {
        var params = {};        
        var path = desc.path;
        var ref = {};
        var assignDispatcher = function(err,result) {
            if (!isDefined(err)) {
                self._requestDispatcher[path] = dispatch;
            }
        };
        params.path = desc.path;
        params.value = desc.value;
        service('add',params,assignDispatcher,callback);
        ref.remove = function(callback) {
            assert(ref.isAdded());
            remove(path,callback);
        };
        ref.isAdded = function() {
            return isDefined(self._requestDispatcher[desc.path]);
        };
        ref.add = function(value,callback) {
            if (value !== undefined) {
                desc.value = value;
            }
            add(desc.dispatch,callback);
        };
        ref.path = function() {
            return path;
        };
        return ref;
    };

    var remove = function(path,callback) {
        var removeDispatcher = function(err,result) {
            if (!isDefined(err)) {
                delete self._requestDispatcher[path];
            }
        };
        service('remove',{path:path},remoteDispatcher,callback);
    };
    
    msock.on('message', function(message) {
        if (util.isArray(message)) {
            var batch = message;
            batch.forEach(function(message) {
                dispatchMessage(message);
            });
        }
        else {
            dispatchMessage(message);
        }
    });
    
    msock.on('error',function(err) {
        self.emit('error',err);
    });

    self.close = function() {
        msock.close();
    };

    self.call = function(path,params,callback) {
        var params = {
            path: path,
            args: params || []
        };
        service('call',params,null,callback);
    };

    self.config = function(params,callback) {
        service('config',params,null,callback);
    };
    
    self.set = function(path,value,callback) {
        var params = {
            path: path,
            value: value
        };
        service('set',params,null,callback);
    };

    var fetchId = 0;
    
    self.fetch = function(params,onData,callback) {
        var id;
        var ref = {};
        var sorting = params.sort;
        var addFetcher;        
        fetchId = fetchId + 1;
        id = 'f' + fetchId;
        addFetcher = function() {
            self._requestDispatchers[id] = function(peer,message) {
                var params;
                if (sorting) {
                    f(params.vlaue,params.n,ref);
                } else {
                    f(param.path,params.event,params.value,ref);
                }                
            };
        };

        if (typeof params === 'string') {
            params = {
                match: [params]
            };
        }
        params.id = id;
        service('fetch',params,addFetcher,callback);
        ref.unfetch = function(callback) {
            var removeDispatcher = function() {
                delete self._requestDispatcher[id];
            };
            service('unfetch',{id:id},removeDispatcher,callback);
        };
        return ref;
    };
};

util.inherits(Peer, events.EventEmitter);

exports.Peer = Peer;
