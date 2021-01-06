/* global describe it beforeEach */
const expect = require('chai').expect
const element = require('../lib/jet/element')

describe('The jet.element module', function () {
  let elements
  const fakePeer = {}
  let fetchers
  let fetchIterator

  beforeEach(function () {
    elements = new element.Elements(function () {})
    fetchers = []
    fetchers.push(function () {
      throw new Error('supposedly failing fetcher, THIS IS OK DURING TEST')
    })
    fetchIterator = function (element, cb) {
      fetchers.forEach(function (fetcher) {
        cb(fetcher.id, fetcher.fetch)
      })
    }
    const state = {
      path: 'asd2',
      value: 123,
      fetchOnly: true
    }
    elements.add(fetchIterator, fakePeer, state)
  })

  it('elements.add', function () {
    const state = {
      path: 'asd',
      value: 123,
      fetchOnly: true
    }
    elements.add(fetchIterator, fakePeer, state)
    const el = elements.get('asd')
    expect(el).to.be.an.instanceof(element.Element)
    expect(el.value).to.equal(123)
  })

  it('same peer can remove the element', function () {
    elements.remove('asd2', fakePeer)
    try {
      elements.get('asd2')
    } catch (err) {
      expect(err).to.deep.equal({
        code: -32602,
        message: 'Invalid params',
        data: {
          pathNotExists: 'asd2'
        }
      })
    }
  })

  it('other peer cannot remove the element', function () {
    const otherPeer = {}

    try {
      elements.remove('asd2', otherPeer)
    } catch (err) {
      expect(err).to.deep.equal({
        code: -32602,
        message: 'Invalid params',
        data: {
          foreignPath: 'asd2'
        }
      })
    }
  })

  it('same peer can change the element', function () {
    elements.change('asd2', 444, fakePeer)
    expect(elements.get('asd2').value).to.equal(444)
  })

  it('other peer cannot change the element', function () {
    const other = {}
    try {
      elements.change('asd2', 444, other)
    } catch (err) {
      expect(err).to.deep.equal({
        code: -32602,
        message: 'Invalid params',
        data: {
          foreignPath: 'asd2'
        }
      })
    }
  })
})
