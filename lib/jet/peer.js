
var net = require('net');
var util = require('util');
var events = require('events');
var events = require('events');

exports = module.exports = Peer;

function MessageSocket(port,ip) {
    var last = new Buffer(0);
    var len = -1;
    this.on('data',function(buf) {
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
                this.emit('message',msg);
                bigBuf = bigBuf.slice(len);
                len = -1;
            }
        }
    }
    this.header = new Buffer(4);
};

util.inherits(MessageSocket,net.Socket);

MessageSocket.prototype.sendMessage = function(msg) {
    var json = JSON.stringify(msg);
    this.header.writeUInt32BE(json.length);
    this.write(this.header);
    this.write(json);
};

function Peer (config) {
    config = config || {};
    config.port = config.port || 33326;
    var len = -1;
    this._config = config;
    this._requestDispatchers = {};
    this._responseDispatchers = {};
    this._socket = new MessageSocket();
    this._socket.setNoDelay(true);
    this._socket.setKeepAlive(true);
    this._socket.on('message',function(msg) {
        this.emit('message',msg);
    });
    this._socket.connect(config.port,config.ip);
};

util.inherits(Peer,events.EventEmitter);



