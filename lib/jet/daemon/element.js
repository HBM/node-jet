var jetUtils = require('../utils');

var Element = function (peers, owningPeer, path, value) {
	this.fetchers = {};
	this.eachFetcher = jetUtils.eachKeyValue(this.fetchers);
	this.path = path;
	this.value = value;
	this.peer = owningPeer;

	var fetchers = this.fetchers;
	var lowerPath = path.toLowerCase();

	jetUtils.eachKeyValue(peers)(function (peerId, peer) {
		peer.eachFetcher(function (fetcherId, fetcher) {
			try {
				var mayHaveInterest = fetcher(path, lowerPath, 'add', value);
				if (mayHaveInterest) {
					fetchers[peerId + fetcherId] = fetcher;
				}
			} catch (e) {
				console.log(e);
				crit('fetcher failed', e);
			}
		});
	});
};

Element.prototype._publish = function (event) {
	var lowerPath = this.path.toLowerCase();
	var value = this.value;
	var path = this.path;
	this.eachFetcher(function (_, fetcher) {
		try {
			fetcher(path, lowerPath, event, value);
		} catch (e) {
			crit('fetcher failed', e);
		}
	});
};

Element.prototype.change = function (value) {
	this.value = value;
	this._publish('change', value);

};

Element.prototype.remove = function () {
	this._publish('remove');
};

// Element.prototype.addFetcher = function(id, fetcher) {
//   this.fetchers[id] = fetcher;
// };
//
// Element.prototype.removeFetcher = function(id) {
//   delete this.fetchers[id];
// };

exports.Element = Element;