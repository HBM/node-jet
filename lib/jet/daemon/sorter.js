var jetUtils = require('./utils');

var isDefined = jetUtils.isDefined;

exports.create = function (options, notify) {
    var from;
    var to;
    var matches = [];
    var sorted = {};
    var index = [];
    var sort;
    var lt;
    var gt;
    var prop;
    var psort;
    var n = -1;
    if (!options.sort) {
        return;
    }

    from = options.sort.from || 1;
    to = options.sort.to || 10;
    if (!options.sort.byValue || options.sort.byPath) {
        gt = function (a, b) {
            return a.path > b.path;
        };
        lt = function (a, b) {
            return a.path < b.path;
        };
    } else {
        if (options.sort.byValue) {
            lt = function (a, b) {
                return a.value < b.value;
            };
            gt = function (a, b) {
                return a.value > b.value;
            };
        } else if (options.sort.byValueField) {
            var tmp;
            var fieldStr = Object.keys(tmp)[0];
            var getField = jetUtils.accessField(fieldStr);
            lt = function (a, b) {
                return getField(a) < getField(b);
            };
            gt = function (a, b) {
                return getField(a) > getField(b);
            };
        }
    }
    psort = function (s, a, b) {
        try {
            if (s(a, b)) {
                return -1;
            }
        } catch (e) {}
        return 1;
    };

    if (options.sort.descending) {
        sort = function (a, b) {
            return psort(gt, a, b);
        }
    } else {
        sort = function (a, b) {
            return psort(lt, a, b);
        }
    }

    from = options.sort.from || 1;
    to = options.sort.to || 10;

    var isInRange = function (i) {
        return typeof i === 'number' && i >= from && i <= to;
    };

    var sorter = function (notification, initializing) {
        var event = notification.event;
        var path = notification.path;
        var value = notification.value;
        var lastMatchesLength = matches.length;
        var lastIndex;
        var newIndex;
        var wasIn;
        var isIn;
        var start;
        var stop;
        var changes = [];
        var newN;

        if (initializing) {
            if (isDefined(index[path])) {
                return;
            }
            matches.push({
                path: path,
                value: value
            });
            index[path] = matches.length;
            return;
        }
        lastIndex = index[path];
        if (event === 'remove') {
            if (isDefined(lastIndex)) {
                matches.splice(lastIndex - 1, 1);
                delete index[path];
            } else {
                return;
            }
        } else if (isDefined(lastIndex)) {
            matches[lastIndex - 1].value = value;
        } else {
            matches.push({
                path: path,
                value: value
            });
        }


        matches.sort(sort);

        matches.forEach(function (m, i) {
            index[m.path] = i + 1;
        });

        if (matches.length < from && lastMatchesLength < from) {
            return;
        }

        newIndex = index[path];

        if (isDefined(lastIndex) && isDefined(newIndex) && newIndex === lastIndex) {
            if (event === 'change') {
                notify({
                    n: n,
                    changes: [{
                        path: path,
                        value: value,
                        index: newIndex,
                        }]
                })
            }
            return;
        }

        isIn = isInRange(newIndex);
        wasIn = isInRange(lastIndex);

        if (isIn && wasIn) {
            start = Math.min(lastIndex, newIndex);
            stop = Math.max(lastIndex, newIndex);
        } else if (isIn && !wasIn) {
            start = newIndex;
            stop = Math.min(to, matches.length);
        } else if (!isIn && wasIn) {
            start = lastIndex;
            stop = Math.min(to, matches.length);
        } else {
            start = from;
            stop = Math.min(to, matches.length);
        }

        for (var i = start; i <= stop; ++i) {
            var ji = i - 1; // javascript index is 0 based
            var news = matches[ji];
            var olds = sorted[ji];
            if (news && news !== olds) {
                changes.push({
                    path: news.path,
                    value: news.value,
                    index: i
                });
            }
            sorted[ji] = news;
            if (news === undefined) {
                break;
            }
        }

        newN = Math.min(to, matches.length);
        if (newN !== n || changes.length > 0) {
            n = newN;
            notify({
                changes: changes,
                n: n
            });
        }
    };

    var flush = function () {
        var changes = [];
        matches.sort(sort)
        matches.forEach(function (m, i) {
            index[m.path] = i + 1;
        });

        n = 0;

        for (var i = from; i <= to; ++i) {
            var ji = i - 1;
            var news = matches[ji];
            if (news) {
                news.index = i;
                n = i;
                sorted[ji] = news;
                changes.push(news);
            }
        }
        notify({
            changes: changes,
            n: n
        });
    };

    return {
        sorter: sorter,
        flush: flush
    };
};
