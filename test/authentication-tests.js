var expect = require('chai').expect;
var jet = require('../lib/jet');
var sinon = require('sinon');

var testWsPort = 3333;

var daemon;

users = {};
users['John Doe'] = {
	password: 'foo',
	auth: {
		fetchGroups: ['public'],
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
		peer.authenticate('John Doe', 'foo', {
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
		peer.authenticate('John Doex', 'foo', {
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

	describe('having some states with and without access field', function () {

	});
});