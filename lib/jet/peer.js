var net = require('net');
var util = require('util');
var events = require('events');
var MessageSocket = require('./message-socket.js').MessageSocket;

var Peer = function (config) {
    config = config || {};
    config.port = config.port || 33326;
    this._config = config;
    var requestDispatchers = {};
    var responseDispatchers = {};
    var msock = new MessageSocket(config.port,config.ip);
    msock.on('message',function(msg) {
        this.emit('message',msg);
    });
};

util.inherits(Peer,events.EventEmitter);

exports.Peer = Peer;

