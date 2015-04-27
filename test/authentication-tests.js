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
		setGroups: ['admin'],
		callGroups: ['admin']
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

		peer.connect().then(function () {
			done();
		});
	});

	it('can authenticate with a valid user/password', function (done) {
		peer.authenticate('John Doe', '12345').then(function (result) {
			expect(result).to.deep.equal(users['John Doe'].auth);
			done();
		});
	});

	it('cannot authenticate with a valid user and invalid password', function (done) {
		peer.authenticate('John Doe', 'foo2').catch(function (err) {
			expect(err.message).to.equal('Invalid params');
			expect(err.data).to.equal('invalid password');
			done();
		});
	});

	it('cannot authenticate with a invalid user and invalid password', function (done) {
		peer.authenticate('John Doex', '12345').catch(function (err) {
			expect(err.message).to.equal('Invalid params');
			expect(err.data).to.equal('invalid user');
			done();
		});
	});

});


describe('access tests', function () {
	var peer, peer2;
	var everyoneState, pubApiState, pubAdminState;

	beforeEach(function (done) {
		peer2 = new jet.Peer({
			url: 'ws://localhost:' + testWsPort
		});
		peer2.connect().then(function () {
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

		peer.connect().then(function () {

			pubAdminState = peer.state({
				path: 'pub-admin',
				value: 123,
				set: function () {},
				access: {
					fetchGroups: ['public', 'admin'],
					setGroups: ['admin']
				}
			});

			pubApiState = peer.state({
				path: 'pub-api',
				value: 234,
				access: {
					fetchGroups: ['public', 'api']
				}
			});

			everyoneState = peer.state({
				path: 'everyone',
				value: 333,
			});

			peer.method({
				path: 'square',
				call: function (a) {
					return a * a;
				},
				access: {
					fetchGroups: [],
					callGroups: ['admin']
				}
			});
		});
	});

	it('John Doe can fetch everyone, pub-admin and pub-api', function (done) {
		peer2.authenticate('John Doe', '12345');
		peer2.fetch()
			.sortByPath()
			.range(1, 10)
			.run(function (states) {
				expect(states[0].path).to.equal('everyone');
				expect(states[1].path).to.equal('pub-admin');
				expect(states[2].path).to.equal('pub-api');
				expect(states).to.has.length(3);
				done();
			});
	});

	it('Linus can fetch everyone and pub-admin', function (done) {
		peer2.authenticate('Linus', '12345');
		peer2.fetch()
			.sortByPath()
			.range(1, 10)
			.run(function (states) {
				expect(states[0].path).to.equal('everyone');
				expect(states[1].path).to.equal('pub-admin');
				expect(states).to.has.length(2);
				done();
			});
	});

	it('Linus can fetch everyone and pub-admin and gets correct updates', function (done) {
		var callCount = 0;
		peer2.authenticate('Linus', '12345');
		peer2.fetch()
			.sortByPath()
			.range(1, 10)
			.run(function (states) {
				callCount++;
				expect(states[0].path).to.equal('everyone');
				expect(states[1].path).to.equal('pub-admin');
				expect(states).to.has.length(2);
				if (callCount === 3) {
					expect(states[0].value).to.equal('foo');
					expect(states[1].value).to.equal('bar');
					done();
				}
			}).then(function () {
				everyoneState.value('foo');
				pubApiState.value('foo'); // should not trigger fetch callback
				pubAdminState.value('bar');
			});
	});

	it('Horst can fetch everyone and not more', function (done) {
		peer2.authenticate('Horst', '12345');
		peer2.fetch()
			.sortByPath()
			.range(1, 10)
			.run(function (states) {
				expect(states[0].path).to.equal('everyone');
				expect(states).to.has.length(1);
				done();
			});
	});

	it('Linus can set the pub-admin state', function (done) {
		peer2.authenticate('Linus', '12345');
		peer2.set('pub-admin', 'master').then(function (result) {
			expect(result).to.equal('master');
			done();
		});
	});

	it('Horst cannot set the pub-admin state', function (done) {
		peer2.authenticate('Horst', '12345');
		peer2.set('pub-admin', 'master').catch(function (err) {
			expect(err.data).to.equal('no access');
			done();
		});
	});

	it('Linus can call the square method', function (done) {
		peer2.authenticate('Linus', '12345');
		peer2.call('square', [2]).then(function (result) {
			expect(result).to.equal(4);
			done();
		});
	});

	it('Horst cannot call the square method', function (done) {
		peer2.authenticate('Horst', '12345');
		peer2.call('square', [2]).catch(function (err) {
			expect(err.data).to.equal('no access');
			done();
		});
	});

});