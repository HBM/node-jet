var jetUtils = require('../utils');
var isDefined = jetUtils.isDefined;

var intersects = function (arrayA, arrayB) {
	for (var i = 0; i < arrayA.length; ++i) {
		if (arrayB.indexOf(arrayA[i]) !== -1) {
			return true;
		}
	};
	return false;
};

var grantAccess = function (accessName, access, auth) {
	var groupName = accessName + 'Groups';
	return intersects(access[groupName], auth[groupName]);
};

exports.hasAccess = function (accessName, peer, element) {
	if (!isDefined(element.access)) {
		return true;
	} else if (!isDefined(peer.auth)) {
		return false;
	} else {
		return grantAccess(accessName, element.access, peer.auth);
	}
};

exports.intersects = intersects;
exports.grantAccess = grantAccess;