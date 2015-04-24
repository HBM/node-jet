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
			expect(callbacks.error).to.be.a('function');
			callbacks.error('foo');
		});
		p.then(function (value) {}, function (err) {
			expect(err).to.equal('foo');
			done();
		});
		expect(p.isPending()).to.be.true;
	});

	it('.catch(function(err) {})', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.error).to.be.a('function');
			callbacks.error('foo');
		});
		p.catch(function (err) {
			expect(err).to.equal('foo');
			done();
		});
		expect(p.isPending()).to.be.true;
	});

	it('.then().catch()', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.error).to.be.a('function');
			expect(callbacks.success).to.be.a('function');
			callbacks.error('foo');
		});
		p.xx = 6666;
		var pref = p.then(function () {

		}).catch(function (err) {
			expect(p.xx).to.equal(6666);
			expect(err).to.equal('foo');
			done();
		});
		expect(pref.xx).to.equal(6666);
	});

	it('.then().catch()', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			expect(callbacks.error).to.be.a('function');
			expect(callbacks.success).to.be.a('function');
			callbacks.success();
		});
		p.xx = 6666;
		var pref = p.then(function () {
			expect(p.xx).to.equal(6666);
			done();
		}).catch(function (err) {

		});
		expect(pref.xx).to.equal(6666);
	});

	it('execution order is safe', function (done) {
		var cnt = 0;
		var nums = [];
		var oldSetImmediate = setImmediate;
		var setImmediateCalls = 0;
		setImmediate = function () {
			setImmediateCalls++;
			oldSetImmediate.apply(undefined, arguments);
		};
		for (var i = 0; i < 10000; ++i) {
			nums.push(i);
		}
		nums.forEach(function (i) {
			new PromisedCallback(function (callbacks) {
				expect(cnt).to.equal(i);
				++cnt;
				if (cnt === 10000) {
					expect(setImmediateCalls).to.equal(1);
					done();
				}
			})
		});
	});

	it('.isfulfilled is set to true in case of success', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			callbacks.success();
		}).then(function () {
			expect(p.isFulfilled()).to.be.true;
			done();
		});
		expect(p.isFulfilled()).to.be.false;
	});

	it('promise resolves if no .then and no .catch', function (done) {
		var p = new PromisedCallback(function (callbacks) {});
		expect(p.isFulfilled()).to.be.false;
		setTimeout(function () {
			expect(p.isFulfilled()).to.be.true;
			done();
		}, 0);
	});

	it('.finally is executed in case of success', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			callbacks.success();
		}).then(function () {}).catch(function () {}).finally(function () {
			done();
		});
	});

	it('.finally is executed in case of error', function (done) {
		var p = new PromisedCallback(function (callbacks) {
			callbacks.error();
		}).then(function () {}).catch(function () {}).finally(function () {
			done();
		});
	});

});