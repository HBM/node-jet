var expect = require('chai').expect;
var jet = require('../lib/jet');
var sinon = require('sinon');

var testWsPort = 3333;

var daemon;

var users = {};

users['John Doe'] = {
	password: '12345',
	auth: {
		fetchGroups: ['public'],
		setGroups: ['public'],
		callGroups: ['public']
	}
};

users['Linus'] = {
	password: '12345',
	auth: {
		fetchGroups: ['admin'],
		setGroups: ['public'],
		callGroups: ['public']
	}
};

users['Horst'] = {
	password: '12345',
	auth: {
		fetchGroups: ['horsties'],
		setGroups: ['public'],
		callGroups: ['public']
	}
};

before(function () {
	daemon = new jet.Daemon({
		users: users
	});
	daemon.listen({
		wsPort: testWsPort
	});
});


describe('Jet authentication', function () {
	var peer;

	beforeEach(function (done) {
		peer = new jet.Peer({
			url: 'ws://localhost:' + testWsPort
		});

		peer.on('open', function () {
			done();
		});
	});

	it('can authenticate with a valid user/password', function (done) {
		peer.authenticate('John Doe', '12345', {
			success: function (result) {
				expect(result).to.deep.equal(users['John Doe'].auth);
				done();
			},
			error: function (err) {
				expect(err).to.be.an('undefined');
			}
		});
	});

	it('cannot authenticate with a valid user and invalid password', function (done) {
		peer.authenticate('John Doe', 'foo2', {
			success: function (result) {
				expect(result).to.be.an('undefined');
				done();
			},
			error: function (err) {
				expect(err.message).to.equal('Invalid params');
				expect(err.data).to.equal('invalid password');
				done();
			}
		});
	});

	it('cannot authenticate with a invalid user and invalid password', function (done) {
		peer.authenticate('John Doex', '12345', {
			success: function (result) {
				expect(result).to.be.an('undefined');
				done();
			},
			error: function (err) {
				expect(err.message).to.equal('Invalid params');
				expect(err.data).to.equal('invalid user');
				done();
			}
		});
	});

});


describe('fetch access', function () {
	var peer, peer2;

	beforeEach(function (done) {
		peer2 = new jet.Peer({
			url: 'ws://localhost:' + testWsPort
		});
		peer2.on('open', function () {
			done();
		});
	});

	afterEach(function () {
		peer2.close();
	});

	before(function () {
		peer = new jet.Peer({
			url: 'ws://localhost:' + testWsPort
		});
		peer.state({
			path: 'pub-admin',
			value: 123,
			access: {
				fetchGroups: ['public', 'admin']
			}
		});

		peer.state({
			path: 'pub-api',
			value: 234,
			access: {
				fetchGroups: ['public', 'api']
			}
		});

		peer.state({
			path: 'everyone',
			value: 333,
		});
	});

	it('John Doe can fetch everyone, pub-admin and pub-api', function (done) {
		peer2.authenticate('John Doe', '12345');
		peer2.fetch({
			sort: {
				byPath: true,
				asArray: true,
				from: 1,
				to: 10
			}
		}, function (states) {
			expect(states[0].path).to.equal('everyone');
			expect(states[1].path).to.equal('pub-admin');
			expect(states[2].path).to.equal('pub-api');
			expect(states).to.has.length(3);
			done();
		});
	});

	it('Linus can fetch everyone and pub-admin', function (done) {
		peer2.authenticate('Linus', '12345');
		peer2.fetch({
			sort: {
				byPath: true,
				asArray: true,
				from: 1,
				to: 10
			}
		}, function (states) {
			expect(states[0].path).to.equal('everyone');
			expect(states[1].path).to.equal('pub-admin');
			expect(states).to.has.length(2);
			done();
		});
	});

	it('Horst can fetch everyone and not more', function (done) {
		peer2.authenticate('Horst', '12345');
		peer2.fetch({
			sort: {
				byPath: true,
				asArray: true,
				from: 1,
				to: 10
			}
		}, function (states) {
			expect(states[0].path).to.equal('everyone');
			expect(states).to.has.length(1);
			done();
		});
	});

});