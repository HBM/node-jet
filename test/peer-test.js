var expect = require('chai').expect;
var uuid = require('uuid');
var jet = require('../lib/jet');

var testPort = 2314;
var testWsPort = 2315;

var daemon;

before(function () {
	daemon = new jet.Daemon();
	daemon.listen({
		tcpPort: testPort,
		wsPort: testWsPort
	});
});


describe('Jet module', function () {

	it('jet is an Object', function () {
		expect(jet).to.be.an('object')
	});

	it('jet.Peer is a Function', function () {
		expect(jet.Peer).to.be.a('function');
	});

	it('a jet peer can connect to the jet daemon', function (done) {
		var peer = new jet.Peer({
			port: testPort,
			//url: 'ws://localhost:11123',
			onOpen: function () {
				done()
			}
		});
	});

	it('peer.close immediatly does not brake', function () {
		var peer = new jet.Peer({
			port: testPort
		});
		peer.close();
	});

	it('peer.close onopen does not brake', function (done) {
		var peer = new jet.Peer({
			port: testPort,
			onOpen: function () {
				peer.close();
				done();
			}
		});
	});

	it('can connect via WebSocket', function (done) {
		var peer = new jet.Peer({
			url: 'ws://localhost:' + testWsPort,
			onOpen: function () {
				peer.close();
				done();
			}
		});
	});

	describe('a connected jet peer', function () {
		var peer;

		var randomPath = function () {
			return 'jet-js/' + uuid.v1();
		};

		before(function (done) {
			peer = new jet.Peer({
				//url: 'ws://localhost:11123',
				port: testPort,
				name: 'test-peer',
				onOpen: function () {
					done();
				}
			});
		});

		after(function () {
			peer.close();
		});


		it('can add, fetch and set a state', function (done) {
			var random = randomPath();
			var newVal;
			var state = peer.state({
				path: random,
				value: 123,
				set: function (newval) {
					newVal = newval;
					expect(newval).to.equal(876);
				}
			});
			peer.fetch(random, function (path, event, value) {
				expect(path).to.equal(random);
				expect(event).to.equal('add');
				expect(value).to.equal(123);
				peer.set(random, 876, {
					success: function () {
						expect(newVal).to.equal(876);
						done();
					}
				});
			});
		});

		it('can add a read-only state and setting it fails', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 123
			});
			peer.set(random, 6237, {
				error: function (err) {
					expect(err).to.be.an.object;
					done();
				}
			});
		});

		it('can add a state and error propagates', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 123,
				set: function (newval) {
					if (newval > 200) {
						throw new Error('out of range');
					}
				}
			});
			peer.set(random, 6237, {
				error: function (err) {
					expect(err.message).to.equal('Internal error');
					expect(err.data.message).to.equal('out of range');
					done();
				}
			});
		});

		it('can add a state and custom rpc error propagates', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 123,
				set: function (newval) {
					if (newval > 200) {
						throw {
							code: 1234,
							message: 'out of range'
						};
					}
				}
			});
			peer.set(random, 6237, {
				error: function (err) {
					expect(err.message).to.equal('out of range');
					expect(err.code).to.equal(1234);
					done();
				}
			});
		});


		it('can add, fetch and set a state with setAsync', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 123,
				setAsync: function (newval, reply) {
					setTimeout(function () {
						expect(newval).to.equal(876);
						reply();
					}, 10);
				}
			});
			peer.fetch(random, function (path, event, value) {
				expect(path).to.equal(random);
				expect(event).to.equal('add');
				expect(value).to.equal(123);
				peer.set(random, 876, {
					success: function () {
						done();
					}
				});
			});
		});

		it('can add and set a state with setAsync (setAsync is "safe")', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 123,
				setAsync: function (newval, reply) {
					throw new Error();
				}
			});
			peer.set(random, 876, {
				error: function (err) {
					expect(err).to.be.an.object;
					done();
				}
			});
		});

		it('can add a state and success callback is executed', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 'asd'
			}, {
				success: function () {
					done();
				}
			});
		});

		it('can add and remove a state', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 'asd'
			});
			state.remove({
				success: function () {
					done();
				}
			});
		});

		it('remove a state twice fails', function (done) {
			var random = randomPath();
			var removed;
			var state = peer.state({
				path: random,
				value: 'asd'
			});
			state.remove({
				success: function () {
					removed = true;
				}
			});
			state.remove({
				error: function () {
					expect(removed).to.be.true;
					expect(state.isAdded()).to.be.false;
					done();
				}
			});
		});

		it('add a state twice fails', function (done) {
			var random = randomPath();
			var wasAdded;
			var state = peer.state({
				path: random,
				value: 'asd'
			}, {
				success: function () {
					expect(state.isAdded()).to.be.true;
					wasAdded = true;
				}
			});
			state.add(undefined, {
				error: function () {
					expect(wasAdded).to.be.true;
					done();
				}
			});
		});

		it('can add and remove and add a state again', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 'asd'
			});
			state.remove();
			state.add(undefined, {
				success: function () {
					peer.fetch(random, function (path, event, value) {
						expect(value).to.equal('asd');
						done();
					});
				}
			});
		});

		it('can add and remove and add a state again with new value', function (done) {
			var random = randomPath();
			var state = peer.state({
				path: random,
				value: 'asd'
			});
			state.remove();
			state.add(123, {
				success: function () {
					peer.fetch(random, function (path, event, value) {
						expect(value).to.equal(123);
						done();
					});
				}
			});
		});


		it('can add a state and post a state change', function (done) {
			var random = randomPath();
			var state;
			peer.fetch(random, function (path, event, value) {
				if (event === 'change') {
					expect(value).to.equal('foobarX');
					expect(state.value()).to.equal('foobarX');
					done();
				}
			});
			state = peer.state({
				path: random,
				value: 675
			});
			setTimeout(function () {
				expect(state.value()).to.equal(675);
				state.value('foobarX');
			}, 100);
		});

		it('can batch', function (done) {
			peer.batch(function () {
				var random = randomPath();
				var state = peer.state({
					path: random,
					value: 'asd'
				});
				state.remove({
					success: function () {
						done();
					}
				});
			});
		});

		it('can add and call a method', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				call: function (arg1, arg2, arg3) {
					expect(arg1).to.equal(1);
					expect(arg2).to.equal(2);
					expect(arg3).to.be.false;
					return arg1 + arg2;
				}
			});

			peer.call(path, [1, 2, false], {
				success: function (result) {
					expect(result).to.equal(3);
					done();
				}
			});
		});

		it('can add and call a method (call impl is "safe")', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				call: function (arg1, arg2, arg3) {
					throw new Error("argh");
				}
			});

			peer.call(path, [1, 2, false], {
				error: function (err) {
					expect(err).to.be.an.object;
					expect(err.data.message).to.equal('argh');
					done();
				}
			});
		});


		it('can add and call a method with callAsync', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				callAsync: function (arg1, arg2, arg3, reply) {
					expect(arg1).to.equal(1);
					expect(arg2).to.equal(2);
					expect(arg3).to.be.false;
					setTimeout(function () {
						reply({
							result: arg1 + arg2
						});
					}, 10);
				}
			});

			peer.call(path, [1, 2, false], {
				success: function (result) {
					expect(result).to.equal(3);
					done();
				}
			});
		});

		it('can add and call a method with callAsync which fails', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				callAsync: function (arg1, arg2, arg3, reply) {
					expect(arg1).to.equal(1);
					expect(arg2).to.equal(2);
					expect(arg3).to.be.false;
					setTimeout(function () {
						reply({
							error: 'dont-like-this'
						});
					}, 10);
				}
			});

			peer.call(path, [1, 2, false], {
				error: function (err) {
					expect(err.code).to.equal(-32602);
					expect(err.message).to.equal('Internal error');
					expect(err.data).to.equal('dont-like-this');
					done();
				}
			});
		});

		it('can add and call a method with callAsync and replying with invalid nothing fails', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				callAsync: function (arg1, arg2, arg3, reply) {
					expect(arg1).to.equal(1);
					expect(arg2).to.equal(2);
					expect(arg3).to.be.false;
					setTimeout(function () {
						reply();
					}, 10);
				}
			});

			peer.call(path, [1, 2, false], {
				error: function (err) {
					expect(err.code).to.equal(-32602);
					expect(err.message).to.equal('Internal error');
					expect(err.data).to.contain('Invalid');
					done();
				}
			});
		});

		it('callAsync is "safe"', function (done) {
			var path = randomPath();
			var m = peer.method({
				path: path,
				callAsync: function (arg1, arg2, arg3, reply) {
					throw new Error('argh');
				}
			});

			peer.call(path, [1, 2, false], {
				error: function (err) {
					expect(err).to.be.an.object;
					done();
				}
			});
		});

		it('states and methods have .path()', function () {
			var spath = randomPath();
			var s = peer.state({
				path: spath,
				value: 123
			});
			expect(s.path()).to.equal(spath);
			var mpath = randomPath();
			var m = peer.method({
				path: mpath,
				call: function () {}
			});
			expect(m.path()).to.equal(mpath);
		});

		it('cannot add the same state twice', function (done) {
			var path = randomPath();
			peer.state({
				path: path,
				value: 123
			});
			peer.state({
				path: path,
				value: 222
			}, {
				error: function (err) {
					expect(err).to.be.an.object;
					expect(err.message).to.equal('Invalid params');
					expect(err.code).to.equal(-32602);
					expect(err.data.pathAlreadyExists).to.equal(path);
					done();
				}
			});
		});

		it('can fetch and unfetch', function (done) {
			var setupOK;
			var fetcher = peer.fetch('bla', function () {}, {
				success: function () {
					setupOK = true;
					expect(fetcher.isFetching()).to.be.true;
				}
			});
			fetcher.unfetch({
				success: function () {
					expect(setupOK).to.be.true;
					expect(fetcher.isFetching()).to.be.false;
					fetcher.fetch({
						success: function () {
							expect(fetcher.isFetching()).to.be.true;
							done();
						}
					});
				}
			});
		});

	});
});