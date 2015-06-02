var expect = require('chai').expect;
var errors = require('../lib/jet/errors');

describe('The jet.errors module', function () {
	describe('DaemonError', function () {

		var err = new errors.DaemonError('bla');

		it('is instance of Error', function () {
			expect(err).to.be.an.instanceof(Error);
		});

		it('is instance of errors.JetError', function () {
			expect(err).to.be.an.instanceof(errors.JetError);
		});

		it('.name is jet.DaemonError', function () {
			expect(err.name).to.be.equal('jet.DaemonError');
		});

		it('.message is correct', function () {
			expect(err.message).to.be.equal('bla');
		});

		it('.stack begins correct', function () {
			expect(err.stack.match(/^jet.DaemonError: bla/)).not.to.equal(null);
		});

		it('.url begins with http', function () {
			expect(err.url.match(/^http/)).not.to.equal(null);
		});

	});
});