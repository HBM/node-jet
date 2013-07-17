var util = require('util');
var assert = require('assert');
var events = require('events');

var MessageSocket = function(socket) {
    var last = new Buffer(0);
    var len = -1;
    var self = this;
    socket.on('data', function(buf) {
        var bigBuf = Buffer.concat([last, buf]);
        var messages = [];
        while (true) {
            if (len < 0) {
                if (bigBuf.length < 4) {
                    last = bigBuf;
                    var m = messages;
                    messages = [];
                    self.emit('messages', m);
                    return;
                }
                len = bigBuf.readUInt32BE(0);
                bigBuf = bigBuf.slice(4);
            }
            if (len > 0) {
                if (bigBuf.length < len) {
                    last = bigBuf;
                    var m = messages;
                    messages = [];
                    self.emit('messages', m);
                    return;
                }
                var msg = JSON.parse(bigBuf.toString(null, 0, len));
                if (util.isArray(msg)) {
                    messages = messages.concat(msg);
                } else {
                    messages.push(msg);
                }
                bigBuf = bigBuf.slice(len);
                len = -1;
            }
        }
    });
    socket.setNoDelay(true);
    socket.setKeepAlive(true);
    socket.once('close', function() {
        self.emit('close');
    });
    socket.once('error', function() {
        self.emit('close');
    });
    this._socket = socket;
};

util.inherits(MessageSocket, events.EventEmitter);

MessageSocket.prototype.sendMessage = function(msg) {
    var json = JSON.stringify(msg);
    var buf = new Buffer(4 + json.length);
    buf.writeUInt32BE(json.length, 0);
    buf.write(json, 4);
    this._socket.write(buf);
    this.emit('sent', msg, buf);
};

MessageSocket.prototype.close = function() {
    this._socket.end();
};

exports.MessageSocket = MessageSocket;
