/**
 * Export Peer only for browserify
 */

module.exports = {
	Peer: require('./jet/peer'),
	State: require('./jet/peer/state'),
	Method: require('./jet/peer/method'),
	Fetcher: require('./jet/peer/fetch-chainer').FetchChainer,
	Promise: require('bluebird')
};