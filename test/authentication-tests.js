/* global describe it before afterEach beforeEach after */
var expect = require('chai').expect
var jet = require('../lib/jet')
var WebSocket = require('ws')

var testWsPort = 3333

var daemon

var users = {}

users['John Doe'] = {
  password: '12345',
  auth: {
    fetchGroups: ['public'],
    setGroups: ['public'],
    callGroups: ['public']
  }
}

users.Linus = {
  password: '12345',
  auth: {
    fetchGroups: ['admin'],
    setGroups: ['admin'],
    callGroups: ['admin']
  }
}

users.Horst = {
  password: '12345',
  auth: {
    fetchGroups: ['horsties'],
    setGroups: ['public'],
    callGroups: ['public']
  }
}

before(function () {
  daemon = new jet.Daemon({
    users: users
  })
  daemon.listen({
    wsPort: testWsPort
  })
})

describe('Jet authentication', function () {
  var url = 'ws://localhost:' + testWsPort

  it('can authenticate with a valid user/password', function (done) {
    var peer = new jet.Peer({
      url: url,
      user: 'John Doe',
      password: '12345'
    })

    peer.connect().then(function () {
      expect(peer.access).to.deep.equal(users['John Doe'].auth)
      peer.close()
      done()
    })
  })

  it('cannot authenticate with a valid user and invalid password', function (done) {
    var peer = new jet.Peer({
      url: url,
      user: 'John Doe',
      password: 'wrongpass'
    })

    peer.connect().catch(function (err) {
      expect(err).is.instanceof(jet.InvalidPassword)
      peer.close()
      done()
    })
  })

  it('cannot authenticate with a invalid user and invalid password', function (done) {
    var peer = new jet.Peer({
      url: url,
      user: 'foo',
      password: 'wrongpass'
    })

    peer.connect().catch(function (err) {
      expect(err).is.instanceof(jet.InvalidUser)
      peer.close()
      done()
    })
  })
})

describe('access tests', function () {
  var provider, consumer
  var everyoneState, pubApiState, pubAdminState
  var url = 'ws://localhost:' + testWsPort

  beforeEach(function (done) {
    provider = new jet.Peer({
      url: url
    })

    everyoneState = new jet.State('everyone', 333, {
      setGroups: ['admin']
    })
    everyoneState.on('set', jet.State.acceptAny)

    pubAdminState = new jet.State('pub-admin', 123, {
      fetchGroups: ['public', 'admin'],
      setGroups: ['admin']
    })
    pubAdminState.on('set', jet.State.acceptAny)

    pubApiState = new jet.State('pub-api', 234, {
      fetchGroups: ['public', 'api']
    })

    var squareMethod = new jet.Method('square', {
      fetchGroups: [],
      callGroups: ['admin']
    })
    squareMethod.on('call', function (a) {
      return a * a
    })

    Promise.all([
      provider.connect(),
      provider.add(everyoneState),
      provider.add(pubAdminState),
      provider.add(pubApiState),
      provider.add(squareMethod)
    ]).then(function () {
      done()
    }).catch(done)
  })

  afterEach(function () {
    consumer.close()
    provider.close()
  })

  it('John Doe can fetch everyone, pub-admin and pub-api', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'John Doe',
      password: '12345'
    })

    var all = new jet.Fetcher()
    all.sortByPath().range(1, 10)
    all.on('data', function (states) {
      expect(states[0].path).to.equal('everyone')
      expect(states[1].path).to.equal('pub-admin')
      expect(states[2].path).to.equal('pub-api')
      expect(states).to.has.length(3)
      done()
    })

    consumer.connect()
    consumer.fetch(all)
  })

  it('Linus can fetch everyone and pub-admin', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })

    var all = new jet.Fetcher()
    all.sortByPath().range(1, 10)
    all.on('data', function (states) {
      expect(states[0].path).to.equal('everyone')
      expect(states[1].path).to.equal('pub-admin')
      expect(states).to.has.length(2)
      done()
    })

    consumer.connect()
    consumer.fetch(all)
  })

  it('Linus can fetch everyone and pub-admin and gets correct updates', function (done) {
    var callCount = 0
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })

    var all = new jet.Fetcher()
    all.sortByPath().range(1, 10)
    all.on('data', function (states) {
      callCount++
      expect(states[0].path).to.equal('everyone')
      expect(states[1].path).to.equal('pub-admin')
      expect(states).to.has.length(2)
      if (callCount === 3) {
        expect(states[0].value).to.equal('foo')
        expect(states[1].value).to.equal('bar')
        done()
      }
    })

    Promise.all([
      consumer.connect(),
      consumer.fetch(all)
    ]).then(function () {
      return Promise.all([
        everyoneState.value('foo'),
        pubApiState.value('foo'), // should not trigger fetch callback
        pubAdminState.value('bar')
      ])
    }).catch(function (err) {
      done(err)
    })
  })

  it('Horst can fetch everyone and not more', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Horst',
      password: '12345'
    })

    var all = new jet.Fetcher().sortByPath().range(1, 10)
    all.on('data', function (states) {
      expect(states[0].path).to.equal('everyone')
      expect(states).to.has.length(1)
      done()
    })
    consumer.fetch(all)
  })

  it('Linus can set the pub-admin state', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })

    consumer.set('pub-admin', 'master', {
      valueAsResult: true
    }).then(function (result) {
      expect(result).to.equal('master')
      done()
    }).catch(done)
  })

  it('Horst cannot set the pub-admin state', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Horst',
      password: '12345'
    })

    consumer.set('pub-admin', ['master']).catch(function (err) {
      expect(err).is.instanceof(jet.Unauthorized)
      done()
    })
  })

  it('Horst cannot set the everybody state', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Horst',
      password: '12345'
    })

    consumer.set('everyone', [532]).catch(function (err) {
      expect(err).is.instanceof(jet.Unauthorized)
      done()
    })
  })

  it('John Doe can fetch the pub-admin state which is marked fetchOnly (for him)', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'John Doe',
      password: '12345'
    })

    var fetcher = new jet.Fetcher()
      .path('equals', 'pub-admin')
      .on('data', function (data) {
        expect(data.path).to.equal('pub-admin')
        expect(data.fetchOnly).to.be.true // eslint-disable-line no-unused-expressions
        done()
      })

    consumer.fetch(fetcher)
  })

  it('Linus can fetch the pub-admin state which is NOT marked fetchOnly (for him)', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })

    var fetcher = new jet.Fetcher()
      .path('equals', 'pub-admin')
      .on('data', function (data) {
        expect(data.path).to.equal('pub-admin')
        expect(!data.fetchOnly).to.be.true // eslint-disable-line no-unused-expressions
        done()
      })

    consumer.fetch(fetcher)
  })

  it('Linus can call the square method', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })
    consumer.call('square', [2]).then(function (result) {
      expect(result).to.equal(4)
      done()
    })
  })

  it('Linus can set the everyone state', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Linus',
      password: '12345'
    })
    consumer.set('everyone', 334).then(function () {
      done()
    }).catch(function (err) {
      console.log(err)
      done()
    })
  })

  it('Horst cannot call the square method', function (done) {
    consumer = new jet.Peer({
      url: url,
      user: 'Horst',
      password: '12345'
    })

    consumer.call('square', [2]).catch(function (err) {
      expect(err).is.instanceof(jet.Unauthorized)
      done()
    })
  })
})

describe('A Daemon with specified wsGetAuthentication option', function () {
  const auth = {
    fetchGroups: [],
    setGroups: ['foo'],
    callGroups: []
  }
  var returnAuth

  var daemon
  before(function () {
    daemon = new jet.Daemon()
    daemon.listen({
      wsPort: testWsPort + 3,
      wsGetAuthentication: function (info) {
        return returnAuth
      }
    })
  })

  after(function () {
    daemon.wsServer.close()
  })

  it('attaches the returned auth object to the peer', function (done) {
    var client
    var _auth
    returnAuth = auth
    daemon.on('connection', function (peer) {
      _auth = peer.auth
    })

    client = new WebSocket('ws://localhost:' + (testWsPort + 3), 'jet')
    client.on('open', function () {
      expect(_auth).to.deep.equals(auth)
      client.close()
      done()
    })
  })

  it('refuses the connection when returning false', function (done) {
    var client
    returnAuth = false
    client = new WebSocket('ws://localhost:' + (testWsPort + 3), 'jet')
    client.on('error', function () {
      daemon.wsServer.close()
      done()
    })
  })
})

it('A Peer can send custom headers', function (done) {
  var headers
  var daemon = new jet.Daemon()
  daemon.listen({
    wsPort: testWsPort + 4,
    wsGetAuthentication: function (info) {
      headers = info.req.headers
      return {}
    }
  })

  var peer = new jet.Peer({ url: 'ws://localhost:' + (testWsPort + 4), headers: { foo: 'bar' } })
  peer.connect().then(function () {
    expect(headers.foo).to.equal('bar')
    peer.close()
    peer.closed().then(function () {
      daemon.wsServer.close()
      done()
    })
  })
})
