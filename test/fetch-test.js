var jet = require('../lib/jet');
var sinon = require('sinon');
var expect = require('chai').expect;

var waitTime = process.env.TRAVIS && 100 || 30;

var autoRemovedStates = function () {
	var states = [];

	afterEach(function (done) {
		var last = states.pop();
		states.forEach(function (state) {
			state.remove();
		});
		last.remove({
			success: function () {
				done();
			},
			error: function () {
				done();
			}
		});
	});
	return states;
};

describe('Fetch tests with daemon and peer', function () {
	var daemon;
	var peer;

	before(function (done) {
		daemon = new jet.Daemon();
		daemon.listen({
			wsPort: 4356
		});
		peer = new jet.Peer({
			url: 'ws://localhost:4356',
			onOpen: function () {
				done();
			}
		});

	});

	after(function () {
		peer.close();
	});

	describe('fetch by path', function () {

		var states = autoRemovedStates();

		it('startsWith', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Aa',
				value: 2
			}));

			states.push(peer.state({
				path: 'ca',
				value: 3
			}));

			var fetchSpy = sinon.spy();

			var a2 = peer.state({
				path: 'aXXX',
				value: 3
			});

			var fetcher = peer.fetch({
				path: {
					startsWith: 'a'
				}
			}, fetchSpy);

			a2.remove();

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(3);
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('aXXX', 'add', 3, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('aXXX', 'remove', 3, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('equalsOneOf', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Aa',
				value: 2
			}));

			states.push(peer.state({
				path: 'Aaa',
				value: 3
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				path: {
					equalsOneOf: ['abc', 'Aa']
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(2);
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('Aa', 'add', 2, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('startsWith case insensitive', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Aa',
				value: 2
			}));

			states.push(peer.state({
				path: 'ca',
				value: 3
			}));

			var fetchSpy = sinon.spy();
			var a2 = peer.state({
				path: 'aXXX',
				value: 3
			});

			var fetcher = peer.fetch({
				path: {
					startsWith: 'a',
					caseInsensitive: true
				}
			}, fetchSpy);

			a2.remove();

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(4);
				expect(fetchSpy.calledWith('Aa', 'add', 2, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('aXXX', 'add', 3, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('aXXX', 'remove', 3, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('contains (implicit)', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Abcd',
				value: 2
			}));

			states.push(peer.state({
				path: 'ca',
				value: 3
			}));

			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch('bc', fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(2);
				expect(fetchSpy.calledWith('Abcd', 'add', 2, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('contains (explicit)', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Abcd',
				value: 2
			}));

			states.push(peer.state({
				path: 'ca',
				value: 3
			}));

			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch({
				path: {
					contains: 'bc'
				}
			}, fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(2);
				expect(fetchSpy.calledWith('Abcd', 'add', 2, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('equals', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Abcd',
				value: 2
			}));

			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch({
				path: {
					equals: 'abc'
				}
			}, fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('equalsNot', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Abcd',
				value: 2
			}));

			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch({
				path: {
					equalsNot: 'abc'
				}
			}, fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('Abcd', 'add', 2, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('containsOneOf', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));

			states.push(peer.state({
				path: 'Abcd',
				value: 2
			}));

			states.push(peer.state({
				path: 'x',
				value: 2
			}));


			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch({
				path: {
					containsOneOf: ['d', 'a']
				}
			}, fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(2);
				expect(fetchSpy.calledWith('Abcd', 'add', 2, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('abc', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

		it('containsAllOf and startsWith', function (done) {
			states.push(peer.state({
				path: '1abc',
				value: 1
			}));

			states.push(peer.state({
				path: '1Abcd',
				value: 2
			}));

			states.push(peer.state({
				path: '1Abd',
				value: 2
			}));

			states.push(peer.state({
				path: 'x',
				value: 2
			}));


			var fetchSpy = sinon.spy();
			var fetcher = peer.fetch({
				path: {
					startsWith: '1',
					containsAllOf: ['b', 'c']
				}
			}, fetchSpy);
			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(2);
				expect(fetchSpy.calledWith('1Abcd', 'add', 2, fetcher)).to.be.true;
				expect(fetchSpy.calledWith('1abc', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);
		});

	});

	describe('by value', function () {
		var states = autoRemovedStates();

		it('equals', function (done) {

			states.push(peer.state({
				path: 'a',
				value: 1
			}));

			states.push(peer.state({
				path: 'b',
				value: '1'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				value: {
					equals: 1
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('a', 'add', 1, fetcher)).to.be.true;
				done();
			}, waitTime);

		});

		it('greaterThan', function (done) {

			states.push(peer.state({
				path: 'a',
				value: 3
			}));

			states.push(peer.state({
				path: 'b',
				value: 2
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				value: {
					greaterThan: 2
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('a', 'add', 3, fetcher)).to.be.true;
				done();
			}, waitTime);

		});

		it('lessThan', function (done) {

			states.push(peer.state({
				path: 'a',
				value: 3
			}));

			states.push(peer.state({
				path: 'b',
				value: 2
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				value: {
					lessThan: 3
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('b', 'add', 2, fetcher)).to.be.true;
				done();
			}, waitTime);

		});

		it('isType', function (done) {

			states.push(peer.state({
				path: 'a',
				value: 1
			}));

			states.push(peer.state({
				path: 'b',
				value: '1'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				value: {
					isType: 'string'
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('b', 'add', '1', fetcher)).to.be.true;
				done();
			}, waitTime);

		});


	});

	describe('by valueField', function () {
		var states = autoRemovedStates();

		it('equals', function (done) {

			states.push(peer.state({
				path: 'a',
				value: {
					age: 35,
					name: 'John',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			}));

			states.push(peer.state({
				path: 'b',
				value: {
					age: 31,
					name: 'Nick',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			}));

			states.push(peer.state({
				path: 'g',
				value: '1'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				valueField: {
					age: {
						equals: 35
					}
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('a', 'add')).to.be.true;
				done();
			}, waitTime);

		});

		it('greaterThan', function (done) {

			states.push(peer.state({
				path: 'a',
				value: {
					age: 35,
					name: 'John',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			}));

			var nick = peer.state({
				path: 'b',
				value: {
					age: 31,
					name: 'Nick',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			});

			states.push(nick);

			states.push(peer.state({
				path: 'g',
				value: '1'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				valueField: {
					age: {
						greaterThan: 31
					}
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('a', 'add')).to.be.true;
				nick.value({
					name: 'Nick',
					age: 32,
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				});
				setTimeout(function () {
					expect(fetchSpy.callCount).to.equal(2);
					expect(fetchSpy.calledWith('b', 'add')).to.be.true;
					done();

				}, waitTime);
			}, waitTime);

		});

		it('equals and lessThan', function (done) {

			states.push(peer.state({
				path: 'a',
				value: {
					age: 35,
					name: 'John',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			}));

			states.push(peer.state({
				path: 'a',
				value: {
					age: 40,
					name: 'John',
					parents: {
						mom: 'Anna',
						dad: 'Paul'
					}
				}
			}));


			states.push(peer.state({
				path: 'b',
				value: {
					age: 31,
					name: 'Nick',
					parents: {
						mom: 'Liz',
						dad: 'Paul'
					}
				}
			}));

			states.push(peer.state({
				path: 'g',
				value: '1'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				valueField: {
					age: {
						lessThan: 40
					},
					name: {
						equals: 'John'
					}
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('a', 'add')).to.be.true;
				done();
			}, waitTime);

		});

	});

	describe('sorting', function () {
		var states = autoRemovedStates();

		it('sort as empty object defaults to byPath=true,from=1,to=10', function (done) {
			var path;
			for (var i = 10; i < 30; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: i
				}));
			}

			var fetchSpy = sinon.spy();
			var fetchOK;

			var fetcher = peer.fetch({
				sort: {
					byPath: true,
					from: 1,
					to: 10
				}
			}, fetchSpy, {
				success: function () {
					fetchOK = true;
				}
			});

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 10; i < 20; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: i,
						index: i - 9
					});
				}
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 10, fetcher)).to.be.true;
				expect(fetchOK).to.be.true;
				done();
			}, waitTime * 2);

		});

		it('from / to works', function (done) {
			var path;
			for (var i = 10; i < 30; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: i
				}));
			}

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				sort: {
					byPath: true,
					from: 11,
					to: 13
				}
			}, fetchSpy);

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 20; i < 23; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: i,
						index: i - 9
					});
				}
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true;
				done();
			}, waitTime * 2);

		});

		it('n callback param indicates number of matches within from/to', function (done) {
			var path;
			for (var i = 10; i < 13; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: i
				}));
			}

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				sort: {
					byPath: true,
					from: 2,
					to: 5
				}
			}, fetchSpy);

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 11; i < 13; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: i,
						index: i - 9
					});
				}

				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 2)).to.be.true;

				// insert path between '11' and '12'
				states.push(peer.state({
					path: '112',
					value: 123
				}));

				setTimeout(function () {
					expectedChanges = [
						{
							path: '112',
							value: 123,
							index: 3
              },
						{
							path: '12',
							value: 12,
							index: 4
              }
            ];
					expect(fetchSpy.callCount).to.equal(2);
					expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true;
					done();
				}, waitTime);

			}, waitTime * 2);

		});

		it('byValue works', function (done) {
			var path;
			for (var i = 10; i < 30; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: i * i
				}));
			}

			states.push(peer.state({
				path: '50',
				value: 'asd'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				sort: {
					byValue: 'number',
					from: 11,
					to: 13
				}
			}, fetchSpy);

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 20; i < 23; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: i * i,
						index: i - 9
					});
				}
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true;
				done();
			}, 100);

		});

		it('byValueField works', function (done) {
			var path;
			for (var i = 10; i < 30; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: {
						age: i * i
					}
				}));
			}

			states.push(peer.state({
				path: '50',
				value: 'asd'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				sort: {
					byValueField: {
						age: 'number'
					},
					from: 11,
					to: 13
				}
			}, fetchSpy);

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 20; i < 23; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: {
							age: i * i
						},
						index: i - 9
					});
				}
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true;
				done();
			}, 100);

		});

		it('byValueField nested works', function (done) {
			var path;
			for (var i = 10; i < 30; ++i) {
				states.push(peer.state({
					path: i.toString(),
					value: {
						deep: {
							age: i * i
						}
					}
				}));
			}

			states.push(peer.state({
				path: '50',
				value: 'asd'
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				sort: {
					byValueField: {
						'deep.age': 'number'
					},
					from: 11,
					to: 13
				}
			}, fetchSpy);

			setTimeout(function () {
				var expectedChanges = [];
				for (var i = 20; i < 23; ++i) {
					expectedChanges.push({
						path: i.toString(),
						value: {
							deep: {
								age: i * i
							}
						},
						index: i - 9
					});
				}
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith(expectedChanges, 3)).to.be.true;
				done();
			}, 100);

		});

	});

	describe('byPath and byValue', function () {
		var states = autoRemovedStates();

		it('startsWith and lessThan', function (done) {
			states.push(peer.state({
				path: 'abc',
				value: 1
			}));
			states.push(peer.state({
				path: 'abde',
				value: 3
			}));
			states.push(peer.state({
				path: 'aca',
				value: 1
			}));

			var fetchSpy = sinon.spy();

			var fetcher = peer.fetch({
				path: {
					startsWith: 'ab'
				},
				value: {
					lessThan: 3
				}
			}, fetchSpy);

			setTimeout(function () {
				expect(fetchSpy.callCount).to.equal(1);
				expect(fetchSpy.calledWith('abc', 'add', 1)).to.be.true;
				done();
			}, waitTime);
		});
	});

});