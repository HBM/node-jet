/* global describe it beforeEach */
const expect = require('chai').expect
const Jsonrpc = require('../lib/jet/daemon/jsonrpc')
const sinon = require('sinon')

describe('The (daemon) jsonrpc module', function () {
  it('provides jsonrpc.JsonRPC ctor', function () {
    expect(Jsonrpc).to.be.a('function')
  })

  describe('a JsonRPC instance ji.dispatch', function () {
    let ji
    const services = {}
    const router = {}
    const peer = {}

    beforeEach(function () {
      services.test = sinon.spy()
      router.response = sinon.spy()
      peer.sendMessage = sinon.spy()
      ji = new Jsonrpc(services, router)
    })

    it('valid request known method/service gets called', function () {
      const msg = {
        id: 1,
        method: 'test'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(1)
      expect(services.test.calledWith(peer, msg)).to.be.true // eslint-disable-line no-unused-expressions
    })

    it('valid notification known method/service gets called', function () {
      const msg = {
        method: 'test'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(1)
      expect(services.test.calledWith(peer, msg)).to.be.true // eslint-disable-line no-unused-expressions
    })

    it('valid request unknown method/service gets not called', function () {
      const msg = {
        id: 1,
        method: 'xxx'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(0)
      expect(peer.sendMessage.callCount).to.equal(1)
      const errMsg = peer.sendMessage.args[0][0]
      expect(errMsg.error.code).to.equal(-32601)
      expect(errMsg.error.message).to.equal('Method not found')
    })

    it('valid notification unknown method/service gets not called', function () {
      const msg = {
        method: 'xxx'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(0)
      expect(peer.sendMessage.callCount).to.equal(0)
    })

    it('invalid request', function () {
      const msg = {
        id: 123,
        abc: 'xxx'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(0)
      expect(peer.sendMessage.callCount).to.equal(1)
      const errMsg = peer.sendMessage.args[0][0]
      expect(errMsg.error.code).to.equal(-32600)
      expect(errMsg.error.message).to.equal('Invalid Request')
    })

    it('invalid notification', function () {
      const msg = {
        abc: 'xxx'
      }
      ji.dispatch(peer, JSON.stringify(msg))
      expect(services.test.callCount).to.equal(0)
      expect(peer.sendMessage.callCount).to.equal(0)
    })

    it('parse error', function () {
      const dispatchNonJson = function () {
        ji.dispatch(peer, '{foobar')
      }
      expect(dispatchNonJson).to.throw(/Unexpected token/)
      expect(services.test.callCount).to.equal(0)
      expect(peer.sendMessage.callCount).to.equal(1)
      const errMsg = peer.sendMessage.args[0][0]
      expect(errMsg.error.code).to.equal(-32700)
      expect(errMsg.error.message).to.equal('Parse error')
    })
  })
})
