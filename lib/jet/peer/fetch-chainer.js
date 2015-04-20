var FetchChainer = function (peer) {
	this.rule = {};
	this.peer = peer;
};

FetchChainer.prototype.run = function (fetchCallback, callbacks) {
	return this.peer.fetchCall(this.rule, fetchCallback, callbacks);
};

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

module.exports.FetchChainer = FetchChainer;