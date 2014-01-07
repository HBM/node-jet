'use strict';

var jetUtils = require('../utils');
var isDefined = jetUtils.isDefined;

var contains = function (what) {
    return function (path) {
        return path.indexOf(what) !== -1;
    };
};

var containsAllOf = function (whatArray) {
    return function (path) {
        var i;
        for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) === -1) {
                return false;
            }
        }
        return true;
    };
};

var containsOneOf = function (whatArray) {
    return function (path) {
        var i;
        for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) !== -1) {
                return true;
            }
        }
        return false;
    };
};

var startsWith = function (what) {
    return function (path) {
        return path.substr(0, what.length) === what;
    };
};

var endsWith = function (what) {
    return function (path) {
        return path.lastIndexOf(what) === (path.length - what.length);
    };
};

var equals = function (what) {
    return function (path) {
        return path === what;
    };
};

var equalsOneOf = function (whatArray) {
    return function (path) {
        var i;
        for (i = 0; i < whatArray.length; i = i + 1) {
            if (path === whatArray[i]) {
                return true;
            }
        }
        return false;
    };
};

var negate = function (gen) {
    return function () {
        var f = gen.apply(arguments);
        return function () {
            return !f.apply(arguments);
        };
    };
};

var generators = {
    equals: equals,
    equalsNot: negate(equals),
    contains: contains,
    containsNot: negate(contains),
    containsAllOf: containsAllOf,
    containsOneOf: containsOneOf,
    startsWith: startsWith,
    startsNotWith: negate(startsWith),
    endsWith: endsWith,
    endsNotWith: negate(endsWith),
    equalsOneOf: equalsOneOf,
    equalsNotOneOf: negate(equalsOneOf)
};

var predicateOrder = [
    'equals',
    'equalsNot',
    'endsWith',
    'startsWith',
    'contains',
    'containsNot',
    'containsAllOf',
    'containsOneOf',
    'startsNotWith',
    'endsNotWith',
    'equalsOneOf',
    'equalsNotOneOf'
];

exports.create = function (options) {
    if (!isDefined(options.path)) {
        return;
    }

    var po = options.path,
        ci = po.caseInsensitive,
        pred,
        predicates = [];

    predicateOrder.forEach(function (name) {
        var gen,
            i,
            option = po[name];
        if (isDefined(option)) {
            gen = generators[name];
            if (ci) {
                if (typeof option === 'object') {
                    for (i = 0; i < option.length; i = i + 1) {
                        option[i] = option[i].toLowerCase();
                    }
                } else {
                    option = option.toLowerCase();
                }
            }
            predicates.push(gen(option));
        }

        if (ci) {
            if (predicates.length === 1) {
                pred = predicates[0];
                return function (path, lowerPath) {
                    return pred(lowerPath);
                };
            } else {
                return function (path, lowerPath) {
                    var i;
                    for (i = 0; i < predicates.length; i = i + 1) {
                        if (!predicates[i](lowerPath)) {
                            return false;
                        }
                    }
                    return true;
                };
            }
        } else {
            if (predicates.length === 1) {
                pred = predicates[0];
                return function (path, lowerPath) {
                    return pred(path);
                };
            } else {
                return function (path, lowerPath) {
                    var i;
                    for (i = 0; i < predicates.length; i = i + 1) {
                        if (!predicates[i](lowerPath)) {
                            return false;
                        }
                    }
                    return true;
                };
            }
        }
    });
};
