/* global describe it */
/* eslint-disable no-unused-expressions */
const expect = require('chai').expect
const access = require('../lib/jet/daemon/access')

describe('The jet.daemon.access module', function () {
  it('intersects(["a","b"],["b","c"]) === true', function () {
    expect(access.intersects(['a', 'b'], ['b', 'c'])).to.be.true
  })

  it('intersects(["a"],["b","c","a"]) === true', function () {
    expect(access.intersects(['a'], ['b', 'c', 'a'])).to.be.true
  })

  it('intersects(["a","b","c"],["c"]) === true', function () {
    expect(access.intersects(['a', 'b', 'c'], ['c'])).to.be.true
  })

  it('intersects(["a","b"],["c","b"]) === true', function () {
    expect(access.intersects(['a', 'b'], ['c', 'b'])).to.be.true
  })

  it('intersects(["a","b"],["e","c"]) === false', function () {
    expect(access.intersects(['a', 'b'], ['e', 'c'])).to.be.false
  })
})
