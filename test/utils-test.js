/* global describe it */
const utils = require('../lib/jet/utils')
const expect = require('chai').expect
const sinon = require('sinon')

describe('The utils module', function () {
  it('utils.eachKeyValue', function () {
    const x = {
      a: 1,
      b: 3,
      c: 2223
    }
    const eachX = utils.eachKeyValue(x)
    const spy = sinon.spy()
    eachX(spy)

    expect(spy.callCount).to.equal(3)
    expect(spy.args[0]).to.deep.equal(['a', 1])
    expect(spy.args[1]).to.deep.equal(['b', 3])
    expect(spy.args[2]).to.deep.equal(['c', 2223])
  })
})
