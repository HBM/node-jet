var expect = require('chai').expect;
var net = require('net');
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;
var jet = require('../lib/jet');

var testPort = 33301;

describe('A Daemon', function () {
    var daemon;
    before(function () {
        daemon = new jet.Daemon();
        daemon.listen({
            tcpPort: testPort
        });
    });
    it('should be instance of EventEmitter', function () {
        expect(daemon).to.be.an.instanceof(EventEmitter);
        expect(daemon.listen).to.be.a('function');
    });
    it('should emit "connection" for every new Peer', function (done) {
        daemon.once('connection', function (peerMs) {
            expect(peerMs).to.be.an.instanceof(MessageSocket);
            done();
        });
        var sock = net.connect(testPort);
    });
    describe('when connected to a peer', function () {
        var sender;
        var peer;
        before(function (done) {
            sender = new MessageSocket(net.connect(testPort));
            daemon.once('connection', function (peerMs) {
                peer = peerMs;
                done();
            });
        });
        var commandRequestTest = function (command, params) {
            describe('who sends"' + command + '" as request', function () {
                var id = Math.random();
                var request = {
                    id: id,
                    method: command,
                    params: params
                };
                it('sends back a result response', function (done) {
                    sender.once('messages', function (responses) {
                        expect(responses).to.have.length.of(1);
                        var response = responses[0];
                        expect(response.id).to.equal(request.id);
                        expect(response.result).to.be.true;
                        expect(response).to.not.have.property('error');
                        done();
                    });
                    sender.sendMessage(request);
                });
            });
        };
        commandRequestTest('add', {
            path: 'test',
            value: 123
        });
        commandRequestTest('remove', {
            path: 'test',
            value: 123
        });
        describe.skip('who sends "add" request', function () {
            var addRequest = {
                id: 1,
                method: 'add',
                params: {
                    path: 'test',
                    value: 123
                }
            };
            it('publishes the right notifications and sends back response', function (done) {
                var publishFinished;
                var responseFinished;
                daemon.once('publish', function (notification) {
                    expect(notification.path).to.equal(addRequest.params.path);
                    publishFinished = true;
                    if (responseFinished) {
                        done();
                    }
                });
                sender.once('messages', function (responses) {
                    responses.should.have.length(1);
                    var response = responses[0];
                    expect(response.id).to.equal(addRequest.id);
                    expect(response.result).to.be.true;
                    expect(response).to.not.have.property('error');
                    responseFinished = true;
                    if (publishFinished) {
                        done()
                    }
                });
                sender.sendMessage(addRequest);
            });
        });
    });
})
