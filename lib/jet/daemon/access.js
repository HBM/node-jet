var jetUtils = require('../utils');
var isDefined = jetUtils.isDefined;

var intersects = function (arrayA, arrayB) {
	for (var i = 0; i < arrayA.length; ++i) {
		if (arrayB.find(arrayA[i]) !== -1) {
			return true;
		}
	};
	return false;
};

var grantAccess = function (accessName, access, auth) {
	if (accessName === 'fetch') {
		return intersects(access.fetchGroups, auth.fetchGroups);
	}
	return false;
};

exports.hasAccess = function (accessName, peer, element) {
	if (!isDefined(element.access)) {
		return true;
	} else {
		return grantAccess(accessName, element.access, peer.auth);
	}
};