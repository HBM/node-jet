var expect = require('chai').expect;
var uuid = require('uuid');
var EventEmitter = require('events').EventEmitter;
var jet = require('../lib/jet');
var sinon = require('sinon');

var testPort = 2314;
var testWsPort = 2315;

var daemon;

before(function () {
	daemon = new jet.Daemon({});

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
			port: testPort
		});
		peer.connect().then(function () {
			done();
		});
	});

	it('peer.close immediatly does not brake', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});
		peer.connect().catch(function (err) {
			expect(err).to.deep.equal(new Error('Jet Websocket connection is closed'));
			done();
		});
		peer.close();
	});

	it('peer.close onopen does not brake', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});
		peer.connect().then(function () {
			peer.close();
		});
		peer.closed().then(function () {
			done();
		});
	});


	it('peer.connect() is resolved and provides peer and daemonInfo as argument', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});
		peer.connect().then(function (peer) {
			var daemonInfo = peer.daemonInfo;
			expect(daemonInfo).to.be.an('object');
			expect(daemonInfo.name).to.equal('node-jet');
			expect(daemonInfo.version).to.be.a('string');
			expect(daemonInfo.protocolVersion).to.equal(2);
			expect(daemonInfo.features.fetch).to.equal('full');
			expect(daemonInfo.features.authentication).to.equal(true);
			expect(daemonInfo.features.batches).to.equal(true);
			peer.close();
			done();
		});
	});

	it('peer.closed() gets resolved', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});
		peer.connect().catch(function () {});
		peer.closed().then(function () {
			done();
		});
		peer.close();
	});

	it('can connect via WebSocket', function (done) {
		var peer = new jet.Peer({
			url: 'ws://localhost:' + testWsPort
		});
		peer.connect().then(function () {
			peer.close();
			done();
		});
	});

	describe('a connected jet peer', function () {
		var peer;

		var randomPath = function () {
			return 'jet-js/' + uuid.v1();
		};

		before(function (done) {
			peer = new jet.Peer({
				port: testPort,
			});

			peer.connect().then(function () {
				done();
			});
		});

		after(function () {
			peer.close();
		});


		it('new jet.State() returns object with correct interface', function () {
			var state = new jet.State(randomPath(), 123);
			expect(state).to.be.an('object');
			expect(state.add).to.be.a('function');
			expect(state.remove).to.be.a('function');
			expect(state.isAdded).to.be.a('function');
			expect(state.value).to.be.a('function');
			expect(state.path).to.be.a('function');
		});

		it('can add, fetch and set a state', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			var changedValue;
			state.on('set', function (newValue) {
				expect(newValue).to.equal(876);
				changedValue = newValue;
			});

			var fetcher = new jet.Fetcher();
			fetcher.path('contains', random);
			fetcher.on('data', function (data) {
				expect(data.path).to.equal(random);
				expect(data.event).to.equal('add');
				expect(data.value).to.equal(123);
				expect(!data.fetchOnly).to.equal(true);
				jet.Promise.all([
					this.unfetch(),
					peer.set(random, 876).then(function () {
						expect(changedValue).to.equal(876);
					})
					]).then(function () {
					done();
				}).catch(function (err) {
					done(err);
				});
			});

			jet.Promise.all([
			peer.add(state),
			peer.fetch(fetcher)
			]).catch(done);
		});

		it('can add and fetch and a fetchOnly state', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);

			var fetcher = new jet.Fetcher();
			fetcher.path('contains', random);
			fetcher.on('data', function (data) {
				expect(data.path).to.equal(random);
				expect(data.event).to.equal('add');
				expect(data.value).to.equal(123);
				expect(data.fetchOnly).to.equal(true);
				done();
			});

			jet.Promise.all([
			peer.add(state),
			peer.fetch(fetcher)
			]).catch(done);
		});

		it('can add a fetch-only state and setting it fails', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			peer.add(state);
			peer.set(random, 6237).catch(function (err) {
				expect(err).to.be.an.object;
				expect(err.data).to.equal(random + ' is fetch-only');
				done();
			});
		});

		it('set event handler has the state as this', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			state.on('set', function () {
				expect(this).to.be.an.instanceof(jet.State);
				done();
			});
			peer.add(state);
			peer.set(random, 6237);
		});

		it('can add a state and error propagates', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			state.on('set', function (newval) {
				if (newval > 200) {
					throw new Error('out of range');
				}
			});

			peer.add(state);

			peer.set(random, 6237).catch(function (err) {
				expect(err.message).to.equal('Internal error');
				expect(err.data.message).to.equal('out of range');
				done();
			});
		});

		it('can add a state and custom rpc error propagates', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			state.on('set', function (newval) {
				if (newval > 200) {
					throw {
						code: 1234,
						message: 'out of range'
					};
				}
			});

			peer.add(state);
			peer.set(random, 6237).catch(function (err) {
				expect(err.message).to.equal('out of range');
				expect(err.code).to.equal(1234);
				done();
			});
		});


		it('can add, fetch and set a state with async set handler', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			state.on('set', function (newval, reply) {
				setTimeout(function () {
					expect(newval).to.equal(876);
					reply();
				}, 10);
			});

			var fetcher = new jet.Fetcher().path('contains', random);
			fetcher.on('data', function (data) {
				expect(data.path).to.equal(random);
				expect(data.event).to.equal('add');
				expect(data.value).to.equal(123);
				peer.set(random, 876).then(function () {
					done();
				}).catch(function (err) {
					done(err);
				});
			});

			peer.add(state);
			peer.fetch(fetcher);
		});

		it('can add and set a state with async set handler that throws', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 123);
			state.on('set', function (newval, reply) {
				throw new Error('always fails');
			});

			peer.add(state);
			peer.set(random, 876).catch(function (err) {
				expect(err).to.be.an.object;
				expect(err).to.deep.equal({
					code: -32602,
					message: 'Internal error',
					data: {
						message: 'always fails'
					}
				});
				done();
			});
		});

		it('peer.add(state) resolves', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 'asd');
			peer.add(state).then(function () {
				done();
			});
		});

		it('can add and remove a state', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 'asd');
			jet.Promise.all([
			peer.add(state),
			peer.remove(state),
			peer.add(state)
			]).then(function () {
				expect(state.isAdded()).to.be.true;
				done();
			}).catch(function (err) {
				done(err);
			});
		});

		it('can add and remove a method', function (done) {
			var random = randomPath();
			var method = new jet.Method(random);
			method.on('call', function () {});
			jet.Promise.all([
			peer.add(method),
			peer.remove(method),
			peer.add(method)
			]).then(function () {
				expect(method.isAdded()).to.be.true;
				done();
			}).catch(function (err) {
				done(err);
			});
		});

		it('events other than "call" are not available for Method', function () {
			var method = new jet.Method('test');
			expect(function () {
				method.on('bla', function () {});
			}).to.throw();
		});

		it('events other than "set" are not available for State', function () {
			var state = new jet.State('test');
			expect(function () {
				state.on('bla', function () {});
			}).to.throw();
		});

		it('remove a state twice fails', function (done) {
			var random = randomPath();
			var removed;
			var state = new jet.State(random, 'asd');
			peer.add(state).then(function () {
				state.remove().then(function () {
					expect(state.isAdded()).to.be.false;
					removed = true;
				});
				state.remove().catch(function () {
					expect(removed).to.be.true;
					expect(state.isAdded()).to.be.false;
					done();
				});
			});
		});

		it('add a state twice fails', function (done) {
			var random = randomPath();
			var wasAdded;
			var state = new jet.State(random, 'asd');
			peer.add(state).then(function () {
				expect(state.isAdded()).to.be.true;
				state.add().catch(function (err) {
					expect(state.isAdded()).to.be.true;
					expect(err).to.deep.equal({
						code: -32602,
						message: 'Invalid params',
						data: {
							pathAlreadyExists: random
						}
					});
					done();
				});
			});
		});

		it('can add and remove and add a state again', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 'asd');
			var fetcher = new jet.Fetcher().path('equals', random);
			fetcher.on('data', function (data) {
				expect(data.value).to.equal('asd');
				done();
			});

			jet.Promise.all([
			peer.add(state),
			peer.remove(state),
			state.add(),
			peer.fetch(fetcher)
			]).catch(function (err) {
				done(err);
			});

		});

		it('can add and remove and add a state again with new value', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 'asd');
			peer.add(state);
			state.remove().then(function () {
				state.value(123);
				state.add().then(function () {
					var fetcher = new jet.Fetcher().path('equals', random);
					fetcher.on('data', function (data) {
						expect(data.value).to.equal(123);
						done();
					});
					peer.fetch(fetcher);
				});
			});
		});


		it('can add a state and post a state change', function (done) {
			var random = randomPath();
			var state = new jet.State(random, 675);
			var fetcher = new jet.Fetcher().path('contains', random);
			fetcher.on('data', function (data) {
				if (data.event === 'change') {
					expect(data.value).to.equal('foobarX');
					expect(state.value()).to.equal('foobarX');
					done();
				}
			});

			peer.fetch(fetcher);

			peer.add(state);
			setTimeout(function () {
				expect(state.value()).to.equal(675);
				state.value('foobarX');
			}, 100);
		});

		it('can batch', function (done) {
			peer.batch(function () {
				var random = randomPath();
				var state = new jet.State(random, 'asd');
				peer.add(state);
				state.remove().then(function () {
					done();
				});
			});
		});

		it('can add and call a method with array args', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args) {
				expect(this).to.be.an.instanceof(jet.Method);
				expect(args[0]).to.equal(1);
				expect(args[1]).to.equal(2);
				expect(args[2]).to.be.false;
				return args[0] + args[1];
			});

			jet.Promise.all([
			peer.add(m),
			peer.call(path, [1, 2, false]).then(function (result) {
					expect(result).to.equal(3);
					done();
				})
			]).catch(done);
		});

		it('can add and call a method with object arg', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (arg) {
				expect(this).to.be.an.instanceof(jet.Method);
				expect(arg.x).to.equal(1);
				expect(arg.y).to.equal(2);
				return arg.x + arg.y;
			});

			peer.add(m);

			peer.call(path, {
				x: 1,
				y: 2
			}).then(function (result) {
				expect(result).to.equal(3);
				done();
			});
		});

		it('can add and call a method (call impl is "safe")', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args) {
				throw new Error("argh");
			});

			peer.add(m);

			peer.call(path, [1, 2, false]).catch(function (err) {
				expect(err).to.be.an.object;
				expect(err.data.message).to.equal('argh');
				done();
			});
		});


		it('can add and call a method with async call handler and array args', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args, reply) {
				expect(args[0]).to.equal(1);
				expect(args[1]).to.equal(2);
				expect(args[2]).to.be.false;
				setTimeout(function () {
					reply({
						result: args[0] + args[1]
					});
				}, 10);
			});

			peer.add(m);

			peer.call(path, [1, 2, false]).then(function (result) {
				expect(result).to.equal(3);
				done();
			}).catch(done);
		});

		it('can add and call a method with async call handler and object args', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (arg, reply) {
				expect(arg.x).to.equal(1);
				expect(arg.y).to.equal(2);
				setTimeout(function () {
					reply({
						result: arg.x + arg.y
					});
				}, 10);
			});

			peer.add(m);

			peer.call(path, {
				x: 1,
				y: 2
			}).then(function (result) {
				expect(result).to.equal(3);
				done();
			}).catch(done);
		});


		it('can add and call a method with async call handler which fails', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args, reply) {
				expect(args[0]).to.equal(1);
				expect(args[1]).to.equal(2);
				expect(args[2]).to.be.false;
				setTimeout(function () {
					reply({
						error: 'dont-like-this'
					});
				}, 10);
			});

			peer.add(m);
			peer.call(path, [1, 2, false]).catch(function (err) {
				expect(err.code).to.equal(-32602);
				expect(err.message).to.equal('Internal error');
				expect(err.data).to.equal('dont-like-this');
				done();
			});
		});

		it('can add and call a method with async call hander and replying with nothing fails', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args, reply) {
				setTimeout(function () {
					reply();
				}, 10);
			});

			peer.add(m);
			peer.call(path, [1, 2, false]).catch(function (err) {
				expect(err.code).to.equal(-32602);
				expect(err.message).to.equal('Internal error');
				expect(err.data).to.contain('Invalid');
				done();
			});
		});

		it('callAsync is "safe"', function (done) {
			var path = randomPath();
			var m = new jet.Method(path);
			m.on('call', function (args, reply) {
				throw new Error('argh');
			});

			peer.add(m);
			peer.call(path, [1, 2, false]).catch(function (err) {
				expect(err).to.be.an.object;
				done();
			});
		});

		it('states and methods have .path()', function () {
			var spath = randomPath();
			var s = new jet.State(spath, 123);
			expect(s.path()).to.equal(spath);
			var mpath = randomPath();
			var m = new jet.Method(mpath);
			expect(m.path()).to.equal(mpath);
		});

		it('cannot add the same state twice', function (done) {
			var path = randomPath();
			var state = new jet.State(path, 123);

			peer.add(state).catch(done);

			var state2 = new jet.State(path, 222);

			peer.add(state2)
				.catch(function (err) {
					expect(err).to.be.an.object;
					expect(err.message).to.equal('Invalid params');
					expect(err.code).to.equal(-32602);
					expect(err.data.pathAlreadyExists).to.equal(path);
					done();
				});
		});

		it('can set with valueAsResult to get the "new" value', function (done) {
			var path = randomPath();
			var state = new jet.State(path, true);
			state.on('set', function (newVal) {
				return {
					value: false
				};
			});

			peer.add(state);

			peer.set(path, 123, {
				valueAsResult: true
			}).then(function (result) {
				state.remove();
				expect(result).to.be.false;
				done();
			});
		});

		it('can set with valueAsResult to get the "new" value with async set handler', function (done) {
			var path = randomPath();
			var state = new jet.State(path, true);
			state.on('set', function (newValue, reply) {
				setTimeout(function () {
					reply({
						value: false
					});
				}, 1);
			});
			peer.add(state);

			peer.set(path, 123, {
				valueAsResult: true
			}).then(function (result) {
				state.remove();
				expect(result).to.be.false;
				done();
			});
		});

		it('can fetch and unfetch', function (done) {

			var fetcher = new jet.Fetcher().path('contains', 'bla');

			expect(fetcher.isFetching()).to.be.false;
			peer.fetch(fetcher).then(function () {
				expect(fetcher.isFetching()).to.be.true;
				peer.unfetch(fetcher).then(function () {

					expect(fetcher.isFetching()).to.be.false;
					fetcher.fetch().then(function () {
						expect(fetcher.isFetching()).to.be.true;
						done();
					});
				});
			});
		});

	});
});