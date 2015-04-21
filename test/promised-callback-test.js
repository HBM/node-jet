var expect = require('chai').expect;
var PromisedCallback = require('../lib/jet/peer/promised-callback').PromisedCallback;

describe('The jet.peer.promise-callback module', function () {

	it('inserts callback object', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks).to.deep.equal({});
			done();
		});
	});

	it('.then(function() {})', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.success).to.be.a('function');
			callbacks.success();
		});
		p.then(function () {
			expect(arguments[0]).to.be.an('undefined');
			done();
		});
		expect(p.isPending()).to.be.true;
	});

	it('.then(function(value){})', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.success).to.be.a('function');
			callbacks.success(123);
		});
		p.then(function (value) {
			expect(value).to.equal(123);
			done();
		});
		expect(p.isPending()).to.be.true;
	});

	it('.then(function(value){}, function(err) {})', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.success).to.be.a('function');
			callbacks.error('foo');
		});
		p.then(function (value) {}, function (err) {
			expect(err).to.equal('foo');
			done();
		});
		expect(p.isPending()).to.be.true;
	});

});