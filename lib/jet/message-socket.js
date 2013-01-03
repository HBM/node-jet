
var net = require('net');
var util = require('util');
var events = require('events');

var MessageSocket = function(port,ip) {
    var last = new Buffer(0);
    var len = -1;
    var socket = new net.connect(port,ip);   
    var self = this;
    socket.on('data',function(buf) {
        var bigBuf = Buffer.concat([last,buf]);
        while (true) {
            if (len < 0) {
                if (bigBuf.length < 4) {
                    last = bigBuf;
                    return;
                }
                len = bigBuf.readUInt32BE(0);
                bigBuf = bigBuf.slice(4);
            }        
            if (len > 0) {                
                if (bigBuf.length < len) {
                    last = bigBuf;
                    return;
                }
                var msg = JSON.parse(bigBuf.toString(null,0,len));
                self.emit('message',msg);
                bigBuf = bigBuf.slice(len);
                len = -1;
            }
        }
    });              
    socket.setNoDelay(true);
    socket.setKeepAlive(true);
    socket.on('connect',function () {
        self.emit('connect',self);
    });
    this._socket = socket;
};

util.inherits(MessageSocket,events.EventEmitter);

MessageSocket.prototype.sendMessage = function(msg) {
    var header = new Buffer(4);
    var json = JSON.stringify(msg);
    header.writeUInt32BE(json.length,0);
    this._socket.write(header);
    this._socket.write(json);
};

exports.MessageSocket = MessageSocket;
