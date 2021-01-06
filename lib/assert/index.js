const Fetcher = require('../jet').Fetcher
const assert = require('assert').strict

module.exports = {
  changesTo: function (peer, path, value, done) {
    const fetcher = new Fetcher()
      .path('equals', path)
      .on('data', function (data) {
        if (data.event !== 'change') {
          return
        }
        assert.deepEqual(data.value, value)
        fetcher.unfetch().then(() => {
          done()
        }).catch(done)
      })
    peer.fetch(fetcher)
  },
  getsRemoved: function (peer, path, done) {
    const fetcher = new Fetcher()
      .path('equals', path)
      .on('data', function (data) {
        if (data.event !== 'remove') {
          return
        }
        fetcher.unfetch().then(() => {
          done()
        }).catch(done)
      })
    peer.fetch(fetcher)
  },
  isState: function (peer, path, value, done) {
    if (!done) {
      done = value
      value = undefined
    }
    const fetcher = new Fetcher()
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
    const fetcher = new Fetcher()
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
