/* global describe it before */
var net = require('net')
var expect = require('chai').expect
var EventEmitter = require('events').EventEmitter
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket').MessageSocket

var echoPort = 1389
var byteEchoPort = 1312
var testMessageA = 'asdddd'

before(function () {
  var echoServer = net.createServer(function (socket) {
    socket.pipe(socket)
  })
  echoServer.listen(echoPort)

  var byteEchoServer = net.createServer(function (socket) {
    socket.on('data', function (data) {
      data.toString().split('').forEach(function (char, i) {
        setTimeout(function () {
          socket.write(char)
        }, i * 3)
      })
    })
  })
  byteEchoServer.listen(byteEchoPort)
})

describe('A MessageSocket', function () {
  var ms
  before(function (done) {
    ms = new MessageSocket(echoPort)
    ms.on('open', function () {
      done()
    })
  })

  it('should provide the essential interface', function () {
    expect(ms).to.be.an.instanceof(MessageSocket)
    expect(ms).to.be.an.instanceof(EventEmitter)
    expect(ms.send).to.be.a('function')
    expect(ms.close).to.be.a('function')
  })

  describe('sending to the echo server', function () {
    describe('a single message', function () {
      it('should emit "message"', function (done) {
        ms.once('message', function (message) {
          expect(message).to.be.a('string')
          expect(message).to.equal(testMessageA)
          done()
        })
        ms.send(testMessageA)
      })

      it('can echo utf-16', function (done) {
        var utf16TestMessage = 'öäü\uD83D\uDCA9'
        ms.once('message', function (message) {
          expect(message).to.be.a('string')
          expect(message).to.equal(utf16TestMessage)
          done()
        })
        ms.send(utf16TestMessage)
      })

      it('should emit "sent" with the unmodified message', function (done) {
        ms.once('sent', function (message) {
          expect(message).to.equal(testMessageA)
          done()
        })
        ms.send(testMessageA)
      })

      it('(byte per byte) should emit "message"', function (done) {
        var ms2 = new MessageSocket(byteEchoPort)
        ms2.once('message', function (message) {
          expect(message).to.be.a('string')
          expect(message).to.equal(testMessageA)
          done()
        })
        ms2.send(testMessageA)
      })

      it('can be constructed from sock', function () {
        var sock = net.connect(echoPort)
        var ms = new MessageSocket(sock)
        expect(ms).to.be.exist // eslint-disable-line no-unused-expressions
      })
    })
  })
})
