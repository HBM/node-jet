/* global describe it before */
const net = require('net')
const expect = require('chai').expect
const EventEmitter = require('events').EventEmitter
/* this is a private module, so load directly */
const MessageSocket = require('../lib/jet/message-socket').MessageSocket

const echoPort = 1389
const byteEchoPort = 1312
const testMessageA = 'asdddd'

before(function () {
  const echoServer = net.createServer(function (socket) {
    socket.pipe(socket)
  })
  echoServer.listen(echoPort)

  const byteEchoServer = net.createServer(function (socket) {
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
  let ms
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
        const utf16TestMessage = 'öäü\uD83D\uDCA9'
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
        const ms2 = new MessageSocket(byteEchoPort)
        ms2.once('message', function (message) {
          expect(message).to.be.a('string')
          expect(message).to.equal(testMessageA)
          done()
        })
        ms2.send(testMessageA)
      })

      it('can be constructed from sock', function () {
        const sock = net.connect(echoPort)
        const ms = new MessageSocket(sock)
        expect(ms).to.be.exist // eslint-disable-line no-unused-expressions
      })
    })
  })
})
