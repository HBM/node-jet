var jet = require('../lib/jet');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Fetch tests with daemon and peer', function() {
  var daemon;
  var peer;

  before(function(done) {
    daemon = new jet.Daemon();
    daemon.listen({
      wsPort: 4356
    });
    peer = new jet.Peer({
      url: 'ws://localhost:4356',
      onOpen: function() {
        done();
      }
    });

  });

  describe('fetch by path', function() {
    var states = [];

    afterEach(function(done) {
      var last = states.pop();
      states.forEach(function(state) {
        state.remove();
      });
      last.remove({
        success: function() {
          done()
        },
        error: function() {
          done()
        }
      });
    });

    it('startsWith', function(done) {
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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(3);
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('aXXX','add',3,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('aXXX','remove',3,fetcher)).to.be.true;
        done();
      },30);
    });

    it('startsWith case insensitive', function(done) {
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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(4);
        expect(fetchSpy.calledWith('Aa','add',2,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('aXXX','add',3,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('aXXX','remove',3,fetcher)).to.be.true;
        done();
      },30);
    });

    it('contains (implicit)', function(done) {
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
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(2);
        expect(fetchSpy.calledWith('Abcd','add',2,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        done();
      },30);
    });

    it('contains (explicit)', function(done) {
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
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(2);
        expect(fetchSpy.calledWith('Abcd','add',2,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        done();
      },30);
    });

    it('equals', function(done) {
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
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        done();
      },30);
    });

    it('equalsNot', function(done) {
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
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('Abcd','add',2,fetcher)).to.be.true;
        done();
      },30);
    });

    it('containsOneOf', function(done) {
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
          containsOneOf: ['d','a']
        }
      }, fetchSpy);
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(2);
        expect(fetchSpy.calledWith('Abcd','add',2,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('abc','add',1,fetcher)).to.be.true;
        done();
      },30);
    });

    it('containsAllOf and startsWith', function(done) {
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
          containsAllOf: ['b','c']
        }
      }, fetchSpy);
      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(2);
        expect(fetchSpy.calledWith('1Abcd','add',2,fetcher)).to.be.true;
        expect(fetchSpy.calledWith('1abc','add',1,fetcher)).to.be.true;
        done();
      },30);
    });

  });

  describe('by value', function() {
    var states = [];

    afterEach(function(done) {
      var last = states.pop();
      states.forEach(function(state) {
        state.remove();
      });
      last.remove({
        success: function() {
          done()
        },
        error: function() {
          done()
        }
      });
    });

    it('equals', function(done) {

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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('a','add',1,fetcher)).to.be.true;
        done();
      },30);

    });

    it('greaterThan', function(done) {

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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('a','add',3,fetcher)).to.be.true;
        done();
      },30);

    });

    it('lessThan', function(done) {

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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('b','add',2,fetcher)).to.be.true;
        done();
      },30);

    });

    it('isType', function(done) {

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

      setTimeout(function() {
        expect(fetchSpy.callCount).to.equal(1);
        expect(fetchSpy.calledWith('b','add','1',fetcher)).to.be.true;
        done();
      },30);

    });

  });

})
