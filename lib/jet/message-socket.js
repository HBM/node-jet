var util = require('util');
var events = require('events');
var net = require('net');

var MessageSocket = function (port, ip) {
	var last = new Buffer(0);
	var len = -1;
	var self = this;
	var socket;
	if (port instanceof net.Socket) {
		socket = port;
	} else {
		socket = net.connect(port, ip);
		socket.on('connect', function () {
			self.emit('open');
		});
	}
	socket.on('data', function (buf) {
		var bigBuf = Buffer.concat([last, buf]);
		while (true) {
			if (len < 0) {
				if (bigBuf.length < 4) {
					last = bigBuf;
					return;
				} else {
					len = bigBuf.readUInt32BE(0);
					bigBuf = bigBuf.slice(4);
				}
			}
			if (len > 0) {
				if (bigBuf.length < len) {
					last = bigBuf;
					return;
				} else {
					self.emit('message', bigBuf.toString(null, 0, len));
					bigBuf = bigBuf.slice(len);
					len = -1;
				}
			}
		}
	});
	socket.setNoDelay(true);
	socket.setKeepAlive(true);
	socket.once('close', function () {
		self.emit('close');
	});
	socket.once('error', function (e) {
		self.emit('error', e);
	});
	this._socket = socket;
};

util.inherits(MessageSocket, events.EventEmitter);

MessageSocket.prototype.send = function (msg) {
	var that = this;
	var buf = new Buffer(4 + msg.length);
	buf.writeUInt32BE(msg.length, 0);
	buf.write(msg, 4);
	process.nextTick(function () {
		that._socket.write(buf);
		that.emit('sent', msg);
	});
};

MessageSocket.prototype.close = function () {
	this._socket.end();
};

exports.MessageSocket = MessageSocket;