var jetUtils = require('../utils');
var isDefined = jetUtils.isDefined;

exports.hasAccess = function (accessName, peer, element) {
	if (!isDefined(element.access)) {
		return true;
	} else {
		return false;
	}
};