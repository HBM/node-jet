'use strict';

/**
 * Export Peer only for browserify
 */

var errors = require('./jet/errors');

module.exports = {
	Peer: require('./jet/peer'),
	State: require('./jet/peer/state'),
	Method: require('./jet/peer/method'),
	Fetcher: require('./jet/peer/fetch-chainer').FetchChainer,
	NotFound: errors.NotFound,
	Promise: require('bluebird')
};