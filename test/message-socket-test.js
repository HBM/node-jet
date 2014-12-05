var net = require('net');
var expect = require('chai').expect;
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;

var echoPort = 1337;
var testMessageA = {
    a: 123,
    b: true
};
var testMessageB = 71117;

before(function () {
    var echoServer = net.createServer(function (socket) {
        socket.pipe(socket);
    });
    echoServer.listen(echoPort);
});

describe('A MessageSocket', function () {
    var ms;
    before(function (done) {
        var socket = net.connect(echoPort);
        socket.on('connect', function () {
            ms = new MessageSocket(socket);
            done();
        });
    });
    it('should provide the essential interface', function () {
        expect(ms).to.be.an.instanceof(MessageSocket);
        expect(ms).to.be.an.instanceof(EventEmitter);
        expect(ms.sendMessage).to.be.a('function');
    });
    describe('sending to the echo server', function () {
        describe('a single message', function () {
            it('should emit "messages" array of length 1', function (done) {
                ms.once('messages', function (messages) {
                    expect(messages).to.be.an.instanceof(Array);
                    expect(messages).be.have.length.of(1);
                    expect(messages[0]).to.deep.equal(testMessageA);
                    done();
                });
                ms.sendMessage(testMessageA);
            });
            it('should emit "sent" with the unmodified message', function (done) {
                ms.once('sent', function (message) {
                    expect(message).to.deep.equal(testMessageA);
                    done();
                });
                ms.sendMessage(testMessageA);
            });
        });
        var checkMessagesArray = function (messages) {
            expect(messages).to.be.an.instanceof(Array);
            expect(messages).to.have.length.of(2);
            expect(messages[0]).to.deep.equal(testMessageA);
            expect(messages[1]).to.deep.equal(testMessageB);
        };
        describe('two messages at once', function () {
            var sendTwoMessagesAtOnce = function () {
                ms.sendMessage(testMessageA);
                ms.sendMessage(testMessageB);
            };
            it('should emit "messages" array of length 2', function (done) {
                ms.once('messages', function (messages) {
                    checkMessagesArray(messages);
                    done();
                });
                sendTwoMessagesAtOnce();
            });
            it('should emit "sent" with the unmodified messages', function (done) {
                var count = 0;
                var checkSentMessages = function (message) {
                    if (count === 0) {
                        expect(message).to.deep.equal(testMessageA);
                    } else if (count == 1) {
                        expect(message).to.deep.equal(testMessageB);
                        ms.removeListener('_sent', checkSentMessages);
                        done();
                    }
                    ++count;
                };
                ms.on('sent', checkSentMessages);
                sendTwoMessagesAtOnce();
            });
        });
    });
})
