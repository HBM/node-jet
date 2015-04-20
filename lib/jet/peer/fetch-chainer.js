var FetchChainer = function (peer) {
	this.rule = {};
	this.peer = peer;
};

FetchChainer.prototype.run = function (fetchCallback, callbacks) {
	return this.peer.fetchCall(this.rule, fetchCallback, callbacks);
};

FetchChainer.prototype.all = function () {};

FetchChainer.prototype.wherePath = function (match, comp) {
	this.rule.path = this.rule.path || {};
	this.rule.path[match] = comp;
	return this;
};

FetchChainer.prototype.whereKey = function (key, match, comp) {
	this.rule.valueField = this.rule.valueField || {};
	this.rule.valueField[key] = {};
	this.rule.valueField[key][match] = comp;
	return this;
};

FetchChainer.prototype.whereValue = function () {
	var args = Array.prototype.slice.call(arguments, 0);
	if (args.length == 2) {
		var match = args[0];
		var comp = args[1];
		this.rule.value = this.rule.value || {};
		this.rule.value[match] = comp;
		return this;
	} else {
		return this.whereKey(args[0], args[1], args[2]);
	}
};

var defaultSort = function () {
	return {
		asArray: true
	};
};

FetchChainer.prototype.differential = function () {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.asArray = false;
	return this;
};

FetchChainer.prototype.ascending = function () {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.descending = false;
	return this;
};

FetchChainer.prototype.descending = function () {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.descending = true;
	return this;
};

FetchChainer.prototype.sortByPath = function () {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.byPath = true;
	return this;
};

FetchChainer.prototype.sortByKey = function (key, type) {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.byValueField = {};
	this.rule.sort.buValueField[key] = type;
	return this;
};

FetchChainer.prototype.sortByValue = function () {
	var args = Array.prototype.slice.call(arguments, 0);
	this.rule.sort = this.rule.sort || defaultSort();
	if (args.length === 1) {
		this.rule.sort.byValue = args[0];
	} else {
		return this.sortByKey(args[0], args[1]);
	}
	return this;
};

FetchChainer.prototype.range = function (from, to) {
	this.rule.sort = this.rule.sort || defaultSort();
	this.rule.sort.from = from;
	this.rule.sort.to = to || from + 20;
	return this;
};


module.exports.FetchChainer = FetchChainer;