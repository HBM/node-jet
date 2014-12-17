var jetUtils = require('../utils');

var Element = function (eachPeerFetcher, owningPeer, path, value) {
	this.fetchers = {};
	this.eachFetcher = jetUtils.eachKeyValue(this.fetchers);
	this.path = path;
	this.value = value;
	this.peer = owningPeer;

	var fetchers = this.fetchers;
	var lowerPath = path.toLowerCase();

	eachPeerFetcher(function (peerFetchId, fetcher) {
		try {
			var mayHaveInterest = fetcher(path, lowerPath, 'add', value);
			if (mayHaveInterest) {
				fetchers[peerFetchId] = fetcher;
			}
		} catch (err) {
			console.error('fetcher failed', err);
		}
	});
};

Element.prototype._publish = function (event) {
	var lowerPath = this.path.toLowerCase();
	var value = this.value;
	var path = this.path;
	this.eachFetcher(function (_, fetcher) {
		try {
			fetcher(path, lowerPath, event, value);
		} catch (err) {
			console.error('fetcher failed', err);
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

Element.prototype.addFetcher = function (id, fetcher) {
	this.fetchers[id] = fetcher;
};

Element.prototype.removeFetcher = function (id) {
	delete this.fetchers[id];
};

var Elements = function () {
	this.instances = {};
	this.each = jetUtils.eachKeyValue(this.instances);
};

Elements.prototype.add = function (peers, owningPeer, path, value) {
	if (this.instances[path]) {
		throw jetUtils.invalidParams({
			pathAlreadyExists: path
		});
	} else {
		this.instances[path] = new Element(peers, owningPeer, path, value);
	}
};

Elements.prototype.get = function (path) {
	var el = this.instances[path];
	if (!el) {
		throw jetUtils.invalidParams({
			pathNotExists: path
		});
	} else {
		return el;
	}
};

Elements.prototype.change = function (path, value, peer) {
	var el = this.get(path);
	if (el.peer !== peer) {
		throw jetUtils.invalidParams({
			foreignPath: path
		});
	} else {
		el.change(value);
	}
};

Elements.prototype.removePeer = function (peer) {
	var toDelete = [];
	this.each(function (path, element) {
		if (element.peer === peer) {
			element.remove(path);
			toDelete.push(path);
		}
	});
	var instances = this.instances;
	toDelete.forEach(function (path) {
		delete instances[path];
	});
};

Elements.prototype.remove = function (path, peer) {
	var el = this.get(path);
	if (el.peer !== peer) {
		throw jetUtils.invalidParams({
			foreignPath: path
		});
	}
	el.remove();
	delete this.instances[path];
};

Elements.prototype.addFetcher = function (id, fetcher) {
	this.each(function (path, element) {
		var mayHaveInterest;
		try {
			mayHaveInterest = fetcher(
				path,
				path.toLowerCase(),
				'add',
				element.value
			);
			if (mayHaveInterest) {
				element.addFetcher(id, fetcher);
			}
		} catch (err) {
			console.error('fetcher failed', err);
		}
	});
};

Elements.prototype.removeFetcher = function (id) {
	this.each(function (_, element) {
		element.removeFetcher(id);
	});
};

exports.Elements = Elements;