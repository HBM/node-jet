exports.invalidParams = function (data) {
    return {
        message: 'Invalid params',
        code: -32602,
        data: data
    };
};
exports.methodNotFound = function (data) {
    return {
        message: 'Method not found',
        code: -32601,
        data: data
    };
};
exports.invalidRequest = function (data) {
    return {
        message: 'Invalid Request',
        code: -32600,
        data: data
    };
};
exports.isDefined = function (x) {
    if (typeof x === 'undefined' || x === null) {
        return false;
    }
    return true;
};
exports.noop = function () {};
