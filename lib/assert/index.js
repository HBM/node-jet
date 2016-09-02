var Fetcher = require('../jet').Fetcher
var assert = require('assert')

module.exports = {
  isState: function (peer, path, value, done) {
    if (!done) {
      done = value
      value = undefined
    }
    var fetcher = new Fetcher()
      .path('equals', path)
      .on('data', function (data) {
        assert.equal(data.event, 'add')
        assert.equal(data.path, path)
        if (typeof value !== 'undefined') {
          assert.deepEqual(data.value, value)
        } else {
          assert(typeof data.value !== 'undefined')
        }
        fetcher.unfetch().then(() => {
          done()
        }).catch(done)
      })
    peer.fetch(fetcher)
  },
  isMethod: function (peer, path, done) {
    var fetcher = new Fetcher()
      .path('equals', path)
      .on('data', function (data) {
        assert.equal(data.event, 'add')
        assert.equal(data.path, path)
        assert(typeof data.value === 'undefined')
        fetcher.unfetch().then(() => {
          done()
        }).catch(done)
      })
    peer.fetch(fetcher)
  }
}
