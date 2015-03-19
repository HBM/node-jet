var expect = require('chai').expect;
var uuid = require('uuid');
var jsonrpc = require('../lib/jet/daemon/jsonrpc');
var sinon = require('sinon');

describe('The (daemon) jsonrpc module', function () {
	it('provides jsonrpc.JsonRPC ctor', function () {
		expect(jsonrpc).to.be.a('function');
	});

	describe('a JsonRPC instance ji.dispatch', function () {
		var ji;
		var services = {};
		var router = {};
		var peer = {};

		beforeEach(function () {
			services.test = sinon.spy();
			router.response = sinon.spy();
			log = sinon.spy();
			peer.sendMessage = sinon.spy();
			ji = new jsonrpc(services, router);
		});

		it('valid request known method/service gets called', function () {
			var msg = {
				id: 1,
				method: 'test'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(1);
			expect(services.test.calledWith(peer, msg)).to.be.true;
		});

		it('valid notification known method/service gets called', function () {
			var msg = {
				method: 'test'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(1);
			expect(services.test.calledWith(peer, msg)).to.be.true;
		});

		it('valid request unknown method/service gets not called', function () {
			var msg = {
				id: 1,
				method: 'xxx'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(0);
			expect(peer.sendMessage.callCount).to.equal(1);
			var errMsg = peer.sendMessage.args[0][0];
			expect(errMsg.error.code).to.equal(-32601);
			expect(errMsg.error.message).to.equal('Method not found');
		});

		it('valid notification unknown method/service gets not called', function () {
			var msg = {
				method: 'xxx'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(0);
			expect(peer.sendMessage.callCount).to.equal(0);
		});

		it('invalid request', function () {
			var msg = {
				id: 123,
				abc: 'xxx'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(0);
			expect(peer.sendMessage.callCount).to.equal(1);
			var errMsg = peer.sendMessage.args[0][0];
			expect(errMsg.error.code).to.equal(-32600);
			expect(errMsg.error.message).to.equal('Invalid Request');
		});

		it('invalid notification', function () {
			var msg = {
				abc: 'xxx'
			};
			ji.dispatch(peer, JSON.stringify(msg));
			expect(services.test.callCount).to.equal(0);
			expect(peer.sendMessage.callCount).to.equal(0);
		});

		it('parse error', function () {
			var dispatchNonJson = function () {
				ji.dispatch(peer, '{foobar');
			};
			expect(dispatchNonJson).to.throw(/Unexpected token/);
			expect(services.test.callCount).to.equal(0);
			expect(peer.sendMessage.callCount).to.equal(1);
			var errMsg = peer.sendMessage.args[0][0];
			expect(errMsg.error.code).to.equal(-32700);
			expect(errMsg.error.message).to.equal('Parse error');
		});


	});
});