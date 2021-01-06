/* global describe it before */
const expect = require('chai').expect
const errors = require('../lib/jet/errors')

describe('The jet.errors module', function () {
  [
    {
      errName: 'DaemonError'
    },
    {
      errName: 'InvalidUser',
      message: 'The specified user does not exist'
    },
    {
      errName: 'InvalidPassword',
      message: 'The specified password is wrong'
    },
    {
      errName: 'NotFound',
      message: 'No State/Method matching the specified path'
    },
    {
      errName: 'Occupied',
      message: 'A State/Method with the same path has already been added'
    },
    {
      errName: 'InvalidArgument',
      message: 'The provided argument(s) have been refused by the State/Method'
    },
    {
      errName: 'ConnectionClosed'
    },
    {
      errName: 'PeerTimeout',
      message: 'The peer processing the request did not respond within the specified timeout'
    },
    {
      errName: 'FetchOnly',
      message: 'The State cannot be modified'
    },
    {
      errName: 'Unauthorized',
      message: 'The request is not authorized for the user'
    }
  ].forEach(function (errDesc) {
    const errName = errDesc.errName
    describe('a jet.' + errName, function () {
      const Ctor = errors[errDesc.errName]
      let err
      let message

      before(function () {
        if (errDesc.message) {
          err = new Ctor()
          message = errDesc.message
        } else {
          err = new Ctor('bla')
          message = 'bla'
        }
      })

      it('is instance of Error', function () {
        expect(err).to.be.an.instanceof(Error)
      })

      it('Error is not parent class', function () {
        expect(new Error() instanceof Ctor).to.be.false // eslint-disable-line no-unused-expressions
      })

      it('is instance of errors.BaseError', function () {
        expect(err).to.be.an.instanceof(errors.BaseError)
      })

      it('.name is jet.' + errName, function () {
        expect(err.name).to.be.equal('jet.' + errName)
      })

      it('.message is correct', function () {
        expect(err.message).to.be.equal(message)
      })

      it('.stack is a string', function () {
        expect(err.stack).to.be.a('string')
      })

      it('err.url points to github repo', function () {
        expect(err.url).to.match(/^https:\/\/github\.com\/lipp\/node-jet\//)
      })
    })
  })
})
