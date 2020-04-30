/* globals describe it beforeEach */
/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var sorter = require('../lib/jet/sorter')
var sinon = require('sinon')

describe('sorter', function () {
  describe('byPath', function () {
    var inst
    var onNotify
    beforeEach(function () {
      onNotify = sinon.spy()
      inst = sorter.create({
        sort: {
          byPath: true,
          from: 1,
          to: 3
        }
      }, onNotify)
      inst.sorter({ event: 'add', value: 123, path: 'asd' }, true)
      inst.sorter({ event: 'add', path: 'zoo' }, true)
      inst.sorter({ event: 'add', value: 123, path: 'bar' }, true)
      inst.flush()
    })

    it('should init/flush correctly', function () {
      expect(onNotify.calledOnce).to.be.true
      expect(onNotify.args[0][0]).to.deep.equal({
        changes: [
          {
            path: 'asd',
            value: 123,
            index: 1
          },
          {
            path: 'bar',
            value: 123,
            index: 2
          },
          {
            path: 'zoo',
            index: 3,
            value: undefined // not neccessary
          }
        ],
        n: 3
      })
    })

    it('should update on "remove" correctly', function () {
      inst.sorter({ event: 'remove', path: 'bar' })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'zoo',
            index: 2,
            value: undefined // not neccessary
          }
        ],
        n: 2
      })
    })

    it('should ignore elements out of range', function () {
      inst.sorter({ event: 'add', path: 'zz0' })
      inst.sorter({ event: 'remove', path: 'zz0' })
      expect(onNotify.calledOnce).to.be.true
    })

    it('should update on "add" correctly', function () {
      inst.sorter({ event: 'add', path: 'aaa', value: 44 })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'aaa',
            value: 44,
            index: 1
          },
          {
            path: 'asd',
            value: 123,
            index: 2
          },
          {
            path: 'bar',
            index: 3,
            value: 123
          }
        ],
        n: 3
      })
    })

    it('should update on "change" correctly', function () {
      inst.sorter({ event: 'change', path: 'asd', value: 44 })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'asd',
            value: 44,
            index: 1
          }
        ],
        n: 3
      })
    })
  })

  describe('byValue', function () {
    var inst
    var onNotify
    beforeEach(function () {
      onNotify = sinon.spy()
      inst = sorter.create({
        sort: {
          byValue: 'number',
          from: 1,
          to: 3
        }
      }, onNotify)
      inst.sorter({ event: 'add', value: 1, path: 'asd' }, true)
      inst.sorter({ event: 'add', value: 3, path: 'zoo' }, true)
      inst.sorter({ event: 'add', value: 2, path: 'bar' }, true)
      inst.flush()
    })

    it('should init/flush correctly', function () {
      expect(onNotify.calledOnce).to.be.true
      expect(onNotify.args[0][0]).to.deep.equal({
        changes: [
          {
            path: 'asd',
            value: 1,
            index: 1
          },
          {
            path: 'bar',
            value: 2,
            index: 2
          },
          {
            path: 'zoo',
            value: 3,
            index: 3
          }
        ],
        n: 3
      })
    })

    it('should update on "remove" correctly', function () {
      inst.sorter({ event: 'remove', path: 'bar' })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'zoo',
            value: 3,
            index: 2
          }
        ],
        n: 2
      })
    })

    it('should ignore elements out of range', function () {
      inst.sorter({ event: 'add', path: 'zz0', value: 1000 })
      inst.sorter({ event: 'remove', path: 'zz0', value: 1000 })
      expect(onNotify.calledOnce).to.be.true
    })

    it('should update on "add" correctly', function () {
      inst.sorter({ event: 'add', path: 'z00', value: 0.3 })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'z00',
            value: 0.3,
            index: 1
          },
          {
            path: 'asd',
            value: 1,
            index: 2
          },
          {
            path: 'bar',
            index: 3,
            value: 2
          }
        ],
        n: 3
      })
    })

    it('should update on "change" correctly', function () {
      inst.sorter({ event: 'change', path: 'asd', value: 4 })
      expect(onNotify.calledTwice).to.be.true
      expect(onNotify.args[1][0]).to.deep.equal({
        changes: [
          {
            path: 'bar',
            value: 2,
            index: 1
          },
          {
            path: 'zoo',
            value: 3,
            index: 2
          },
          {
            path: 'asd',
            value: 4,
            index: 3
          }
        ],
        n: 3
      })
    })
  })
})
