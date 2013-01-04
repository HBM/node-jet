var should = require('should');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;
var jet = require('../lib/jet');

var testPort = 33301;

describe('A Daemon', function() {
    var daemon;
    before(function() {
        daemon = jet.createDaemon();
        daemon.listen(testPort);
    });
    it('should be instance of EventEmitter', function() {
        daemon.should.be.an.instanceof(EventEmitter);
        daemon.listen.should.be.a('function');
    });
    it('should emit "connection" for every new Peer', function(done) {
        daemon.once('connection', function(peerMs) {
            peerMs.should.be.an.instanceof(MessageSocket);
            done();
        });
        var sock = net.connect(testPort);
    });
    describe('when connected to a peer', function() {
        var sender;
        var peer;
        before(function(done) {
            sender = new MessageSocket(net.connect(testPort));
            daemon.once('connection', function(peerMs) {
                peer = peerMs;
                done();
            });
        });
        describe('who sends "add" message', function() {
            var addRequest = {
                id: 1,
                method: 'add',
                params: {
                    path: 'test',
                    element: {
                        type: 'state',
                        value: 123
                    }
                }
            };
            it('publishes the right notifications', function(done) {
                daemon.on('publish', function(notification) {
                    should.equal(notification.path, addRequest.params.path);
                    done();
                });
                sender.sendMessage(addRequest);
            });
        });
    });
})
