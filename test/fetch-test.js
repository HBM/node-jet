var jet = require('../lib/jet');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Fetch tests with daemon and peer', function() {
  var daemon;
  var peer;

  before(function() {
    daemon = new jet.Daemon();
    daemon.listen({
      wsPort: 4356
    });
    peer = new jet.Peer({
      url: 'ws://localhost:4356'
    });

  });

  describe('fetch by path', function() {
    var a,a2,b,c;
    before(function() {
      a = peer.state({
        path: 'abc',
        value: 1
      });
      b = peer.state({
        path: 'ba',
        value: 2
      });
      c = peer.state({
        path: 'ca',
        value: 3
      });
    });

    it('startsWith', function(done) {
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
      },50);
    });

  });
})
