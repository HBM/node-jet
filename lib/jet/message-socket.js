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
                    self.emit('messages',messages);
                    return;
                }
                len = bigBuf.readUInt32BE(0);
                bigBuf = bigBuf.slice(4);
            }
            if (len > 0) {
                if (bigBuf.length < len) {
                    last = bigBuf;
                    self.emit('messages',messages);
                    return;
                }
                var msg = JSON.parse(bigBuf.toString(null, 0, len));
                if (util.isArray(msg)) {
                    messages = messages.concat(msg);
                }
                else {
                    messages.push(msg);
                }
                bigBuf = bigBuf.slice(len);
                len = -1;
            }
        }
    });
    socket.setNoDelay(true);
    socket.setKeepAlive(true);
    this._socket = socket;
    this._batching = false;
    this._messageBatch = [];
};

util.inherits(MessageSocket, events.EventEmitter);

MessageSocket.prototype._sendMessage = function(msg) {
    var json = JSON.stringify(msg);
    var buf = new Buffer(4 + json.length);
    buf.writeUInt32BE(json.length, 0);
    buf.write(json, 4);
    this._socket.write(buf);
    this.emit('sent',msg,buf);
};

MessageSocket.prototype.sendMessage = function(msg) {
    if (!this._batching) {
        this._sendMessage(msg);
    } else {
        this._messageBatch.push(msg);
    }
};

MessageSocket.prototype.beginBatch = function() {
    assert.equal(this._batching,false);
    assert.equal(this._messageBatch.length,0);
    this._batching = true;
};

MessageSocket.prototype.endBatch = function() {
    assert.equal(this._batching,true);
    this._sendMessage(this._messageBatch);
    this._messageBatch = [];
    this._batching = false;
};

exports.MessageSocket = MessageSocket;
