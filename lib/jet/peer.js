var util = require('util');
var events = require('events');
var assert = require('assert');
var MessageSocket = require('./message-socket.js').MessageSocket;

var Peer = function(config) {
    config = config || {};
    config.port = config.port || 33326;
    this._config = config;
    this._requestDispatchers = {};
    this._responseDispatchers = {};
    var msock = new MessageSocket(config.port, config.ip);
    var self = this;
    var dispatchRequest = function(request) {
        var dispatcher = self._requestDispatcher[request.method];
        if (dispatcher) {
            try {
                dispatcher(message.params);
            }
            catch (err) {
                console.log(
            }
        }
    };
    var dispatchResponse = function(response) {};
    var dispatchNotification = function(notification) {};
    var dispatchMessage = function(message) {
        if (message.id) {
            if (message.method) {
                message.params = message.params || [];
                dispatchRequest(message);
                return;
            }
            else if (message.result || message.error) {
                dispatchResponse(message);
                return;
            }
            assert.fail('message not handled', message);
        }
        else if (message.method) {
            message.params = message.params || [];
            dispatchNotification(message);
            return;
        }
        assert.fail('message not handled', message);
    };
    msock.on('message', function(message) {
        /* this might be a message batch */
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
};

util.inherits(Peer, events.EventEmitter);

exports.Peer = Peer;
