var net = require('net');
var should = require('should');
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;

var echoPort = 1337;
var testMessageA = {
    a: 123,
    b: true
};
var testMessageB = 71117;

before(function(done) {
    var echoServer = net.createServer(function(socket) {
        socket.pipe(socket);
    });
    echoServer.listen(echoPort);
    done();
});

describe('A MessageSocket(socket)', function() {
    var ms;
    before(function(done) {
        var socket = net.connect(echoPort);
        socket.on('connect', function() {
            ms = new MessageSocket(socket);
            done();
        });
    });
    it('should provide the essential interface', function() {
        ms.should.be.an.instanceof(MessageSocket);
        ms.should.be.an.instanceof(EventEmitter);
        ms.sendMessage.should.be.a('function');
        ms.beginBatch.should.be.a('function');
        ms.endBatch.should.be.a('function');
    });
    describe('sending to the echo server', function() {
        describe('a single message', function() {
            it('should emit "messages" array of length 1', function(done) {
                ms.once('messages', function(messages) {
                    messages.should.be.an.instanceof(Array);
                    messages.should.have.length(1);
                    should.deepEqual(messages[0], testMessageA);
                    done();
                });
                ms.sendMessage(testMessageA);
            });
            it('should emit "sent" with the unmodified message', function(done) {
                ms.once('sent', function(message) {
                    should.deepEqual(message, testMessageA);
                    done();
                });
                ms.sendMessage(testMessageA);
            });
        });
        describe('two messages at once', function() {
            var sendTwoMessagesAtOnce = function() {
                ms.sendMessage(testMessageA);
                ms.sendMessage(testMessageB);
            };
            it('should emit "messages" array of length 2', function(done) {
                ms.once('messages', function(messages) {
                    messages.should.be.an.instanceof(Array);
                    messages.should.have.length(2);
                    should.deepEqual(messages[0], testMessageA);
                    should.deepEqual(messages[1], testMessageB);
                    done();
                });
                sendTwoMessagesAtOnce();
            });
            it('"sent" should emit the unmodified message', function(done) {
                var count = 0;
                var checkSentMessages = function(message) {
                    if (count === 0) {
                        message.should.equal(testMessageA);
                    }
                    else if (count == 1) {
                        message.should.equal(testMessageB);
                        ms.removeListener('_sent', checkSentMessages);
                        done();
                    }++count;
                };
                ms.on('sent', checkSentMessages);
                sendTwoMessagesAtOnce();
            });
        });
    });
})
