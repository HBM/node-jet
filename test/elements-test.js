var expect = require('chai').expect;
var element = require('../lib/jet/element');
var jetUtils = require('../lib/jet/utils');

describe('The jet.element module', function () {
	var elements;
	var fakePeer = {};
	var fetchers;
	var fetchIterator;

	before(function () {
		var fakePeer = {};

	});

	beforeEach(function () {
		elements = new element.Elements();
		fetchers = [];
		fetchIterator = function (element, cb) {
			fetchers.forEach(function (fetcher) {
				cb(fetcher.id, fetcher.fetch);
			});
		};
	});


	it('elements.add', function () {
		var state = {
			path: 'asd',
			value: 123,
			readOnly: true
		};
		elements.add(fetchIterator, fakePeer, state);
		expect(elements.get('asd')).to.be.an.instanceof(element.Element);
	});


});