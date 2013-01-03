var vows = require('vows');
var assert = require('assert');
var net = require('net');
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;

var echoPort = 1337;
var testMessage = {
    a: 123,
    b: true
};

var echoServer = net.createServer(function(socket) {
    socket.pipe(socket);
});
echoServer.listen(echoPort);

vows.describe('The Message Socket internal class').addBatch({
    'A MessageSocket': {
        topic: function() {
            var socket = net.connect(echoPort);
            return new MessageSocket(socket);
        },
        on: {
            'connect': {
                'results in a MessageSocket': function(ms) {
                    assert.instanceOf(ms, MessageSocket);
                },
                'provides sendMessage': function(ms) {
                    assert.isFunction(ms.sendMessage);
                },
                'when sending a message to the echo server': {
                    topic: function(ms) {
                        ms.sendMessage(testMessage);
                        return ms;
                    },
                    on: {
                        'message': {
                            'results in echoed message': function(echoed) {
                                assert.deepEqual(testMessage, echoed);
                            }
                        }
                    }
                }
            }
        }
    }
}).export(module);
