'use strict'

/**
 * Export Peer only for browserify
 */

var errors = require('./jet/errors')

module.exports = {
  Peer: require('./jet/peer'),
  State: require('./jet/peer/state'),
  Method: require('./jet/peer/method'),
  Fetcher: require('./jet/peer/fetch-chainer').FetchChainer,
  BaseError: errors.BaseError,
  NotFound: errors.NotFound,
  Occupied: errors.Occupied,
  FetchOnly: errors.FetchOnly,
  ConnectionClosed: errors.ConnectionClosed,
  InvalidUser: errors.InvalidUser,
  InvalidPassword: errors.InvalidPassword,
  PeerTimeout: errors.PeerTimeout,
  InvalidArgument: errors.InvalidArgument,
  PeerError: errors.PeerError,
  Unauthorized: errors.Unauthorized
}
