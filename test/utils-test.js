/* global describe it */
var utils = require('../lib/jet/utils')
var expect = require('chai').expect
var sinon = require('sinon')

describe('The utils module', function () {
  it('utils.eachKeyValue', function () {
    var x = {
      a: 1,
      b: 3,
      c: 2223
    }
    var eachX = utils.eachKeyValue(x)
    var spy = sinon.spy()
    eachX(spy)

    expect(spy.callCount).to.equal(3)
    expect(spy.args[0]).to.deep.equal(['a', 1])
    expect(spy.args[1]).to.deep.equal(['b', 3])
    expect(spy.args[2]).to.deep.equal(['c', 2223])
  })
})
