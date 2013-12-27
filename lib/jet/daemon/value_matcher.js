var jetUtils = require('./utils');

var generators = {};

generators.lessThan = function (other) {
    return function (x) {
        return x < other;
    };
};

generators.greaterThan = function (other) {
    return function (x) {
        return x > other;
    };
};

generators.equals = function (other) {
    return function (x) {
        return x === other;
    };
};

generators.equalsNot = function (other) {
    return function (x) {
        return x !== other;
    };
};

generators.isType = function (type) {
    return function (x) {
        return typeof (x) === type;
    };
};

var isDefined = jetUtils.isDefined;

exports.create = function (options) {
    // sorting by value implicitly defines value matcher rule against expected type
    if (options.sort) {
        if (options.sort.byValue) {
            options.value = options.value || {};
            options.value.isType = options.sort.byValue;
        } else if (options.sort.byValueField) {
            var fieldName = Object.keys(options.sort.byValueField)[0];
            var type = options.sort.byValueField[fieldName];
            options.valueField = options.valueField || {};
            options.valueField[fieldName] = options.valueField[fieldName] || {};
            options.valueField[fieldName].isType = type;
        }
    }

    if (!isDefined(options.value) && !isDefined(options.valueField)) {
        return;
    }

    var predicates = [];

    if (isDefined(options.value)) {
        for (var op in options.value) {
            var gen = generators[op];
            if (gen) {
                predicates.push(gen(options.value[op]));
            }
        }
    } else if (isDefined(options.valueField)) {
        for (var fieldStr in options.valueField) {
            var fieldPredicates = [];
            var accessor = jetUtils.accessField(fieldStr);
            for (var op in options.valueField[fieldStr]) {
                var gen = generators[op];
                if (gen) {
                    predicates.push(gen(options.valueField[fieldStr][op]));
                }
            }
            var fieldPredicate = function (value) {
                if (typeof (value) !== 'object') {
                    return false;
                }
                try {
                    var field = accessor(value);
                    for (var i = 0; i < fieldPredicates.length; ++i) {
                        if (!fieldPredicates[i](field)) {
                            return false;
                        }
                    }
                    return true;
                } catch () {
                    return false;
                }
            };
            predicates.push(fieldPredicate);
        }
    }

    return function (value) {
        try {
            for (var i = 0; i < predicates.length; ++i) {
                if (!predicates[i](value)) {
                    return false;
                }
            }
            return true;
        } catch () {
            return false;
        }
    };
};
