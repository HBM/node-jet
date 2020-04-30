/* global describe it before */
/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var net = require('net')
var EventEmitter = require('events').EventEmitter
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket').MessageSocket
var jet = require('../lib/jet')
var http = require('http')
var https = require('https')
var fs = require('fs')
var WebSocket = require('ws')

var commandRequestTest = function (port, command, params, checkResult) {
  describe('who sends "' + command + '" as request', function () {
    var sender
    before(function () {
      sender = new MessageSocket(port)
      sender.sendMessage = function (message) {
        sender.send(JSON.stringify(message))
      }
    })

    var id = Math.random()
    var request = {
      id: id,
      method: command,
      params: params
    }

    it('sends back the correct result', function (done) {
      sender.once('message', function (response) {
        response = JSON.parse(response)
        expect(response.id).to.equal(request.id)
        if (checkResult) {
          checkResult(response.result, response.error)
        } else {
          expect(response.result).to.be.true
          expect(response).to.not.have.property('error')
        }
        done()
      })
      sender.sendMessage(request)
    })
  })
}

var testPort = 33301

describe('A Daemon with websockets', function () {
  var daemon
  var wsPort = 11145
  before(function () {
    daemon = new jet.Daemon()
    daemon.listen({ wsPingInterval: 10, wsPort: wsPort })
  })

  it('a ws client gets pinged', function (done) {
    var client = new WebSocket('ws://localhost:' + wsPort, 'jet')
    client.on('ping', function () {
      client.close()
      done()
    })
  })

  it('a ws client which closes does not break the server', function (done) {
    var client = new WebSocket('ws://localhost:' + wsPort, 'jet')
    client.on('open', function () {
      client.close()
      setTimeout(function () {
        done()
      }, 100)
    })
  })
})

describe('A Daemon', function () {
  var daemon
  before(function () {
    daemon = new jet.Daemon()
    daemon.listen({
      tcpPort: testPort
    })
  })

  it('should be instance of EventEmitter', function (done) {
    expect(daemon).to.be.an.instanceof(EventEmitter)
    expect(daemon.listen).to.be.a('function')
    daemon.on('test', function (a, b) {
      expect(a).to.equal(1)
      done()
    })
    daemon.emit('test', 1, 2)
  })

  it('should emit "connection" for every new Peer', function (done) {
    daemon.once('connection', function (peerMs) {
      expect(peerMs).to.be.an('object')
      done()
    })
    var sock = net.connect(testPort)
    expect(sock).is.exist
  })

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(testPort, 'add', {
      path: 'test',
      value: 123
    })

    commandRequestTest(testPort, 'info', {}, function (result) {
      expect(result.name).to.equal('node-jet')
      expect(result.version).to.equal('1.5.2')
      expect(result.protocolVersion).to.equal('1.1.0')
      expect(result.features.fetch).to.equal('full')
      expect(result.features.batches).to.be.true
      expect(result.features.authentication).to.be.true
    })

    commandRequestTest(testPort, 'authenticate', {
      user: 'foo',
      password: 'bar'
    }, function (result, error) {
      expect(result).to.be.an('undefined')
      expect(error.message).to.equal('Invalid params')
      expect(error.data.invalidUser).to.be.true
    })
  })

  it('releasing a peer (with fetchers and elements) does not brake', function (done) {
    var peer = new jet.Peer({
      port: testPort
    })

    var state = new jet.State('pathdoesnotmatter', 32)
    var fetcher = new jet.Fetcher()

    Promise.all([
      peer.connect(),
      peer.fetch(fetcher),
      peer.add(state)
    ]).then(function () {
      peer.close()
    })

    peer.closed().then(function () {
      done()
    })
  })

  it('daemon emits disconnect event when peer disconnects', function (done) {
    var peer = new jet.Peer({
      port: testPort
    })
    daemon.on('disconnect', function (peerMS) {
      expect(peerMS).to.be.an('object')
      done()
    })
    peer.connect().then(function () {
      peer.close()
    })
  })

  it('timeout response is generated', function (done) {
    var peer = new jet.Peer({
      port: testPort
    })

    var tooLate = new jet.Method('alwaysTooLate')
    tooLate.on('call', function (args, reply) {
      setTimeout(function () {
        reply({
          result: 123
        })
      }, 100)
    })

    Promise.all([
      peer.connect(),
      peer.add(tooLate),
      peer.call('alwaysTooLate', [1, 2], {
        timeout: 0.001
      })
    ]).catch(function (err) {
      expect(err).is.instanceof(jet.PeerTimeout)
      done()
    })
  })

  describe('hooking to a (http) server', function () {
    var server
    var daemon

    before(function () {
      server = http.createServer(function (req, res) {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        })
        res.end('Hello World\n')
      })
      server.listen(23456)
      daemon = new jet.Daemon()
      daemon.listen({
        server: server
      })
    })

    it('http get works', function (done) {
      http.get({
        hostname: 'localhost',
        port: 23456
      }, function (res) {
        res.on('data', function (data) {
          expect(data.toString()).to.equal('Hello World\n')
          done()
        })
      })
    })

    it('peer can connect via websockets on same port', function (done) {
      var peer = new jet.Peer({
        url: 'ws://localhost:23456',
        name: 'blabla'
      })

      peer.connect().then(function () {
        peer.close()
        done()
      })
    })
  })

  describe('hooking to a (https) server', function () {
    var server
    var daemon

    before(function () {
      var options = {
        key: fs.readFileSync('test/fixtures/key.pem'),
        cert: fs.readFileSync('test/fixtures/certificate.pem')
      }
      server = https.createServer(options, function (req, res) {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        })
        res.end('Hello World\n')
      })
      server.listen(23490)
      daemon = new jet.Daemon()
      daemon.listen({
        server: server
      })
    })

    it('https get works', function (done) {
      https.get({
        hostname: 'localhost',
        port: 23490,
        rejectUnauthorized: false
      }, function (res) {
        res.on('data', function (data) {
          expect(data.toString()).to.equal('Hello World\n')
          done()
        })
      })
    })

    it('peer can connect via secure websockets (wss) on same port', function (done) {
      var peer = new jet.Peer({
        url: 'wss://localhost:23490',
        name: 'blabla',
        rejectUnauthorized: false
      })

      peer.connect().then(function () {
        peer.close()
        done()
      })
    })
  })
})

describe('A Daemon with simple fetching', function () {
  var daemon
  before(function () {
    daemon = new jet.Daemon({
      name: 'simple-jet',
      features: {
        fetch: 'simple'
      }
    })
    daemon.listen({
      tcpPort: testPort + 1
    })
  })

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(testPort + 1, 'info', {}, function (result) {
      expect(result.name).to.equal('simple-jet')
      expect(result.version).to.equal('1.5.2')
      expect(result.protocolVersion).to.equal('1.1.0')
      expect(result.features.fetch).to.equal('simple')
      expect(result.features.batches).to.be.true
      expect(result.features.authentication).to.be.true
    })
  })
})

describe('A Daemon with specified users (authentication)', function () {
  var john = {
    password: '12345',
    auth: {
      fetchGroups: [],
      setGroups: [],
      callGroups: []
    }
  }

  var daemon
  before(function () {
    daemon = new jet.Daemon({
      users: {
        john: john
      }
    })
    daemon.listen({
      tcpPort: testPort + 2
    })
  })

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(testPort + 2, 'authenticate', {
      user: 'john',
      password: '12345'
    }, function (result, error) {
      expect(error).to.be.an('undefined')
      expect(result).to.deep.equals(john.auth)
    })
  })
})
