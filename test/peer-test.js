var expect = require('chai').expect;
var jet = require('../lib/jet');

var testPort = 5243

describe('A Peer', function() {
  var peer;
  var daemon;

  before(function() {
    daemon = new jet.Daemon();
    daemon.listen({
      tcpPort: testPort
    });
    peer = new jet.Peer({
      port: testPort
    });
  });

  after(function() {
    peer.close();
    //daemon.stop();
  });

  it('is an object', function() {
    expect(peer).to.be.an('object');
  });

  it('provides .state method', function() {
    expect(peer.state).to.be.a('function');
  });

  it('can add a state (as request)', function(done) {
    var s = peer.state({
      path: 'testA',
      value: 123
    },function(err,res) {
        expect(err).to.be.an('undefined');
        expect(res).to.be.true;
        done();
        s.remove();
    });
  });

});
