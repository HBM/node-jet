exports.invalidParams = function (data) {
    return {
        message: 'Invalid params',
        code: -32602,
        data: data
    };
};

exports.responseTimeout = function (data) {
    return {
        message: 'Response Timeout',
        code: -32001,
        data: data
    };
};

exports.parseError = function (data) {
    return {
        message: 'Parse error',
        code: -32700,
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

var isDefined = function (x) {
    if (typeof x === 'undefined' || x === null) {
        return false;
    }
    return true;
};

exports.isDefined = isDefined;

exports.noop = function () {};

exports.accessField = function (fieldStr) {
    if (fieldStr.substr(0, 1) !== '[') {
        fieldStr = '.' + fieldStr;
    }
    var funStr = 'return t' + fieldStr;
    return new Function('t', funStr);
};

exports.errorObject = function (err) {
    var data;
    if (typeof err == 'object' && isDefined(err.code) && isDefined(err.message)) {
        return err;
    } else {
        if (typeof err == 'object') {
            data = {};
            data.message = err.message;
            data.lineNumber = err.lineNumber;
            data.fileName = err.fileName;
        }
        return {
            code: -32602,
            message: 'Internal error',
            data: data || err
        };
    }
};