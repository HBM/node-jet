var vows = require('vows');
var assert = require('assert');
var net = require('net');
var MessageSocket = require('../lib/jet/message-socket.js').MessageSocket;

var echoPort = 1337;
var testMessage = {
    a: 123,
    b: true
};

var echoServer = net.createServer(function (socket) {
  socket.pipe(socket);
}).listen(echoPort);

vows.describe('The Message Socket internal class').addBatch({
    'A MessageSocket': {
        topic: new MessageSocket(echoPort),
        on: {
            'connect': {       
                'results in a MessageSocket': function (ms) {
                    assert.instanceOf(ms, MessageSocket);
                },           
                'provides sendMessage': function (ms) {
                    assert.isFunction(ms.sendMessage);
                },
                'when sending a message to echo server': {
                    topic: function(ms) {
                        ms.sendMessage(testMessage);
                        return ms;
                    },
                    on: {
                        'message': {
                            'results in echoed message': function(echoed) {
                                assert.deepEqual(testMessage,echoed);
                            }
                        }
                    }
                }
            }
        }
    }
}).export(module);
