/* global describe it before afterEach beforeEach */
/* eslint-disable no-unused-expressions */
const expect = require('chai').expect
const uuid = require('uuid')
const jet = require('../lib/jet')

const testPort = 2314
const testWsPort = 2315

let daemon

before(function () {
  daemon = new jet.Daemon({})

  daemon.listen({
    tcpPort: testPort,
    wsPort: testWsPort
  })
})

describe('Jet module', function () {
  it('jet is an Object', function () {
    expect(jet).to.be.an('object')
  })

  it('jet.Peer is a Function', function () {
    expect(jet.Peer).to.be.a('function')
  })

  it('a jet peer can connect to the jet daemon', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    peer.connect().then(function () {
      done()
    })
  })

  it('a jet peer can connect to the jet daemon and isConnected() === true', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    expect(peer.isConnected()).to.equal(false)
    peer.connect().then(function () {
      expect(peer.isConnected()).to.equal(true)
      done()
    })
  })

  it('peer.close immediatly does not brake', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    peer.connect().catch(function (err) {
      expect(err).is.instanceof(jet.ConnectionClosed)
      done()
    })
    peer.close()
  })

  it('peer.close onopen does not brake', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    peer.connect().then(function () {
      peer.close()
    })
    peer.closed().then(function () {
      done()
    })
  })

  it('peer.connect() is resolved and provides peer and daemonInfo as argument', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    peer.connect().then(function (peer) {
      const daemonInfo = peer.daemonInfo
      expect(daemonInfo).to.be.an('object')
      expect(daemonInfo.name).to.equal('node-jet')
      expect(daemonInfo.version).to.be.a('string')
      expect(daemonInfo.protocolVersion).to.equal('1.1.0')
      expect(daemonInfo.features.fetch).to.equal('full')
      expect(daemonInfo.features.authentication).to.equal(true)
      expect(daemonInfo.features.batches).to.equal(true)
      peer.close()
      done()
    })
  })

  it('peer.closed() gets resolved', function (done) {
    const peer = new jet.Peer({
      port: testPort
    })
    peer.connect().catch(function () {})
    peer.closed().then(function () {
      done()
    })
    peer.close()
  })

  it('can connect via WebSocket', function (done) {
    const peer = new jet.Peer({
      url: 'ws://localhost:' + testWsPort
    })
    peer.connect().then(function () {
      peer.close()
      done()
    })
  })

  describe('a connected jet peer', function () {
    let peer

    const randomPath = function () {
      return 'jet-js/' + uuid.v1()
    }

    beforeEach(function (done) {
      peer = new jet.Peer({
        port: testPort
      })

      peer.connect().then(function () {
        done()
      })
    })

    afterEach(function () {
      peer.close()
    })

    it('calling set fails with NotFound error', function (done) {
      peer.set('asdlkd', 123).catch(function (err) {
        expect(err).is.instanceof(jet.NotFound)
        done()
      })
    })

    it('when closed, calling set fails with ConnectionClosed error', function (done) {
      peer.close()
      peer.set('asdlkd', 123).catch(function (err) {
        expect(err).is.instanceof(jet.ConnectionClosed)
        done()
      })
    })

    it('new jet.State() returns object with correct interface', function () {
      const state = new jet.State(randomPath(), 123)
      expect(state).to.be.an('object')
      expect(state.add).to.be.a('function')
      expect(state.remove).to.be.a('function')
      expect(state.isAdded).to.be.a('function')
      expect(state.value).to.be.a('function')
      expect(state.path).to.be.a('function')
    })

    it('new jet.State().on returns self', function () {
      const state = new jet.State(randomPath(), 123)
      expect(state.on('set', function () {})).to.equal(state)
    })

    it('new jet.Method().on returns self', function () {
      const method = new jet.Method(randomPath())
      expect(method.on('call', function () {})).to.equal(method)
    })

    it('can add and get a state', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      peer.add(state)
        .then(function () {
          return peer.get({ path: { equals: random } })
        })
        .then(function (data) {
          expect(data).to.deep.equal([
            {
              path: random,
              value: 123,
              fetchOnly: true,
              event: 'add'
            }
          ])
          done()
        })
        .catch(done)
    })

    it('can add and get sorted states', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      const random2 = randomPath()
      const state2 = new jet.State(random2, 333)
      peer.add(state)
        .then(function () {
          return peer.add(state2)
        })
        .then(function () {
          return peer.get({ sort: { byValue: 'number', descending: true } })
        })
        .then(function (data) {
          expect(data).to.deep.equal([
            {
              path: random2,
              value: 333,
              fetchOnly: true,
              index: 1
            },
            {
              path: random,
              value: 123,
              fetchOnly: true,
              index: 2
            }
          ])
          done()
        })
        .catch(done)
    })

    it('can add, fetch and set a state', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      let changedValue
      state.on('set', function (newValue) {
        expect(newValue).to.equal(876)
        changedValue = newValue
      })

      const fetcher = new jet.Fetcher()
      fetcher.path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(123)
        expect(!data.fetchOnly).to.equal(true)
        Promise.all([
          this.unfetch(),
          peer.set(random, 876).then(function () {
            expect(changedValue).to.equal(876)
          })
        ]).then(function () {
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      Promise.all([
        peer.add(state),
        peer.fetch(fetcher)
      ]).catch(done)
    })

    it('can fetch and add state', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newValue) {
        expect(newValue).to.equal(876)
      })

      const fetcher = new jet.Fetcher()
      fetcher.path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(123)
        expect(!data.fetchOnly).to.equal(true)
        done()
      })

      Promise.all([
        peer.fetch(fetcher),
        peer.add(state)
      ]).catch(done)
    })

    it('can add and fetch and a fetchOnly state', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)

      const fetcher = new jet.Fetcher()
      fetcher.path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(123)
        expect(data.fetchOnly).to.equal(true)
        done()
      })

      Promise.all([
        peer.add(state),
        peer.fetch(fetcher)
      ]).catch(done)
    })

    it('can add a fetch-only state and setting it fails', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      peer.add(state)
      peer.set(random, 6237).catch(function (err) {
        expect(err).is.instanceof(jet.FetchOnly)
        done()
      })
    })

    it('set event handler has the state as this', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function () {
        expect(this).to.be.an.instanceof(jet.State)
        done()
      })
      peer.add(state)
      peer.set(random, 6237).catch(function () {})
    })

    it('can add a state and non InvalidArgument error propagates as PeerError', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval) {
        if (newval > 200) {
          throw new Error('out of range')
        }
      })
      peer.add(state)

      peer.set(random, 6237).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        done()
      })
    })

    it('can add a state and InvalidArgument error propagates as InvalidArgument with message', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval) {
        if (newval > 200) {
          throw new jet.InvalidArgument('out of range')
        }
      })
      peer.add(state)

      peer.set(random, 6237).catch(function (err) {
        expect(err).is.instanceof(jet.InvalidArgument)
        expect(err.message).equals('out of range')
        done()
      })
    })

    it('can add a state and InvalidArgument error propagates as InvalidArgument with default message', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval) {
        if (newval > 200) {
          throw new jet.InvalidArgument()
        }
      })
      peer.add(state)

      peer.set(random, 6237).catch(function (err) {
        expect(err).is.instanceof(jet.InvalidArgument)
        expect(err.message).equals('The provided argument(s) have been refused by the State/Method')
        done()
      })
    })

    it('can add, fetch and set a state with async set handler', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval, reply) {
        setTimeout(function () {
          expect(newval).to.equal(876)
          reply()
        }, 10)
      })

      const fetcher = new jet.Fetcher().path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(123)
        this.unfetch()
        peer.set(random, 876).then(function () {
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      peer.add(state)
      peer.fetch(fetcher)
    })

    it('can add, fetch and set a boolean state from true to false', function (done) {
      const random = randomPath()
      const state = new jet.State(random, true)
      state.on('set', function (newval) {

      })

      const fetcher = new jet.Fetcher().path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(true)
        this.unfetch()
        peer.set(random, false).then(function () {
          expect(state.value()).to.equal(false)
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      peer.add(state)
      peer.fetch(fetcher)
    })

    it('can add, fetch and set a boolean state from true to false', function (done) {
      const random = randomPath()
      const state = new jet.State(random, false)
      state.on('set', function (newval) {

      })

      const fetcher = new jet.Fetcher().path('contains', random)
      fetcher.on('data', function (data) {
        expect(data.path).to.equal(random)
        expect(data.event).to.equal('add')
        expect(data.value).to.equal(false)
        this.unfetch()
        peer.set(random, true).then(function () {
          expect(state.value()).to.equal(true)
          done()
        }).catch(function (err) {
          done(err)
        })
      })

      peer.add(state)
      peer.fetch(fetcher)
    })

    it('set may throw a PeerTimeout error', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval, reply) {
        setTimeout(function () {
          reply()
        }, 10)
      })

      peer.add(state).then(function () {
        peer.set(random, 333, {
          timeout: 0.001
        }).catch(function (err) {
          expect(err).is.instanceof(jet.PeerTimeout)
          done()
        })
      })
    })

    it('can add and set a state with async set handler that throws', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 123)
      state.on('set', function (newval, reply) {
        throw new Error('always fails')
      })

      peer.add(state)
      peer.set(random, 876).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        done()
      })
    })

    it('peer.add(state) resolves', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 'asd')
      peer.add(state).then(function () {
        done()
      })
    })

    it('can add and remove a state', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 'asd')
      Promise.all([
        peer.add(state),
        peer.remove(state),
        peer.add(state)
      ]).then(function () {
        expect(state.isAdded()).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('can add and remove a method', function (done) {
      const random = randomPath()
      const method = new jet.Method(random)
      method.on('call', function () {})
      Promise.all([
        peer.add(method),
        peer.remove(method),
        peer.add(method)
      ]).then(function () {
        expect(method.isAdded()).to.be.true
        done()
      }).catch(function (err) {
        done(err)
      })
    })

    it('events other than "call" are not available for Method', function () {
      const method = new jet.Method('test')
      expect(function () {
        method.on('bla', function () {})
      }).to.throw()
    })

    it('events other than "set" are not available for State', function () {
      const state = new jet.State('test')
      expect(function () {
        state.on('bla', function () {})
      }).to.throw()
    })

    it('remove a state twice fails', function (done) {
      const random = randomPath()
      let removed
      const state = new jet.State(random, 'asd')
      peer.add(state).then(function () {
        state.remove().then(function () {
          expect(state.isAdded()).to.be.false
          removed = true
        })
        state.remove().catch(function (err) {
          expect(err).is.instanceof(jet.NotFound)
          expect(removed).to.be.true
          expect(state.isAdded()).to.be.false
          done()
        })
      })
    })

    it('add a state twice fails', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 'asd')
      peer.add(state).then(function () {
        expect(state.isAdded()).to.be.true
        state.add().catch(function (err) {
          expect(state.isAdded()).to.be.true
          expect(err).is.instanceof(jet.Occupied)
          done()
        })
      })
    })

    it('can add and remove and add a state again', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 'asd')
      const fetcher = new jet.Fetcher().path('equals', random)
      fetcher.on('data', function (data) {
        expect(data.value).to.equal('asd')
        done()
      })

      Promise.all([
        peer.add(state),
        peer.remove(state),
        state.add(),
        peer.fetch(fetcher)
      ]).catch(function (err) {
        done(err)
      })
    })

    it('can add and remove and add a state again with new value', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 'asd')
      peer.add(state)
      state.remove().then(function () {
        state.value(123)
        state.add().then(function () {
          const fetcher = new jet.Fetcher().path('equals', random)
          fetcher.on('data', function (data) {
            expect(data.value).to.equal(123)
            done()
          })
          peer.fetch(fetcher)
        })
      })
    })

    it('can add a state and post a state change', function (done) {
      const random = randomPath()
      const state = new jet.State(random, 675)
      const fetcher = new jet.Fetcher().path('contains', random)
      fetcher.on('data', function (data) {
        if (data.event === 'change') {
          expect(data.value).to.equal('foobarX')
          expect(state.value()).to.equal('foobarX')
          done()
        }
      })

      peer.fetch(fetcher)

      peer.add(state)
      setTimeout(function () {
        expect(state.value()).to.equal(675)
        state.value('foobarX')
      }, 100)
    })

    it('can batch', function (done) {
      peer.batch(function () {
        const random = randomPath()
        const state = new jet.State(random, 'asd')
        peer.add(state)
        state.remove().then(function () {
          done()
        })
      })
    })

    it('can add and call a method with array args', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args) {
        expect(this).to.be.an.instanceof(jet.Method)
        expect(args[0]).to.equal(1)
        expect(args[1]).to.equal(2)
        expect(args[2]).to.be.false
        return args[0] + args[1]
      })

      Promise.all([
        peer.add(m),
        peer.call(path, [1, 2, false]).then(function (result) {
          expect(result).to.equal(3)
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method which returns false', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return false
      })

      Promise.all([
        peer.add(m),
        peer.call(path, []).then(function (result) {
          expect(result).to.equal(false)
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method which returns 0', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return 0
      })

      Promise.all([
        peer.add(m),
        peer.call(path, []).then(function (result) {
          expect(result).to.equal(0)
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method which returns null', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return null
      })

      Promise.all([
        peer.add(m),
        peer.call(path, []).then(function (result) {
          expect(result).to.equal(null)
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method which returns 1', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return 1
      })

      Promise.all([
        peer.add(m),
        peer.call(path, []).then(function (result) {
          expect(result).to.equal(1)
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method which returns an empty Object', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return {}
      })

      Promise.all([
        peer.add(m),
        peer.call(path, []).then(function (result) {
          expect(typeof result).to.equal('object')
          expect(result.length).to.equal(undefined)
          expect(Object.keys(result).length).to.equal(0)
          done()
        })
      ]).catch(done)
    })

    it('a method call handler with no args works synchronous', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function () {
        return 'hello'
      })

      Promise.all([
        peer.add(m),
        peer.call(path, [1, 2, false]).then(function (result) {
          expect(result).to.equal('hello')
          done()
        })
      ]).catch(done)
    })

    it('can add and call a method with object arg', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (arg) {
        expect(this).to.be.an.instanceof(jet.Method)
        expect(arg.x).to.equal(1)
        expect(arg.y).to.equal(2)
        return arg.x + arg.y
      })

      peer.add(m)

      peer.call(path, {
        x: 1,
        y: 2
      }).then(function (result) {
        expect(result).to.equal(3)
        done()
      })
    })

    it('can add and call a method (call impl is "safe")', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args) {
        throw new Error('argh')
      })

      peer.add(m)

      peer.call(path, [1, 2, false]).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        done()
      })
    })

    it('can add and call a method with async call handler and array args', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args, reply) {
        expect(args[0]).to.equal(1)
        expect(args[1]).to.equal(2)
        expect(args[2]).to.be.false
        setTimeout(function () {
          reply({
            result: args[0] + args[1]
          })
        }, 10)
      })

      peer.add(m)

      peer.call(path, [1, 2, false]).then(function (result) {
        expect(result).to.equal(3)
        done()
      }).catch(done)
    })

    it('can add and call a method with async call handler and object args', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (arg, reply) {
        expect(arg.x).to.equal(1)
        expect(arg.y).to.equal(2)
        setTimeout(function () {
          reply({
            result: arg.x + arg.y
          })
        }, 10)
      })

      peer.add(m)

      peer.call(path, {
        x: 1,
        y: 2
      }).then(function (result) {
        expect(result).to.equal(3)
        done()
      }).catch(done)
    })

    it('can add and call a method with async call handler which fails', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args, reply) {
        expect(args[0]).to.equal(1)
        expect(args[1]).to.equal(2)
        expect(args[2]).to.be.false
        setTimeout(function () {
          reply({
            error: 'dont-like-this'
          })
        }, 10)
      })

      peer.add(m)
      peer.call(path, [1, 2, false]).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        expect(err.message).to.equal('dont-like-this')
        done()
      })
    })

    it('can add and call a method with async call hander and replying with nothing fails', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args, reply) {
        setTimeout(function () {
          reply()
        }, 10)
      })

      peer.add(m)
      peer.call(path, [1, 2, false]).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        done()
      })
    })

    it('callAsync is "safe"', function (done) {
      const path = randomPath()
      const m = new jet.Method(path)
      m.on('call', function (args, reply) {
        throw new Error('argh')
      })

      peer.add(m)
      peer.call(path, [1, 2, false]).catch(function (err) {
        expect(err).is.instanceof(jet.PeerError)
        expect(err.message).to.equal('argh')
        expect(err.stack).to.not.match(/no remote stack/)
        expect(err.stack).to.match(/peer-test/)
        done()
      })
    })

    it('states and methods have .path()', function () {
      const spath = randomPath()
      const s = new jet.State(spath, 123)
      expect(s.path()).to.equal(spath)
      const mpath = randomPath()
      const m = new jet.Method(mpath)
      expect(m.path()).to.equal(mpath)
    })

    it('cannot add the same state twice', function (done) {
      const path = randomPath()
      const state = new jet.State(path, 123)

      peer.add(state).catch(done)

      const state2 = new jet.State(path, 222)

      peer.add(state2)
        .catch(function (err) {
          expect(err).is.instanceof(jet.Occupied)
          done()
        })
    })

    it('can set with valueAsResult to get the "new" value', function (done) {
      const path = randomPath()
      const state = new jet.State(path, true)
      state.on('set', function (newVal) {
        return {
          value: false
        }
      })

      peer.add(state)

      peer.set(path, 123, {
        valueAsResult: true
      }).then(function (result) {
        state.remove()
        expect(result).to.be.false
        done()
      })
    })

    it('can set with valueAsResult to get the "new" value with async set handler', function (done) {
      const path = randomPath()
      const state = new jet.State(path, true)
      state.on('set', function (newValue, reply) {
        setTimeout(function () {
          reply({
            value: false
          })
        }, 1)
      })
      peer.add(state)

      peer.set(path, 123, {
        valueAsResult: true
      }).then(function (result) {
        state.remove()
        expect(result).to.be.false
        done()
      })
    })

    it('can fetch and unfetch', function (done) {
      const fetcher = new jet.Fetcher().path('contains', 'bla')

      expect(fetcher.isFetching()).to.be.false
      peer.fetch(fetcher).then(function () {
        expect(fetcher.isFetching()).to.be.true
        peer.unfetch(fetcher).then(function () {
          expect(fetcher.isFetching()).to.be.false
          fetcher.fetch().then(function () {
            expect(fetcher.isFetching()).to.be.true
            done()
          })
        })
      })
    })

    describe('error handling', function () {
      it('filter by err.name', function (done) {
        peer.set('this-path-does-not-exist', 123).catch(function (err) {
          expect(err.name).to.equal('jet.NotFound')
          done()
        })
      })

      it('filter by instanceof', function (done) {
        peer.set('this-path-does-not-exist', 123).catch(function (err) {
          expect(err instanceof Error).to.be.true
          expect(err instanceof jet.BaseError).to.be.true
          expect(err instanceof jet.NotFound).to.be.true
          expect(err instanceof jet.Unauthorized).to.be.false
          done()
        })
      })
    })
  })
})
