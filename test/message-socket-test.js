var net = require('net');
var expect = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;

var echoPort = 1337;
var testMessageA = 'asdddd'
var testMessageB = 'ishajw';

before(function () {
    var echoServer = net.createServer(function (socket) {
        socket.pipe(socket);
    });
    echoServer.listen(echoPort);
});

describe('A MessageSocket', function () {
    var ms;
    before(function (done) {
        ms = new MessageSocket(echoPort);
        ms.on('open', function() {
          done();
        });
    });

    it('should provide the essential interface', function () {
        expect(ms).to.be.an.instanceof(MessageSocket);
        expect(ms).to.be.an.instanceof(EventEmitter);
        expect(ms.send).to.be.a('function');
        expect(ms.close).to.be.a('function');
    });

    describe('sending to the echo server', function () {
        describe('a single message', function () {
            it('should emit "message"', function (done) {
                ms.once('message', function (message) {
                    expect(message).to.be.a('string');
                    expect(message).to.equal(testMessageA);
                    done();
                });
                ms.send(testMessageA);
            });
            it('should emit "sent" with the unmodified message', function (done) {
                ms.once('sent', function (message) {
                    expect(message).to.equal(testMessageA);
                    done();
                });
                ms.send(testMessageA);
            });
        });
    });
})
