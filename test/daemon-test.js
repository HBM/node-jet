var expect = require('chai').expect;
var uuid = require('uuid');
var net = require('net');
var EventEmitter = require('events').EventEmitter;
/* this is a private module, so load directly */
var MessageSocket = require('../lib/jet/message-socket').MessageSocket;
var jet = require('../lib/jet');
var http = require('http');

var testPort = 33301;

describe('A Daemon', function () {
	var daemon;
	before(function () {
		daemon = new jet.Daemon();
		daemon.listen({
			tcpPort: testPort
		});
	});
	it('should be instance of EventEmitter', function (done) {
		expect(daemon).to.be.an.instanceof(EventEmitter);
		expect(daemon.listen).to.be.a('function');
		daemon.on('test', function (a, b) {
			expect(a).to.equal(1);
			done();
		});
		daemon.emit('test', 1, 2);
	});
	it('should emit "connection" for every new Peer', function (done) {
		daemon.once('connection', function (peerMs) {
			expect(peerMs).to.be.an('object');
			done();
		});
		var sock = net.connect(testPort);
	});
	describe('when connected to a peer sending "handmade" message', function () {
		var sender;
		var peer;
		before(function (done) {
			sender = new MessageSocket(testPort);
			sender.sendMessage = function (message) {
				sender.send(JSON.stringify(message));
			};
			daemon.once('connection', function (peerMs) {
				peer = peerMs;
				done();
			});
		});
		var commandRequestTest = function (command, params) {
			describe('who sends "' + command + '" as request', function () {
				var id = Math.random();
				var request = {
					id: id,
					method: command,
					params: params
				};
				it('sends back a result response', function (done) {
					sender.once('message', function (response) {
						response = JSON.parse(response);
						expect(response.id).to.equal(request.id);
						expect(response.result).to.be.true;
						expect(response).to.not.have.property('error');
						done();
					});
					sender.sendMessage(request);
				});
			});
		};
		commandRequestTest('add', {
			path: 'test',
			value: 123
		});
		commandRequestTest('remove', {
			path: 'test',
			value: 123
		});
	});

	it('releasing a peer (with fetchers and elements) does not brake', function (done) {
		var peer = new jet.Peer({
			port: testPort,
			onClose: function () {
				done();
			}
		});

		peer.fetch('something', function () {});
		peer.state({
			path: 'pathdoesnotmatter',
			value: 32
		}, {
			success: function () {
				peer.close();
			}
		});
	});

	it('daemon emits disconnect event when peer disconnects', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});
		daemon.on('disconnect', function (peerMS) {
			expect(peerMS).to.be.an('object');
			done();
		});
		peer.close();
	});

	it('timeout response is generated', function (done) {
		var peer = new jet.Peer({
			port: testPort
		});

		peer.method({
			path: 'alwaysTooLate',
			callAsync: function (reply, arg1, arg2) {
				setTimeout(function () {
					reply({
						result: 123
					});
				}, 100);
			}
		});

		peer.call('alwaysTooLate', [1, 2], {
			timeout: 0.001,
			error: function (err) {
				expect(err.message).to.equal('Response Timeout');
				expect(err.code).to.equal(-32001);
				done();
			}
		});
	});

	describe('hooking to a (http) server', function () {
		var server;
		var daemon;

		before(function () {
			server = http.createServer(function (req, res) {
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Hello World\n');
			});
			server.listen(23456);
			daemon = new jet.Daemon();
			daemon.listen({
				server: server
			});
		});

		it('http get works', function (done) {
			http.get({
				hostname: 'localhost',
				port: 23456
			}, function (res) {
				res.on('data', function (data) {
					expect(data.toString()).to.equal('Hello World\n');
					done();
				})
			});
		});

		it('peer can connect via websockets on same port', function (done) {
			var peer = new jet.Peer({
				url: 'ws://localhost:23456',
				name: 'blabla',
				onOpen: function () {
					peer.close();
					done();
				}
			});
		});

	});

})