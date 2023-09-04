'use strict';

var require$$0 = require('fs');
var require$$1 = require('https');
var require$$2 = require('http');
var require$$4 = require('tls');
var require$$5 = require('crypto');
var require$$0$3 = require('stream');
var require$$7 = require('url');
var require$$0$1 = require('zlib');
var require$$0$2 = require('buffer');
require('finalhandler');
require('serve-static');
require('assert');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var todoServer = {};

var jet$1 = {};

var daemon$1 = {};

var log = {};

var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(log, "__esModule", { value: true });
log.Logger = log.LogLevel = void 0;
const fs = __importStar(require$$0);
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["socket"] = 1] = "socket";
    LogLevel[LogLevel["debug"] = 2] = "debug";
    LogLevel[LogLevel["info"] = 3] = "info";
    LogLevel[LogLevel["warn"] = 4] = "warn";
    LogLevel[LogLevel["error"] = 5] = "error";
    LogLevel[LogLevel["none"] = 6] = "none";
})(LogLevel || (log.LogLevel = LogLevel = {}));
/**
 * Logger class used for logging. Logging can be done to a file to the console or to any callback
 */
class Logger {
    logName;
    logLevel;
    callBacks;
    stream;
    /**
     * Constructor to create a new Logger instance
     * @param settings
     */
    constructor(settings = { logName: 'None' }) {
        this.logName = settings.logName;
        this.logLevel = settings.logLevel || LogLevel['none'];
        this.callBacks = settings.logCallbacks;
        if (settings.logFile) {
            this.stream = fs.createWriteStream(settings.logFile);
        }
    }
    /**
     * Function that transforms a message into a string of the format "<Date> <Time> <LogName> <LogLevel> <Message>"
     * @param msg
     * @param level
     * @returns string
     */
    stringBuilder(msg, level) {
        const date = new Date(Date.now());
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}\t${this.logName}\t${LogLevel[level]}\t${msg}`;
    }
    /**
     * Function called to log a message. Messages are only logged if the provided message log level is greater then the configured log level
     * @param msg
     * @param level
     * @returns string
     */
    log(msg, level = LogLevel.debug) {
        if (this.logLevel > level) {
            return;
        }
        const logMessage = this.stringBuilder(msg, level);
        if (this.stream) {
            this.stream.write(logMessage);
            this.stream.write('\n');
        }
        if (this.callBacks) {
            this.callBacks.every((cb) => cb(logMessage));
        }
    }
    /**
     * Log a message on the socket level
     * @param msg
     */
    sock(msg) {
        this.log(msg, LogLevel.socket);
    }
    /**
     * Log a message on the debug level
     * @param msg
     */
    debug(msg) {
        this.log(msg, LogLevel.debug);
    }
    /**
     * Log a Info message
     * @param msg
     */
    info(msg) {
        this.log(msg, LogLevel.info);
    }
    /**
     * Log a warn message
     * @param msg
     */
    warn(msg) {
        this.log(msg, LogLevel.warn);
    }
    /**
     * Log an error message
     * @param msg
     */
    error(msg) {
        this.log(msg, LogLevel.error);
    }
    /**
     * Function that can be called to wait until the stream has completed to write everything
     */
    flush() {
        return new Promise((resolve) => {
            if (this.stream) {
                const interval = setInterval(() => {
                    if (!this.stream || !this.stream.pending) {
                        clearInterval(interval);
                        resolve();
                    }
                });
            }
        });
    }
    /**
     * Function to close the Logger and the fileStream in case any fileStream was used
     */
    close() {
        if (this.stream) {
            this.stream.end();
        }
    }
}
log.Logger = Logger;

var path_matcher = {};

var errors = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PeerTimeout = exports.ConnectionInUse = exports.ConnectionClosed = exports.notAllowed = exports.invalidRequest = exports.invalidState = exports.invalidMethod = exports.methodNotFoundError = exports.FetchOnly = exports.Occupied = exports.InvalidArgument = exports.InvvalidCredentials = exports.NotFound = exports.InvalidParamError = exports.ParseError = exports.JSONRPCError = exports.CONNECTION_ERROR_CODE = exports.RESPONSE_TIMEOUT_CODE = exports.INVALID_PATH = exports.INTERNAL_ERROR_CODE = exports.INVALID_PARAMS_CODE = exports.METHOD_NOT_FOUND = exports.INVALID_REQUEST = exports.PARSE_ERROR_CODE = exports.NO_ERROR_CODE = void 0;
	const errorUrlBase = 'https://github.com/lipp/node-jet/blob/master/doc/peer.markdown';
	exports.NO_ERROR_CODE = 1000;
	exports.PARSE_ERROR_CODE = -32600;
	exports.INVALID_REQUEST = -32600;
	exports.METHOD_NOT_FOUND = -32601;
	exports.INVALID_PARAMS_CODE = -32602;
	exports.INTERNAL_ERROR_CODE = -32603;
	exports.INVALID_PATH = -32604;
	exports.RESPONSE_TIMEOUT_CODE = -32001;
	exports.CONNECTION_ERROR_CODE = -32002;
	class JSONRPCError extends Error {
	    code;
	    message;
	    data;
	    constructor(code, name, message, details = '') {
	        super();
	        this.code = code;
	        this.name = 'jet.' + name;
	        this.message = message;
	        this.data = {
	            name: 'jet.' + name,
	            url: errorUrlBase + '#jet' + name.toLowerCase(),
	            details: details
	        };
	    }
	    toString = () => `code: ${this.code} \nname: ${this.name} \n${this.message} \n${this.data}`;
	}
	exports.JSONRPCError = JSONRPCError;
	class ParseError extends JSONRPCError {
	    constructor(details = '') {
	        super(exports.PARSE_ERROR_CODE, 'ParseError', 'Message could not be parsed', details);
	    }
	}
	exports.ParseError = ParseError;
	class InvalidParamError extends JSONRPCError {
	    constructor(name, message, details = '') {
	        super(exports.INVALID_PARAMS_CODE, name, message, details);
	    }
	}
	exports.InvalidParamError = InvalidParamError;
	class NotFound extends InvalidParamError {
	    constructor(details) {
	        super('NotFound', 'No State/Method matching the specified path', details);
	    }
	}
	exports.NotFound = NotFound;
	class InvvalidCredentials extends InvalidParamError {
	    constructor(details) {
	        super('invalid params', 'invalid credentials', details);
	    }
	}
	exports.InvvalidCredentials = InvvalidCredentials;
	class InvalidArgument extends InvalidParamError {
	    constructor(details) {
	        super('InvalidArgument', 'The provided argument(s) have been refused by the State/Method', details);
	    }
	}
	exports.InvalidArgument = InvalidArgument;
	class Occupied extends InvalidParamError {
	    constructor(details) {
	        super('Occupied', 'A State/Method with the same path has already been added', details);
	    }
	}
	exports.Occupied = Occupied;
	class FetchOnly extends InvalidParamError {
	    constructor(details) {
	        super('FetchOnly', 'The State cannot be modified', details);
	    }
	}
	exports.FetchOnly = FetchOnly;
	class methodNotFoundError extends JSONRPCError {
	    constructor(details = '') {
	        super(exports.METHOD_NOT_FOUND, 'MethodNotFound', 'Method not found', details);
	    }
	}
	exports.methodNotFoundError = methodNotFoundError;
	class invalidMethod extends JSONRPCError {
	    constructor(details) {
	        super(exports.INVALID_REQUEST, 'invalidMethod', 'The path does not support this method', details);
	    }
	}
	exports.invalidMethod = invalidMethod;
	class invalidState extends JSONRPCError {
	    constructor(details) {
	        super(exports.INVALID_PATH, 'invalidState', 'The path is not supported', details);
	    }
	}
	exports.invalidState = invalidState;
	class invalidRequest extends JSONRPCError {
	    constructor(name = 'invalidRequest', message = 'Invalid Request', details = '') {
	        super(exports.INVALID_REQUEST, name, message, details);
	    }
	}
	exports.invalidRequest = invalidRequest;
	class notAllowed extends invalidRequest {
	    constructor(details) {
	        super('NotAllowed', 'Not allowed', details);
	    }
	}
	exports.notAllowed = notAllowed;
	class ConnectionClosed extends JSONRPCError {
	    constructor(details) {
	        super(exports.CONNECTION_ERROR_CODE, 'ConnectionClosed', 'The connection is closed', details);
	    }
	}
	exports.ConnectionClosed = ConnectionClosed;
	class ConnectionInUse extends JSONRPCError {
	    constructor(err) {
	        super(exports.CONNECTION_ERROR_CODE, 'ConnectionInUse', 'Could not establish connection', err);
	    }
	}
	exports.ConnectionInUse = ConnectionInUse;
	class PeerTimeout extends JSONRPCError {
	    constructor(details) {
	        super(exports.RESPONSE_TIMEOUT_CODE, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout', details);
	    }
	}
	exports.PeerTimeout = PeerTimeout; 
} (errors));

var types = {};

Object.defineProperty(types, "__esModule", { value: true });
types.fetchSimpleId = types.operators = types.pathRules = types.events = void 0;
types.events = [
    'configure',
    'info',
    'fetch',
    'unfetch',
    'remove',
    'change',
    'add',
    'data',
    'call',
    'get',
    'set'
];
types.pathRules = [
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
types.operators = [
    'greaterThan',
    'lessThan',
    'equals',
    'equalsNot',
    'isType'
];
types.fetchSimpleId = 'fetch_all';

Object.defineProperty(path_matcher, "__esModule", { value: true });
path_matcher.createPathMatcher = void 0;
// import { Notification } from "./fetcher";
const errors_1$6 = errors;
const types_1$1 = types;
const contains = (what) => (path) => path.indexOf(what) !== -1;
const containsAllOf = (whatArray) => {
    return (path) => {
        let i;
        for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) === -1) {
                return false;
            }
        }
        return true;
    };
};
const containsOneOf = (whatArray) => {
    return (path) => {
        let i;
        for (i = 0; i < whatArray.length; i = i + 1) {
            if (path.indexOf(whatArray[i]) !== -1) {
                return true;
            }
        }
        return false;
    };
};
const startsWith = (what) => (path) => path.substring(0, what.length) === what;
const endsWith = (what) => (path) => path.lastIndexOf(what) === path.length - what.length;
const equals = (what) => (path) => path === what;
const equalsOneOf = (whatArray) => (path) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
        if (path === whatArray[i]) {
            return true;
        }
    }
    return false;
};
const negate = (gen) => 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
((args) => () => !gen(args));
const generators$1 = {
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
const createPathMatcher = (options) => {
    if (!options.path) {
        return () => true;
    }
    const po = options.path;
    Object.keys(po).forEach((key) => {
        if (!(key in generators$1) && key !== 'caseInsensitive')
            throw new errors_1$6.InvalidArgument('unknown rule ' + key);
    });
    const predicates = [];
    types_1$1.pathRules.forEach((name) => {
        let option = po[name];
        if (option) {
            const gen = generators$1[name];
            if (po.caseInsensitive) {
                if (Array.isArray(option)) {
                    option = option.map((op) => op.toLowerCase());
                }
                else {
                    option = option.toLowerCase();
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            predicates.push(gen(option));
        }
    });
    const applyPredicates = (path) => {
        for (let i = 0; i < predicates.length; ++i) {
            if (!predicates[i](path)) {
                return false;
            }
        }
        return true;
    };
    return predicates.length === 1
        ? (path) => predicates[0](path)
        : (path) => applyPredicates(path);
};
path_matcher.createPathMatcher = createPathMatcher;

var subscription = {};

var value_matcher = {};

var utils = {};

Object.defineProperty(utils, "__esModule", { value: true });
utils.isState = utils.errorObject = utils.getValue = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getValue = (o, field) => {
    if (field === '')
        return o;
    const keys = field.split('.');
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key in o) {
            o = o[key];
        }
        else {
            return undefined;
        }
    }
    return o;
};
utils.getValue = getValue;
const isJsonRPCError = (err) => typeof err === 'object' && 'code' in err && 'message' in err;
const errorObject = (err) => {
    let data;
    if (isJsonRPCError(err)) {
        return err;
    }
    else {
        data = {};
        if (typeof err === 'string') {
            data.message = err;
            data.stack = 'no stack available';
        }
        else {
            data.message = err.message;
            data.stack = err.stack;
            data.lineNumber = err.lineNumber;
            data.fileName = err.fileName;
        }
        return {
            code: -32603,
            message: 'Internal error',
            data: data
        };
    }
};
utils.errorObject = errorObject;
const isState = (stateOrMethod) => {
    return '_value' in stateOrMethod;
};
utils.isState = isState;

Object.defineProperty(value_matcher, "__esModule", { value: true });
value_matcher.create = void 0;
const errors_1$5 = errors;
const utils_1$1 = utils;
const generators = {
    equals: (field, other) => (x) => (0, utils_1$1.getValue)(x, field) === other,
    lessThan: (field, other) => (x) => (0, utils_1$1.getValue)(x, field) < other,
    equalsNot: (field, other) => (x) => (0, utils_1$1.getValue)(x, field) !== other,
    greaterThan: (field, other) => (x) => (0, utils_1$1.getValue)(x, field) > other,
    isType: (field, other) => (x) => typeof (0, utils_1$1.getValue)(x, field) === other
};
const generatePredicate = (field, rule) => {
    const gen = generators[rule.operator];
    if (!gen) {
        throw new errors_1$5.InvalidArgument('unknown rule ' + rule.operator);
    }
    else {
        return gen(field, rule.value);
    }
};
const createValuePredicates = (valueOptions) => {
    const predicates = [];
    Object.entries(valueOptions).forEach(([field, rule]) => {
        predicates.push(generatePredicate(field, rule));
    });
    return predicates;
};
const create = (options) => {
    if (options.value) {
        const predicates = createValuePredicates(options.value);
        return (value) => {
            if (value === undefined)
                return false;
            // eslint-disable-line consistent-return
            for (let i = 0; i < predicates.length; ++i) {
                if (!predicates[i](value)) {
                    return false;
                }
            }
            return true;
        };
    }
    return () => true;
};
value_matcher.create = create;

Object.defineProperty(subscription, "__esModule", { value: true });
subscription.Subscription = void 0;
const path_matcher_1$1 = path_matcher;
const value_matcher_1 = value_matcher;
/** A subscription corresponds to a fetch request.
 * Each subscription contains all the routes that match the subscription  */
class Subscription {
    owner;
    id;
    messages = [];
    routes = [];
    pathMatcher;
    valueMatcher;
    constructor(msg, peer = undefined) {
        this.pathMatcher = (0, path_matcher_1$1.createPathMatcher)(msg);
        this.valueMatcher = (0, value_matcher_1.create)(msg);
        this.owner = peer;
        this.id = msg.id;
    }
    close = () => {
        this.routes.forEach((route) => {
            route.removeListener('Change', this.handleChange);
            route.removeListener('Remove', this.handleRemove);
        });
    };
    handleChange = (path, value) => this.enqueue({ path: path, event: 'Change', value });
    handleRemove = (path) => this.enqueue({ path: path, event: 'Remove' });
    addRoute = (route) => {
        this.routes.push(route);
        if (this.valueMatcher(route.value)) {
            this.enqueue({
                path: route.path,
                event: 'Add',
                value: route.value
            });
        }
        route.addListener('Change', this.handleChange);
        route.addListener('Remove', this.handleRemove);
    };
    setRoutes = (routes) => {
        routes.forEach((route) => this.addRoute(route));
    };
    matchesPath = (path) => this.pathMatcher(path);
    matchesValue = (value) => this.valueMatcher(value);
    enqueue = (msg) => {
        this.messages.push(msg);
    };
    send = () => {
        this.messages.forEach((msg) => this.owner?.queue(msg, this.id));
        this.messages = [];
    };
}
subscription.Subscription = Subscription;

var route = {};

var _1_socket = {};

var events = {exports: {}};

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter$2() {
  EventEmitter$2.init.call(this);
}
events.exports = EventEmitter$2;
events.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter$2.EventEmitter = EventEmitter$2;

EventEmitter$2.prototype._events = undefined;
EventEmitter$2.prototype._eventsCount = 0;
EventEmitter$2.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter$2, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter$2.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter$2.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter$2.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter$2.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter$2.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter$2.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter$2.prototype.on = EventEmitter$2.prototype.addListener;

EventEmitter$2.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter$2.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter$2.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter$2.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter$2.prototype.off = EventEmitter$2.prototype.removeListener;

EventEmitter$2.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter$2.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter$2.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter$2.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter$2.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter$2.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

var eventsExports = events.exports;

var net$1 = {};

/*
Copyright 2013 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

var hasRequiredNet;

function requireNet () {
	if (hasRequiredNet) return net$1;
	hasRequiredNet = 1;
	// yes, I know this seems stupid, but I have my reasons.

	var net = requireNet();
	for(k in net)
		commonjsGlobal[k] = net[k];
	return net$1;
}

var bufferUtil$1 = {exports: {}};

var constants = {
  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};

var unmask$1;
var mask;

const { EMPTY_BUFFER: EMPTY_BUFFER$3 } = constants;

const FastBuffer$2 = Buffer[Symbol.species];

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat$1(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER$3;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) {
    return new FastBuffer$2(target.buffer, target.byteOffset, offset);
  }

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer$1(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer$2(data) {
  toBuffer$2.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer$2(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer$2(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer$2.readOnly = false;
  }

  return buf;
}

bufferUtil$1.exports = {
  concat: concat$1,
  mask: _mask,
  toArrayBuffer: toArrayBuffer$1,
  toBuffer: toBuffer$2,
  unmask: _unmask
};

/* istanbul ignore else  */
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = require('bufferutil');

    mask = bufferUtil$1.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    unmask$1 = bufferUtil$1.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}

var bufferUtilExports = bufferUtil$1.exports;

const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
let Limiter$1 = class Limiter {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
};

var limiter = Limiter$1;

const zlib = require$$0$1;

const bufferUtil = bufferUtilExports;
const Limiter = limiter;
const { kStatusCode: kStatusCode$2 } = constants;

const FastBuffer$1 = Buffer[Symbol.species];
const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError$1 = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
let PerMessageDeflate$4 = class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError$1];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) {
        data = new FastBuffer$1(data.buffer, data.byteOffset, data.length - 4);
      }

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
};

var permessageDeflate = PerMessageDeflate$4;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError$1] = new RangeError('Max payload size exceeded');
  this[kError$1].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError$1][kStatusCode$2] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode$2] = 1007;
  this[kCallback](err);
}

var validation = {exports: {}};

var isValidUTF8_1;

const { isUtf8 } = require$$0$2;

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars$2 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode$2(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

validation.exports = {
  isValidStatusCode: isValidStatusCode$2,
  isValidUTF8: _isValidUTF8,
  tokenChars: tokenChars$2
};

if (isUtf8) {
  isValidUTF8_1 = validation.exports.isValidUTF8 = function (buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = require('utf-8-validate');

    isValidUTF8_1 = validation.exports.isValidUTF8 = function (buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}

var validationExports = validation.exports;

const { Writable } = require$$0$3;

const PerMessageDeflate$3 = permessageDeflate;
const {
  BINARY_TYPES: BINARY_TYPES$1,
  EMPTY_BUFFER: EMPTY_BUFFER$2,
  kStatusCode: kStatusCode$1,
  kWebSocket: kWebSocket$2
} = constants;
const { concat, toArrayBuffer, unmask } = bufferUtilExports;
const { isValidStatusCode: isValidStatusCode$1, isValidUTF8 } = validationExports;

const FastBuffer = Buffer[Symbol.species];
const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
let Receiver$1 = class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();

    this._binaryType = options.binaryType || BINARY_TYPES$1[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket$2] = undefined;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._state = GET_INFO;
    this._loop = false;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buf.buffer,
        buf.byteOffset + n,
        buf.length - n
      );

      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + n,
          buf.length - n
        );
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    let err;
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          err = this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          err = this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          err = this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          err = this.getData(cb);
          break;
        default:
          // `INFLATING`
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb(err);
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this._loop = false;
      return error(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate$3.extensionName]) {
      this._loop = false;
      return error(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (!this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this._loop = false;
        return error(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
      }

      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (
        this._payloadLength > 0x7d ||
        (this._opcode === 0x08 && this._payloadLength === 1)
      ) {
        this._loop = false;
        return error(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      }
    } else {
      this._loop = false;
      return error(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this._loop = false;
        return error(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
      }
    } else if (this._masked) {
      this._loop = false;
      return error(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else return this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this._loop = false;
      return error(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        this._loop = false;
        return error(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER$2;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) return this.controlMessage(data);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its length is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage();
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$3.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          return cb(
            error(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            )
          );
        }

        this._fragments.push(buf);
      }

      const er = this.dataMessage();
      if (er) return cb(er);

      this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @return {(Error|undefined)} A possible error
   * @private
   */
  dataMessage() {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        let data;

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data, true);
      } else {
        const buf = concat(fragments, messageLength);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          this._loop = false;
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('message', buf, false);
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER$2);
        this.end();
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode$1(code)) {
          return error(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );
        }

        const buf = new FastBuffer(
          data.buffer,
          data.byteOffset + 2,
          data.length - 2
        );

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('conclude', code, buf);
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }
};

var receiver = Receiver$1;

/**
 * Builds an error object.
 *
 * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
 * @param {String} message The error message
 * @param {Boolean} prefix Specifies whether or not to add a default prefix to
 *     `message`
 * @param {Number} statusCode The status code
 * @param {String} errorCode The exposed error code
 * @return {(Error|RangeError)} The error
 * @private
 */
function error(ErrorCtor, message, prefix, statusCode, errorCode) {
  const err = new ErrorCtor(
    prefix ? `Invalid WebSocket frame: ${message}` : message
  );

  Error.captureStackTrace(err, error);
  err.code = errorCode;
  err[kStatusCode$1] = statusCode;
  return err;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */

requireNet();
const { randomFillSync } = require$$5;

const PerMessageDeflate$2 = permessageDeflate;
const { EMPTY_BUFFER: EMPTY_BUFFER$1 } = constants;
const { isValidStatusCode } = validationExports;
const { mask: applyMask, toBuffer: toBuffer$1 } = bufferUtilExports;

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
let Sender$1 = class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {(net.Socket|tls.Socket)} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};

    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }

    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {(Buffer|String)} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {(Buffer|String)[]} The framed data
   * @public
   */
  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;

      if (options.generateMask) {
        options.generateMask(mask);
      } else {
        randomFillSync(mask, 0, 4);
      }

      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
      offset = 6;
    }

    let dataLength;

    if (typeof data === 'string') {
      if (
        (!options.mask || skipMasking) &&
        options[kByteLength] !== undefined
      ) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }

    let payloadLength = dataLength;

    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (skipMasking) return [target, data];

    if (merge) {
      applyMask(data, mask, target, offset, dataLength);
      return [target];
    }

    applyMask(data, mask, data, 0, dataLength);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER$1;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);

      if (typeof data === 'string') {
        buf.write(data, 2);
      } else {
        buf.set(data, 2);
      }
    }

    const options = {
      [kByteLength]: buf.length,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, buf, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(buf, options), cb);
    }
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (this._deflating) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        [kByteLength]: byteLength,
        fin: options.fin,
        generateMask: this._generateMask,
        mask: options.mask,
        maskBuffer: this._maskBuffer,
        opcode,
        readOnly,
        rsv1
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, data, this._compress, opts, cb]);
      } else {
        this.dispatch(data, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(
        Sender.frame(data, {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1: false
        }),
        cb
      );
    }
  }

  /**
   * Dispatches a message.
   *
   * @param {(Buffer|String)} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];

    this._bufferedBytes += options[kByteLength];
    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        if (typeof cb === 'function') cb(err);

        for (let i = 0; i < this._queue.length; i++) {
          const params = this._queue[i];
          const callback = params[params.length - 1];

          if (typeof callback === 'function') callback(err);
        }

        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._deflating = false;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
};

var sender = Sender$1;

const { kForOnEventAttribute: kForOnEventAttribute$1, kListener: kListener$1 } = constants;

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
let Event$1 = class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(type) {
    this[kTarget] = null;
    this[kType] = type;
  }

  /**
   * @type {*}
   */
  get target() {
    return this[kTarget];
  }

  /**
   * @type {String}
   */
  get type() {
    return this[kType];
  }
};

Object.defineProperty(Event$1.prototype, 'target', { enumerable: true });
Object.defineProperty(Event$1.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
let CloseEvent$1 = class CloseEvent extends Event$1 {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(type, options = {}) {
    super(type);

    this[kCode] = options.code === undefined ? 0 : options.code;
    this[kReason] = options.reason === undefined ? '' : options.reason;
    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
  }

  /**
   * @type {Number}
   */
  get code() {
    return this[kCode];
  }

  /**
   * @type {String}
   */
  get reason() {
    return this[kReason];
  }

  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[kWasClean];
  }
};

Object.defineProperty(CloseEvent$1.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent$1.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent$1.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event$1 {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(type, options = {}) {
    super(type);

    this[kError] = options.error === undefined ? null : options.error;
    this[kMessage] = options.message === undefined ? '' : options.message;
  }

  /**
   * @type {*}
   */
  get error() {
    return this[kError];
  }

  /**
   * @type {String}
   */
  get message() {
    return this[kMessage];
  }
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
let MessageEvent$1 = class MessageEvent extends Event$1 {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(type, options = {}) {
    super(type);

    this[kData] = options.data === undefined ? null : options.data;
  }

  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
};

Object.defineProperty(MessageEvent$1.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {(Function|Object)} handler The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, handler, options = {}) {
    for (const listener of this.listeners(type)) {
      if (
        !options[kForOnEventAttribute$1] &&
        listener[kListener$1] === handler &&
        !listener[kForOnEventAttribute$1]
      ) {
        return;
      }
    }

    let wrapper;

    if (type === 'message') {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent$1('message', {
          data: isBinary ? data : data.toString()
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'close') {
      wrapper = function onClose(code, message) {
        const event = new CloseEvent$1('close', {
          code,
          reason: message.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'error') {
      wrapper = function onError(error) {
        const event = new ErrorEvent('error', {
          error,
          message: error.message
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'open') {
      wrapper = function onOpen() {
        const event = new Event$1('open');

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else {
      return;
    }

    wrapper[kForOnEventAttribute$1] = !!options[kForOnEventAttribute$1];
    wrapper[kListener$1] = handler;

    if (options.once) {
      this.once(type, wrapper);
    } else {
      this.on(type, wrapper);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {(Function|Object)} handler The listener to remove
   * @public
   */
  removeEventListener(type, handler) {
    for (const listener of this.listeners(type)) {
      if (listener[kListener$1] === handler && !listener[kForOnEventAttribute$1]) {
        this.removeListener(type, listener);
        break;
      }
    }
  }
};

var eventTarget = {
  CloseEvent: CloseEvent$1,
  ErrorEvent,
  Event: Event$1,
  EventTarget,
  MessageEvent: MessageEvent$1
};

/**
 * Call an event listener
 *
 * @param {(Function|Object)} listener The listener to call
 * @param {*} thisArg The value to use as `this`` when calling the listener
 * @param {Event} event The event to pass to the listener
 * @private
 */
function callListener(listener, thisArg, event) {
  if (typeof listener === 'object' && listener.handleEvent) {
    listener.handleEvent.call(listener, event);
  } else {
    listener.call(thisArg, event);
  }
}

const { tokenChars: tokenChars$1 } = validationExports;

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse$2(header) {
  const offers = Object.create(null);
  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let code = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (
        i !== 0 &&
        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
      ) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars$1[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars$1[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format$1(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

var extension$1 = { format: format$1, parse: parse$2 };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */

const EventEmitter$1 = eventsExports;
const https = require$$1;
const http$1 = require$$2;
const net = requireNet();
const tls = require$$4;
const { randomBytes, createHash: createHash$1 } = require$$5;
const { URL } = require$$7;

const PerMessageDeflate$1 = permessageDeflate;
const Receiver = receiver;
const Sender = sender;
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID: GUID$1,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket: kWebSocket$1,
  NOOP
} = constants;
const {
  EventTarget: { addEventListener, removeEventListener }
} = eventTarget;
const { format, parse: parse$1 } = extension$1;
const { toBuffer } = bufferUtilExports;

const closeTimeout = 30 * 1000;
const kAborted = Symbol('kAborted');
const protocolVersions = [8, 13];
const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
let WebSocket$3 = class WebSocket extends EventEmitter$1 {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = EMPTY_BUFFER;
    this._closeTimer = null;
    this._extensions = {};
    this._paused = false;
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (protocols === undefined) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === 'object' && protocols !== null) {
          options = protocols;
          protocols = [];
        } else {
          protocols = [protocols];
        }
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._isServer = true;
    }
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the
   * required default "blob" type (instead we define a custom "nodebuffer"
   * type).
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(socket, head, options) {
    const receiver = new Receiver({
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxPayload: options.maxPayload,
      skipUTF8Validation: options.skipUTF8Validation
    });

    this._sender = new Sender(socket, this._extensions, options.generateMask);
    this._receiver = receiver;
    this._socket = socket;

    receiver[kWebSocket$1] = this;
    socket[kWebSocket$1] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError$1);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate$1.extensionName]) {
      this._extensions[PerMessageDeflate$1.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake$1(this, this._req, msg);
      return;
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    //
    // Specify a timeout for the closing handshake to complete.
    //
    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      closeTimeout
    );
  }

  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = true;
    this._socket.pause();
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = false;
    if (!this._receiver._writableState.needDrain) this._socket.resume();
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate$1.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake$1(this, this._req, msg);
      return;
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
};

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$3, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$3.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'isPaused',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket$3.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket$3.prototype, `on${method}`, {
    enumerable: true,
    get() {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) return listener[kListener];
      }

      return null;
    },
    set(handler) {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) {
          this.removeListener(method, listener);
          break;
        }
      }

      if (typeof handler !== 'function') return;

      this.addEventListener(method, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});

WebSocket$3.prototype.addEventListener = addEventListener;
WebSocket$3.prototype.removeEventListener = removeEventListener;

var websocket = WebSocket$3;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    createConnection: undefined,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: 'GET',
    host: undefined,
    path: undefined,
    port: undefined
  };

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
    websocket._url = address.href;
  } else {
    try {
      parsedUrl = new URL(address);
    } catch (e) {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }

    websocket._url = address;
  }

  const isSecure = parsedUrl.protocol === 'wss:';
  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
  let invalidUrlMessage;

  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
    invalidUrlMessage =
      'The URL\'s protocol must be one of "ws:", "wss:", or "ws+unix:"';
  } else if (isIpcUrl && !parsedUrl.pathname) {
    invalidUrlMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidUrlMessage = 'The URL contains a fragment identifier';
  }

  if (invalidUrlMessage) {
    const err = new SyntaxError(invalidUrlMessage);

    if (websocket._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket, err);
      return;
    }
  }

  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const request = isSecure ? https.request : http$1.request;
  const protocolSet = new Set();
  let perMessageDeflate;

  opts.createConnection = isSecure ? tlsConnect : netConnect;
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    ...opts.headers,
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket'
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate$1(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate$1.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (
        typeof protocol !== 'string' ||
        !subprotocolRegex.test(protocol) ||
        protocolSet.has(protocol)
      ) {
        throw new SyntaxError(
          'An invalid or duplicated subprotocol was specified'
        );
      }

      protocolSet.add(protocol);
    }

    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isIpcUrl) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req;

  if (opts.followRedirects) {
    if (websocket._redirects === 0) {
      websocket._originalIpc = isIpcUrl;
      websocket._originalSecure = isSecure;
      websocket._originalHostOrSocketPath = isIpcUrl
        ? opts.socketPath
        : parsedUrl.host;

      const headers = options && options.headers;

      //
      // Shallow copy the user provided options so that headers can be changed
      // without mutating the original object.
      //
      options = { ...options, headers: {} };

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key.toLowerCase()] = value;
        }
      }
    } else if (websocket.listenerCount('redirect') === 0) {
      const isSameHost = isIpcUrl
        ? websocket._originalIpc
          ? opts.socketPath === websocket._originalHostOrSocketPath
          : false
        : websocket._originalIpc
        ? false
        : parsedUrl.host === websocket._originalHostOrSocketPath;

      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
        //
        // Match curl 7.77.0 behavior and drop the following headers. These
        // headers are also dropped when following a redirect to a subdomain.
        //
        delete opts.headers.authorization;
        delete opts.headers.cookie;

        if (!isSameHost) delete opts.headers.host;

        opts.auth = undefined;
      }
    }

    //
    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
    // If the `Authorization` header is set, then there is nothing to do as it
    // will take precedence.
    //
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization =
        'Basic ' + Buffer.from(opts.auth).toString('base64');
    }

    req = websocket._req = request(opts);

    if (websocket._redirects) {
      //
      // Unlike what is done for the `'upgrade'` event, no early exit is
      // triggered here if the user calls `websocket.close()` or
      // `websocket.terminate()` from a listener of the `'redirect'` event. This
      // is because the user can also call `request.destroy()` with an error
      // before calling `websocket.close()` or `websocket.terminate()` and this
      // would result in an error being emitted on the `request` object with no
      // `'error'` event listeners attached.
      //
      websocket.emit('redirect', websocket.url, req);
    }
  } else {
    req = websocket._req = request(opts);
  }

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake$1(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req[kAborted]) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake$1(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake$1(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the
    // `'upgrade'` event.
    //
    if (websocket.readyState !== WebSocket$3.CONNECTING) return;

    req = websocket._req = null;

    if (res.headers.upgrade.toLowerCase() !== 'websocket') {
      abortHandshake$1(websocket, socket, 'Invalid Upgrade header');
      return;
    }

    const digest = createHash$1('sha1')
      .update(key + GUID$1)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake$1(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    let protError;

    if (serverProt !== undefined) {
      if (!protocolSet.size) {
        protError = 'Server sent a subprotocol but none was requested';
      } else if (!protocolSet.has(serverProt)) {
        protError = 'Server sent an invalid subprotocol';
      }
    } else if (protocolSet.size) {
      protError = 'Server sent no subprotocol';
    }

    if (protError) {
      abortHandshake$1(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse$1(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (
        extensionNames.length !== 1 ||
        extensionNames[0] !== PerMessageDeflate$1.extensionName
      ) {
        const message = 'Server indicated an extension that was not requested';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate$1.extensionName]);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      websocket._extensions[PerMessageDeflate$1.extensionName] =
        perMessageDeflate;
    }

    websocket.setSocket(socket, head, {
      generateMask: opts.generateMask,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });

  if (opts.finishRequest) {
    opts.finishRequest(req, websocket);
  } else {
    req.end();
  }
}

/**
 * Emit the `'error'` and `'close'` events.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket$3.CLOSING;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake$1(websocket, stream, message) {
  websocket._readyState = WebSocket$3.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake$1);

  if (stream.setHeader) {
    stream[kAborted] = true;
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    process.nextTick(emitErrorAndClose, websocket, err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    process.nextTick(cb, err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket$1];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket$1] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  const websocket = this[kWebSocket$1];

  if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket$1];

  if (websocket._socket[kWebSocket$1] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  websocket.emit('error', err);
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket$1].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
  this[kWebSocket$1].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket$1];

  websocket.pong(data, !websocket._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket$1].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket$1];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket$3.CLOSING;

  let chunk;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    (chunk = websocket._socket.read()) !== null
  ) {
    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket$1] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket$1]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket$1];

  websocket._readyState = WebSocket$3.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError$1() {
  const websocket = this[kWebSocket$1];

  this.removeListener('error', socketOnError$1);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket$3.CLOSING;
    this.destroy();
  }
}

const { Duplex } = require$$0$3;

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {Duplex} stream The stream.
 * @private
 */
function emitClose$1(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

    if (!duplex.push(data)) ws.pause();
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
    //
    // - If the `'error'` event is emitted before the `'open'` event, then
    //   `ws.terminate()` is a noop as no socket is assigned.
    // - Otherwise, the error is re-emitted by the listener of the `'error'`
    //   event of the `Receiver` object. The listener already closes the
    //   connection by calling `ws.close()`. This allows a close frame to be
    //   sent to the other peer. If `ws.terminate()` is called right after this,
    //   then the close frame might not be sent.
    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose$1, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose$1, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.isPaused) ws.resume();
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

var stream = createWebSocketStream;

const { tokenChars } = validationExports;

/**
 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
 *
 * @param {String} header The field value of the header
 * @return {Set} The subprotocol names
 * @public
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (
      i !== 0 &&
      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
    ) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c /* ',' */) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

var subprotocol$1 = { parse };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls|https$" }] */

const EventEmitter = eventsExports;
const http = require$$2;
requireNet();
const { createHash } = require$$5;

const extension = extension$1;
const PerMessageDeflate = permessageDeflate;
const subprotocol = subprotocol$1;
const WebSocket$2 = websocket;
const { GUID, kWebSocket } = constants;

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
   *     server to use
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
   *     class to use. It must be the `WebSocket` class or class that extends it
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      WebSocket: WebSocket$2,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) {
      this.clients = new Set();
      this._shouldEmitClose = false;
    }

    this.options = options;
    this._state = RUNNING;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Stop the server from accepting new connections and emit the `'close'` event
   * when all existing connections are closed.
   *
   * @param {Function} [cb] A one-time listener for the `'close'` event
   * @public
   */
  close(cb) {
    if (this._state === CLOSED) {
      if (cb) {
        this.once('close', () => {
          cb(new Error('The server is not running'));
        });
      }

      process.nextTick(emitClose, this);
      return;
    }

    if (cb) this.once('close', cb);

    if (this._state === CLOSING) return;
    this._state = CLOSING;

    if (this.options.noServer || this.options.server) {
      if (this._server) {
        this._removeListeners();
        this._removeListeners = this._server = null;
      }

      if (this.clients) {
        if (!this.clients.size) {
          process.nextTick(emitClose, this);
        } else {
          this._shouldEmitClose = true;
        }
      } else {
        process.nextTick(emitClose, this);
      }
    } else {
      const server = this._server;

      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // The HTTP/S server was created internally. Close it, and rely on its
      // `'close'` event.
      //
      server.close(() => {
        emitClose(this);
      });
    }
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key = req.headers['sec-websocket-key'];
    const version = +req.headers['sec-websocket-version'];

    if (req.method !== 'GET') {
      const message = 'Invalid HTTP method';
      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
      return;
    }

    if (req.headers.upgrade.toLowerCase() !== 'websocket') {
      const message = 'Invalid Upgrade header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (!key || !keyRegex.test(key)) {
      const message = 'Missing or invalid Sec-WebSocket-Key header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (version !== 8 && version !== 13) {
      const message = 'Missing or invalid Sec-WebSocket-Version header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (!this.shouldHandle(req)) {
      abortHandshake(socket, 400);
      return;
    }

    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    let protocols = new Set();

    if (secWebSocketProtocol !== undefined) {
      try {
        protocols = subprotocol.parse(secWebSocketProtocol);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Protocol header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
    const extensions = {};

    if (
      this.options.perMessageDeflate &&
      secWebSocketExtensions !== undefined
    ) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = extension.parse(secWebSocketExtensions);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        const message =
          'Invalid or unacceptable Sec-WebSocket-Extensions header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(
            extensions,
            key,
            protocols,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {Object} extensions The accepted extensions
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Set} protocols The subprotocols
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new this.options.WebSocket(null);

    if (protocols.size) {
      //
      // Optionally call external protocol selection handler.
      //
      const protocol = this.options.handleProtocols
        ? this.options.handleProtocols(protocols, req)
        : protocols.values().next().value;

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = extension.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, {
      maxPayload: this.options.maxPayload,
      skipUTF8Validation: this.options.skipUTF8Validation
    });

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);

        if (this._shouldEmitClose && !this.clients.size) {
          process.nextTick(emitClose, this);
        }
      });
    }

    cb(ws, req);
  }
}

var websocketServer = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  //
  // The socket is writable unless the user destroyed or ended it before calling
  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
  // error. Handling this does not make much sense as the worst that can happen
  // is that some of the data written by the user might be discarded due to the
  // call to `socket.end()` below, which triggers an `'error'` event that in
  // turn causes the socket to be destroyed.
  //
  message = message || http.STATUS_CODES[code];
  headers = {
    Connection: 'close',
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(message),
    ...headers
  };

  socket.once('finish', socket.destroy);

  socket.end(
    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      Object.keys(headers)
        .map((h) => `${h}: ${headers[h]}`)
        .join('\r\n') +
      '\r\n\r\n' +
      message
  );
}

/**
 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
 * one listener for it, otherwise call `abortHandshake()`.
 *
 * @param {WebSocketServer} server The WebSocket server
 * @param {http.IncomingMessage} req The request object
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} message The HTTP response body
 * @private
 */
function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
  if (server.listenerCount('wsClientError')) {
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

    server.emit('wsClientError', err, socket, req);
  } else {
    abortHandshake(socket, code, message);
  }
}

const WebSocket$1 = websocket;

WebSocket$1.createWebSocketStream = stream;
WebSocket$1.Server = websocketServer;
WebSocket$1.Receiver = receiver;
WebSocket$1.Sender = sender;

WebSocket$1.WebSocket = WebSocket$1;
WebSocket$1.WebSocketServer = WebSocket$1.Server;

var ws = WebSocket$1;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EventEmitter = exports.WebSocketImpl = exports.isBrowser = exports.isNodeJs = void 0;
	/* istanbul ignore file */
	const ws_1 = ws;
	const events_1 = eventsExports;
	exports.isNodeJs = typeof window === 'undefined';
	exports.isBrowser = typeof window !== 'undefined';
	exports.WebSocketImpl = exports.isNodeJs ? ws_1.WebSocket : WebSocket;
	exports.EventEmitter = events_1.EventEmitter; 
} (_1_socket));

Object.defineProperty(route, "__esModule", { value: true });
route.Route = void 0;
const _1_socket_1$7 = _1_socket;
/**
 * A Route is a path and corresponds to a state.
 * The daemon keeps a local cache of all registered routes and all momentary values.
 * The corresponding owner of a route is also remembered
 */
class Route extends _1_socket_1$7.EventEmitter {
    owner;
    value;
    path;
    constructor(owner, path, value = undefined) {
        super();
        this.owner = owner;
        this.value = value;
        this.path = path;
    }
    updateValue = (newValue) => {
        if (newValue === this.value)
            return;
        this.value = newValue;
        this.emit('Change', this.path, newValue);
    };
    remove = () => this.emit('Remove', this.path);
}
route.Route = Route;

var server = {};

var _2_jsonrpc = {};

var messages = {};

Object.defineProperty(messages, "__esModule", { value: true });
messages.castMessage = void 0;
const errors_1$4 = errors;
const castMessage = (msg) => {
    if (!('method' in msg))
        throw new errors_1$4.invalidRequest('No method');
    const method = msg.method;
    const params = msg.params;
    switch (method) {
        case 'info':
            return msg;
        case 'configure':
            if (!params || !('name' in params))
                throw new errors_1$4.InvalidArgument('Only params.name supported');
            return msg;
        case 'unfetch':
            if (!params || !('id' in params))
                throw new errors_1$4.InvalidArgument('Fetch id required');
            return msg;
        default:
            if (!params || !('path' in params))
                throw new errors_1$4.InvalidArgument('Path required');
    }
    switch (method) {
        case 'fetch':
            if (!('id' in params))
                throw new errors_1$4.InvalidArgument('Fetch id required');
            return msg;
        case 'change':
        case 'set':
            if (!('value' in params))
                throw new errors_1$4.InvalidArgument('Value required');
            return msg;
        default:
            return msg;
    }
};
messages.castMessage = castMessage;

var socket = {};

var messageSocket = {};

Object.defineProperty(messageSocket, "__esModule", { value: true });
messageSocket.MessageSocket = void 0;
/* istanbul ignore file */
const net_1$1 = requireNet();
const _1$4 = _1_socket;
/**
 * Class Message socket
 */
class MessageSocket extends _1$4.EventEmitter {
    last = Buffer.alloc(0);
    len = -1;
    socket;
    constructor(port, ip = '') {
        super();
        if (port instanceof net_1$1.Socket) {
            this.socket = port;
        }
        else {
            this.socket = (0, net_1$1.connect)(port, ip);
            this.socket.on('connect', () => {
                this.emit('open');
            });
        }
        this.socket.on('data', (buf) => {
            let bigBuf = Buffer.concat([this.last, buf]);
            while (true) {
                // eslint-disable-line no-constant-condition
                if (this.len < 0) {
                    if (bigBuf.length < 4) {
                        this.last = bigBuf;
                        return;
                    }
                    else {
                        this.len = bigBuf.readUInt32BE(0);
                        bigBuf = bigBuf.subarray(4);
                    }
                }
                if (this.len > 0) {
                    if (bigBuf.length < this.len) {
                        this.last = bigBuf;
                        return;
                    }
                    else {
                        this.emit('message', bigBuf.toString(undefined, 0, this.len));
                        bigBuf = bigBuf.subarray(this.len);
                        this.len = -1;
                    }
                }
            }
        });
        this.socket.setNoDelay(true);
        this.socket.setKeepAlive(true);
        this.socket.once('close', () => {
            this.emit('close');
        });
        this.socket.once('error', (e) => {
            this.emit('error', e);
        });
    }
    /**
     * Send.
     */
    send(msg) {
        const utf8Length = Buffer.byteLength(msg, 'utf8');
        const buf = Buffer.alloc(4 + utf8Length);
        buf.writeUInt32BE(utf8Length, 0);
        buf.write(msg, 4);
        process.nextTick(() => {
            this.socket.write(buf);
            this.emit('sent', msg);
        });
    }
    /**
     * Close.
     */
    close() {
        this.socket.end();
    }
    /**
     * addEventListener method needed for MessageSocket to be used in the browser.
     * It is a wrapper for plain EventEmitter events like ms.on('...', callback).
     *
     * npm module 'ws' also comes with this method.
     * See https://github.com/websockets/ws/blob/master/lib/WebSocket.js#L410
     * That way we can use node-jet with via browserify inside the browser.
     */
    addEventListener(method, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onMessage = (data) => {
            listener.call(this, new MessageEvent('data', { data: data }));
        };
        const onClose = (code, message) => {
            listener.call(this, new CloseEvent(code, message));
        };
        const onError = (event) => {
            listener.call(this, event);
        };
        const onOpen = () => {
            listener.call(this, new Event('open'));
        };
        if (typeof listener === 'function') {
            let cb;
            switch (method) {
                case 'message':
                    cb = onMessage;
                    break;
                case 'close':
                    cb = onClose;
                    break;
                case 'error':
                    cb = onError;
                    break;
                case 'open':
                    cb = onOpen;
                    break;
                default:
                    cb = listener;
            }
            this.on(method, cb);
        }
    }
}
messageSocket.MessageSocket = MessageSocket;
messageSocket.default = MessageSocket;

var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(socket, "__esModule", { value: true });
socket.Socket = void 0;
/* istanbul ignore file */
const ws_1$1 = ws;
const message_socket_1$1 = __importDefault$3(messageSocket);
const _1$3 = _1_socket;
/** Socket instance.
 * @class
 * @classdesc Class used as Interface to communicate between the native socket connection and the json rpc layer.
 */
class Socket {
    id = '';
    sock;
    type = '';
    constructor(socket) {
        if (socket) {
            this.sock = socket;
            this.type = socket.constructor.name === 'MessageSocket' ? 'ms' : 'ws';
        }
    }
    /**
     * Method to connect to Server
     * @param url url to connect to
     * @param ip Ip address to connect to only valid in combination with port
     * @param port Port used to connect
     */
    connect = (url = undefined, ip = undefined, port = undefined) => {
        if (_1$3.isBrowser) {
            this.sock = new WebSocket(url || `ws://${window.location.host}:${port || 2315}`, 'jet');
            this.type = 'ws';
        }
        else if (_1$3.isNodeJs && url) {
            this.sock = new ws_1$1.WebSocket(url, 'jet');
            this.type = 'ws';
        }
        else {
            this.sock = new message_socket_1$1.default(port || 11122, ip);
            this.type = 'ms';
        }
    };
    /**
     * Closes the native socket connection
     */
    close = () => {
        if (this.sock)
            this.sock.close();
    };
    /**
     * Listening to socket events to socket events
     * @param event  "close": CloseEvent;"error": Event;"message": MessageEvent;"open": Event;
     * @param cb callback that is invoked when event is triggered
     * @emits CloseEvent in case of closing of the native socket
     * @emits Event in case of established socket connection
     * @emits MessageEvent in case of received message
     * @emits Event in case of error
     */
    addEventListener = (event, cb) => {
        if ((this.type === 'ws' && _1$3.isBrowser) || this.type === 'ms') {
            this.sock.addEventListener(event, cb);
        }
        else if (this.type === 'ws' && _1$3.isNodeJs) {
            this.sock.addEventListener(event, cb);
        }
        else {
            throw Error('Could not detect socket type');
        }
    };
    /**
     * sending a message via the native socket
     * @param message //string that represents the message to send
     */
    send = (message) => {
        this.sock?.send(message);
    };
}
socket.Socket = Socket;

Object.defineProperty(_2_jsonrpc, "__esModule", { value: true });
_2_jsonrpc.JsonRPC = void 0;
const errors_1$3 = errors;
const messages_1 = messages;
const socket_1$2 = socket;
const _1_socket_1$6 = _1_socket;
/**
 * Helper shorthands.
 */
const encode = JSON.stringify;
const decode = JSON.parse;
const isResultMessage = (msg) => {
    return 'result' in msg;
};
const isErrorMessage = (msg) => {
    return 'error' in msg;
};
/**
 * JsonRPC Instance
 * class used to interpret jsonrpc messages. This class can parse incoming socket messages to jsonrpc messages and fires events
 */
class JsonRPC extends _1_socket_1$6.EventEmitter {
    sock;
    config;
    messages = [];
    messageId = 1;
    _isOpen = false;
    openRequests = {};
    batchPromises = [];
    requestId = '';
    resolveDisconnect;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rejectDisconnect;
    disconnectPromise;
    resolveConnect;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rejectConnect;
    connectPromise;
    logger;
    abortController;
    sendImmediate;
    constructor(logger, config, sock) {
        super();
        this.config = config || {};
        this.sendImmediate = config?.batches ? false : true;
        this.createDisconnectPromise();
        this.createConnectPromise();
        this.logger = logger;
        if (sock) {
            this.sock = sock;
            this._isOpen = true;
            this.subscribeToSocketEvents();
        }
    }
    /**
     * Method called before disconnecting from the device to initialize Promise, that is only resolved when disconnected
     */
    createDisconnectPromise = () => {
        this.disconnectPromise = new Promise((resolve, reject) => {
            this.resolveDisconnect = resolve;
            this.rejectDisconnect = reject;
        });
    };
    /**
     * Method called before connecting to the device to initialize Promise, that is only resolved when a connection is established
     */
    createConnectPromise = () => {
        this.connectPromise = new Promise((resolve, reject) => {
            this.resolveConnect = resolve;
            this.rejectConnect = reject;
        });
    };
    /**
     * Method called to subscribe to all relevant socket events
     */
    subscribeToSocketEvents = () => {
        this.sock.addEventListener('error', this._handleError);
        this.sock.addEventListener('message', this._handleMessage);
        this.sock.addEventListener('open', () => {
            this._isOpen = true;
            this.createDisconnectPromise();
            if (this.abortController.signal.aborted) {
                this.logger.warn('user requested abort');
                this.close();
                this.rejectConnect();
            }
            else {
                this.resolveConnect();
            }
        });
        this.sock.addEventListener('close', () => {
            this._isOpen = false;
            this.resolveDisconnect();
            this.createConnectPromise();
        });
    };
    /**
     * Method to connect to a Server instance. Either TCP Server or Webserver
     * @params controller: an AbortController that can be used to abort the connection
     */
    connect = (controller = new AbortController()) => {
        if (this._isOpen) {
            return Promise.resolve();
        }
        this.abortController = controller;
        const config = this.config;
        this.sock = new socket_1$2.Socket();
        this.sock.connect(config.url, config.ip, config.port || 11122);
        this.subscribeToSocketEvents();
        return this.connectPromise;
    };
    /**
     * Close.
     */
    close = () => {
        if (!this._isOpen) {
            return Promise.resolve();
        }
        this.send();
        this.sock.close();
        return this.disconnectPromise;
    };
    _handleError = (err) => {
        this.logger.error(`Error in socket connection: ${err}`);
        if (!this._isOpen) {
            this.rejectConnect(err);
        }
    };
    _convertMessage = (message) => {
        if (message instanceof Blob) {
            return message.arrayBuffer().then((buf) => new TextDecoder().decode(buf));
        }
        return Promise.resolve(message);
    };
    /**
     * _dispatchMessage
     *
     * @api private
     */
    _handleMessage = (event) => {
        this._convertMessage(event.data).then((message) => {
            this.logger.sock(`Received message: ${message}`);
            let decoded;
            try {
                decoded = decode(message);
                if (Array.isArray(decoded)) {
                    for (let i = 0; i < decoded.length; i++) {
                        this._dispatchSingleMessage(decoded[i]);
                    }
                }
                else {
                    this._dispatchSingleMessage(decoded);
                }
                this.send();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (err) {
                const decodedId = (decoded && decoded.id) || '';
                this.respond(decodedId, new errors_1$3.ParseError(message), false);
                this.logger.error(err);
            }
        });
    };
    /**
     * _dispatchSingleMessage
     *
     * @api private
     */
    _dispatchSingleMessage = (message) => {
        if (isResultMessage(message) || isErrorMessage(message)) {
            this._dispatchResponse(message);
        }
        else {
            this._dispatchRequest((0, messages_1.castMessage)(message));
        }
    };
    /**
     * _dispatchResponse
     *
     * @api private
     */
    _dispatchResponse = (message) => {
        const mid = message.id;
        if (isResultMessage(message)) {
            this.successCb(mid, message.result);
        }
        if (isErrorMessage(message)) {
            this.errorCb(mid, message.error);
        }
    };
    /**
     * _dispatchRequest.
     * Handles both method calls and fetchers (notifications)
     *
     * @api private
     */
    _dispatchRequest = (message) => {
        if (this.listenerCount(message.method) === 0) {
            this.logger.error(`Method ${message.method} is unknown`);
            this.respond(message.id, new errors_1$3.methodNotFoundError(message.method), false);
        }
        else {
            this.emit(message.method, this, message.id, message.params);
        }
    };
    /**
     * Queue.
     */
    queue = (message, id = '') => {
        if (!this._isOpen) {
            return Promise.reject(new errors_1$3.ConnectionClosed());
        }
        if (id) {
            this.messages.push({ method: id, params: message });
        }
        else {
            this.messages.push(message);
        }
        if (this.sendImmediate) {
            return this.send();
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Send.
     */
    send = () => {
        if (this.messages.length > 0) {
            const encoded = encode(this.messages.length === 1 ? this.messages[0] : this.messages);
            this.logger.sock(`Sending message:  ${encoded}`);
            this.sock.send(encoded);
            this.messages = [];
        }
        else {
            return Promise.resolve();
        }
        return Promise.all(this.batchPromises)
            .then((res) => {
            this.batchPromises = [];
            return Promise.resolve(res);
        })
            .catch((ex) => {
            this.batchPromises = [];
            this.logger.error(JSON.stringify(ex));
            return Promise.reject(ex);
        });
    };
    /**
     * Responding a request
     * @param id the request id to respond to
     * @param params the result of the request
     * @param success if the request was fulfilled
     */
    respond = (id, params, success) => {
        this.queue({ id, [success ? 'result' : 'error']: params });
    };
    successCb = (id, result) => {
        if (id in this.openRequests) {
            this.openRequests[id].resolve(result);
            delete this.openRequests[id];
        }
    };
    errorCb = (id, error) => {
        if (id in this.openRequests) {
            this.openRequests[id].reject(error);
            delete this.openRequests[id];
        }
    };
    /**
     * Method to send a request to a JSONRPC Server.
     */
    sendRequest = (method, params, immediate = undefined) => {
        const promise = new Promise((resolve, reject) => {
            if (!this._isOpen) {
                reject(new errors_1$3.ConnectionClosed());
            }
            else {
                const rpcId = this.messageId.toString();
                this.messageId++;
                this.openRequests[rpcId] = { resolve, reject };
                this.queue({
                    id: rpcId.toString(),
                    method,
                    params
                });
                if (immediate) {
                    this.send();
                }
            }
        });
        this.batchPromises.push(promise);
        if (immediate || this.sendImmediate)
            return promise.catch((err) => {
                this.logger.error(JSON.stringify(err));
                return Promise.reject(err);
            });
        else {
            return Promise.resolve({});
        }
    };
}
_2_jsonrpc.JsonRPC = JsonRPC;
_2_jsonrpc.default = JsonRPC;

var tcpserver = {};

var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(tcpserver, "__esModule", { value: true });
tcpserver.TCPServer = void 0;
/* istanbul ignore file */
const net_1 = requireNet();
const _1$2 = _1_socket;
const message_socket_1 = __importDefault$2(messageSocket);
const socket_1$1 = socket;
/**
 * Class implementation of a TCP server. This implementation only runs in a node.js environment
 */
class TCPServer extends _1$2.EventEmitter {
    config;
    tcpServer;
    connectionId = 1;
    /**
     * Constructor to create a TCP Server instance
     */
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * This function starts a TCP server listening on the port specified in the config
     */
    listen() {
        this.tcpServer = (0, net_1.createServer)((peerSocket) => {
            const sock = new socket_1$1.Socket(new message_socket_1.default(peerSocket));
            sock.id = `ws_${this.connectionId}`;
            this.connectionId++;
            peerSocket.addListener('close', () => {
                this.emit('disconnect', sock);
            });
            this.emit('connection', sock);
        });
        this.tcpServer.listen(this.config.tcpPort);
    }
    /**
     * Function to stop the TCP server
     */
    close() {
        this.tcpServer.close();
    }
}
tcpserver.TCPServer = TCPServer;

var wsserver = {};

Object.defineProperty(wsserver, "__esModule", { value: true });
wsserver.WebsocketServer = void 0;
/* istanbul ignore file */
const _1$1 = _1_socket;
const ws_1 = ws;
const socket_1 = socket;
/**
 * Class implementation of a WS server. This implementation only runs in a node.js environment
 */
class WebsocketServer extends _1$1.EventEmitter {
    config;
    wsServer;
    connectionId = 1;
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * method to start listening on incoming websocket connections. Incoming websocket connections are validated if they accept jet protocol
     */
    listen() {
        this.wsServer = new ws_1.WebSocketServer({
            port: this.config.wsPort,
            server: this.config.server,
            path: this.config.wsPath,
            handleProtocols: (protocols) => {
                if (protocols.has('jet')) {
                    return 'jet';
                }
                else {
                    return false;
                }
            }
        });
        this.wsServer.on('connection', (ws) => {
            const sock = new socket_1.Socket(ws);
            sock.id = `ws_${this.connectionId}`;
            this.connectionId++;
            const pingMs = this.config.wsPingInterval || 5000;
            let pingInterval;
            if (pingMs) {
                pingInterval = setInterval(() => {
                    if (ws.readyState === _1$1.WebSocketImpl.OPEN) {
                        ws.ping();
                    }
                }, pingMs);
            }
            ws.addListener('close', () => {
                clearInterval(pingInterval);
                this.emit('disconnect', sock);
            });
            ws.addListener('disconnect', () => {
                this.emit('disconnect', sock);
            });
            this.emit('connection', sock);
        });
    }
    /** Method to stop Websocket server */
    close() {
        this.wsServer.close();
    }
}
wsserver.WebsocketServer = WebsocketServer;

var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(server, "__esModule", { value: true });
server.JsonRPCServer = void 0;
const _1 = __importDefault$1(_2_jsonrpc);
const _1_socket_1$5 = _1_socket;
const tcpserver_1 = tcpserver;
const wsserver_1 = wsserver;
/**
 * JSONRPCServer instance
 */
class JsonRPCServer extends _1_socket_1$5.EventEmitter {
    config;
    tcpServer;
    wsServer;
    connections = {};
    log;
    batches;
    constructor(log, config, batches = false) {
        super();
        this.config = config;
        this.batches = batches;
        this.log = log;
    }
    listen = () => {
        if (this.config.tcpPort) {
            this.tcpServer = new tcpserver_1.TCPServer(this.config);
            this.tcpServer.addListener('connection', (sock) => {
                const jsonRpc = new _1.default(this.log, { batches: this.batches }, sock);
                this.connections[sock.id] = jsonRpc;
                this.emit('connection', jsonRpc);
            });
            this.tcpServer.addListener('disconnect', (sock) => {
                this.emit('disconnect', this.connections[sock.id]);
                delete this.connections[sock.id];
            });
            this.tcpServer.listen();
        }
        if (this.config.wsPort || this.config.server) {
            this.wsServer = new wsserver_1.WebsocketServer(this.config);
            this.wsServer.addListener('connection', (sock) => {
                const jsonRpc = new _1.default(this.log, { batches: this.batches }, sock);
                this.connections[sock.id] = jsonRpc;
                this.emit('connection', jsonRpc);
            });
            this.wsServer.addListener('disconnect', (sock) => {
                this.emit('disconnect', this.connections[sock.id]);
                delete this.connections[sock.id];
            });
            this.wsServer.listen();
        }
    };
    close = () => {
        if (this.tcpServer) {
            this.tcpServer.close();
        }
        if (this.wsServer) {
            this.wsServer.close();
        }
    };
}
server.JsonRPCServer = JsonRPCServer;

Object.defineProperty(daemon$1, "__esModule", { value: true });
daemon$1.Daemon = void 0;
const log_1$1 = log;
const path_matcher_1 = path_matcher;
const subscription_1$2 = subscription;
const route_1 = route;
const errors_1$2 = errors;
const server_1 = server;
const _1_socket_1$4 = _1_socket;
const version = '2.2.0';
const defaultListenOptions = {
    tcpPort: 11122,
    wsPort: 11123
};
class InfoObject {
    name;
    version;
    protocolVersion;
    features;
    constructor(options) {
        this.name = options.name || 'node-jet';
        this.version = version;
        this.protocolVersion = '1.1.0';
        this.features = {
            batches: options.features?.batches || false,
            fetch: options.features?.fetch || 'full',
            asNotification: options.features?.asNotification || false
        };
        if (options.features?.authenticate) {
            this.features.authenticate = true;
        }
    }
}
/**
 * Creates a Daemon instance
 *
 * In most cases you need one Jet Daemon instance running.
 * All Peers connect to it as in typical master(Daemon) slave(Peer)
 * architectures.
 *
 */
class Daemon extends _1_socket_1$4.EventEmitter {
    infoObject;
    log;
    jsonRPCServer;
    routes = {};
    subscriber = [];
    user = undefined;
    authenticated = false;
    /**
     * Constructor for creating the instance
     * @param {DaemonOptions & InfoOptions} [options] Options for the daemon creation
     */
    constructor(options = {}) {
        super();
        if (options.username && options.password) {
            if (!options.features) {
                options.features = {};
            }
            options.features.authenticate = true;
        }
        else {
            this.authenticated = true;
        }
        this.infoObject = new InfoObject(options);
        this.log = new log_1$1.Logger(options.log);
    }
    asNotification = () => this.infoObject.features.asNotification;
    simpleFetch = () => this.infoObject.features.fetch === 'simple';
    respond = (peer, id) => {
        if (this.asNotification()) {
            peer.respond(id, {}, true);
            this.emit('notify');
        }
        else {
            this.emit('notify');
            peer.respond(id, {}, true);
        }
    };
    authenticate = (peer, id, params) => {
        if (!this.user) {
            peer.respond(id, {}, true);
            return;
        }
        if (params.user === this.user.user &&
            params.password === this.user.password) {
            this.authenticated = true;
            peer.respond(id, {}, true);
        }
        else {
            this.authenticated = false;
            peer.respond(id, new errors_1$2.InvvalidCredentials(params.user), false);
        }
    };
    /*
    Add as Notification: The message is acknowledged,then all the peers are informed about the new state
    Add synchronous: First all Peers are informed about the new value then message is acknowledged
    */
    add = (peer, id, params) => {
        const path = params.path;
        if (path in this.routes) {
            peer.respond(id, new errors_1$2.Occupied(path), false);
            return;
        }
        this.routes[path] = new route_1.Route(peer, path, params.value);
        if (typeof params.value !== 'undefined') {
            this.subscriber.forEach((fetchRule) => {
                if (this.simpleFetch() || fetchRule.matchesPath(path)) {
                    fetchRule.addRoute(this.routes[path]);
                }
            });
        }
        this.respond(peer, id);
    };
    /*
    Change as Notification: The message is acknowledged,then all the peers are informed about the value change
    change synchronous: First all Peers are informed about the new value then the message is acknowledged
    */
    change = (peer, id, msg) => {
        if (msg.path in this.routes && typeof msg.value !== 'undefined') {
            this.routes[msg.path].updateValue(msg.value);
            this.respond(peer, id);
        }
        else {
            peer.respond(id, new errors_1$2.NotFound(), false);
        }
    };
    /*
    Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
    Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
    */
    fetch = (peer, id, msg) => {
        if (this.simpleFetch() &&
            this.subscriber.find((sub) => sub.owner === peer)) {
            peer.respond(id, new errors_1$2.ConnectionInUse('Only one fetcher per peer in simple fetch Mode'), false);
            return;
        }
        if (this.subscriber.find((sub) => sub.id === msg.id)) {
            peer.respond(id, new errors_1$2.Occupied('FetchId already in use'), false);
            return;
        }
        try {
            const sub = new subscription_1$2.Subscription(msg, peer);
            this.addListener('notify', sub.send);
            this.subscriber.push(sub);
            sub.setRoutes(Object.values(this.routes).filter((route) => this.routes[route.path].value !== undefined && //check if state
                (this.simpleFetch() || sub.matchesPath(route.path)) //check if simpleFetch or pathrule matches
            ));
            this.respond(peer, id);
        }
        catch (err) {
            peer.respond(id, err, false);
        }
    };
    /*
    Unfetch synchronous: Unfetch fires and no more updates are send with the given fetch_id. Message is acknowledged
    */
    unfetch = (peer, id, params) => {
        const subIdx = this.subscriber.findIndex((fetch) => fetch.id === params.id);
        if (subIdx < 0) {
            peer.respond(id, new errors_1$2.NotFound(`No Subscription with id ${params.id} found`), false);
            return;
        }
        if (this.subscriber[subIdx].owner !== peer) {
            peer.respond(id, new errors_1$2.notAllowed(`Peer does not own subscription with id ${params.id}`), false);
            return;
        }
        this.subscriber[subIdx].close();
        this.subscriber.splice(subIdx, 1);
        peer.respond(id, {}, true);
    };
    /*
    Get synchronous: Only synchronous implementation-> all the values are added to an array and send as response
    */
    get = (peer, id, params) => {
        try {
            const matcher = (0, path_matcher_1.createPathMatcher)(params);
            const resp = Object.keys(this.routes)
                .filter((route) => matcher(route))
                .map((route) => {
                return { path: route, value: this.routes[route].value };
            });
            peer.respond(id, resp, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (ex) {
            peer.respond(id, ex, false);
        }
    };
    /*
    remove synchronous: Only synchronous implementation-> state is removed then message is acknowledged
    */
    remove = (peer, id, params) => {
        const route = params.path;
        if (!(route in this.routes)) {
            peer.respond(id, new errors_1$2.NotFound(route), false);
            return;
        }
        this.routes[route].remove();
        delete this.routes[route];
        this.respond(peer, id);
    };
    /*
    Call and Set requests: Call and set requests are always forwarded synchronous
    */
    forward = (method, params) => {
        if (!(params.path in this.routes)) {
            return Promise.reject(new errors_1$2.NotFound(params.path));
        }
        return this.routes[params.path].owner.sendRequest(method, params, true);
    };
    /*
    Info requests: Info requests are always synchronous
    */
    info = (peer, id) => {
        peer.respond(id, this.infoObject, true);
    };
    configure = (peer, id) => {
        peer.respond(id, {}, true);
    };
    filterRoutesByPeer = (peer) => Object.entries(this.routes)
        .filter(([, route]) => route.owner === peer)
        .map((el) => el[0]);
    /**
     * This function starts to listen on the specified port
     * @param listenOptions
     */
    listen = (listenOptions = defaultListenOptions) => {
        this.jsonRPCServer = new server_1.JsonRPCServer(this.log, listenOptions, this.infoObject.features.batches);
        this.jsonRPCServer.addListener('connection', (newPeer) => {
            this.log.info('Peer connected');
            newPeer.addListener('info', this.info);
            newPeer.addListener('configure', this.configure);
            newPeer.addListener('add', this.add);
            newPeer.addListener('change', this.change);
            newPeer.addListener('remove', this.remove);
            newPeer.addListener('get', this.get);
            newPeer.addListener('fetch', this.fetch);
            newPeer.addListener('unfetch', this.unfetch);
            newPeer.addListener('set', (_peer, id, params) => this.forward('set', params)
                .then((res) => {
                newPeer.respond(id, res, true);
                newPeer.send();
            })
                .catch((err) => {
                newPeer.respond(id, err, false);
                newPeer.send();
            }));
            newPeer.addListener('call', (_peer, id, params) => this.forward('call', params)
                .then((res) => {
                newPeer.respond(id, res, true);
                newPeer.send();
            })
                .catch((err) => {
                newPeer.respond(id, err, false);
                newPeer.send();
            }));
        });
        this.jsonRPCServer.addListener('disconnect', (peer) => {
            this.filterRoutesByPeer(peer).forEach((route) => {
                this.log.warn('Removing route that was owned by peer');
                this.routes[route].remove();
                delete this.routes[route];
            });
            this.subscriber = this.subscriber.filter((fetcher) => {
                if (fetcher.owner !== peer) {
                    return true;
                }
                fetcher.close();
                return false;
            });
        });
        this.jsonRPCServer.listen();
        this.log.info('Daemon started');
    };
    close = () => {
        this.jsonRPCServer.close();
    };
}
daemon$1.Daemon = Daemon;
daemon$1.default = Daemon;

var peer$1 = {};

var fetcher = {};

Object.defineProperty(fetcher, "__esModule", { value: true });
fetcher.Fetcher = void 0;
const _1_socket_1$3 = _1_socket;
const subscription_1$1 = subscription;
class Fetcher extends _1_socket_1$3.EventEmitter {
    message = { id: '' };
    valueRules = {};
    constructor() {
        super();
        this.setMaxListeners(0);
    }
    path = (key, value) => {
        if (!this.message.path) {
            this.message.path = {};
        }
        this.message.path[key] = value;
        return this;
    };
    value = (operator, value, field = '') => {
        if (!this.message.value) {
            this.message.value = {};
        }
        this.message.value[field] = {
            operator,
            value
        };
        return this;
    };
    matches = (path, value) => {
        const sub = new subscription_1$1.Subscription(this.message);
        return sub.matchesPath(path) && sub.matchesValue(value);
    };
    differential = () => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.asArray = false;
        return this;
    };
    ascending = () => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.descending = false;
        return this;
    };
    descending = () => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.descending = true;
        return this;
    };
    sortByValue = (key = '') => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.by = key ? `value.${key}` : 'value';
        return this;
    };
    sortByPath = () => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.by = 'path';
        return this;
    };
    range = (_from, _to) => {
        if (!this.message.sort) {
            this.message.sort = {};
        }
        this.message.sort.from = _from;
        this.message.sort.to = _to;
        return this;
    };
}
fetcher.Fetcher = Fetcher;
fetcher.default = Fetcher;

const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;
let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    require$$5.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    require$$5.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
let random = bytes => {
  fillPool((bytes -= 0));
  return pool.subarray(poolOffset - bytes, poolOffset)
};
let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  let step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length);
  return (size = defaultSize) => {
    let id = '';
    while (true) {
      let bytes = getRandom(step);
      let i = step;
      while (i--) {
        id += alphabet[bytes[i] & mask] || '';
        if (id.length === size) return id
      }
    }
  }
};
let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random);
let nanoid = (size = 21) => {
  fillPool((size -= 0));
  let id = '';
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

var nanoid$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	customAlphabet: customAlphabet,
	customRandom: customRandom,
	nanoid: nanoid,
	random: random,
	urlAlphabet: urlAlphabet
});

var require$$8 = /*@__PURE__*/getAugmentedNamespace(nanoid$1);

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(peer$1, "__esModule", { value: true });
peer$1.Peer = void 0;
const types_1 = types;
const _2_jsonrpc_1 = __importDefault(_2_jsonrpc);
const fetcher_1 = __importDefault(fetcher);
const log_1 = log;
const utils_1 = utils;
const errors_1$1 = errors;
const subscription_1 = subscription;
const _1_socket_1$2 = _1_socket;
const nanoid_1 = require$$8;
const fallbackDaemonInfo = {
    name: 'unknown-daemon',
    version: '0.0.0',
    protocolVersion: '1.0.0',
    features: {
        fetch: 'full',
        batches: true,
        asNotification: false
    }
};
/**
 * Create a Jet Peer instance.
 * @class
 * @classdesc A Peer instance is required for all actions related to Jet.
 * A Peer connected to a Daemon is able to add content (States/Methods)
 * or to consume content (by fetching or by calling set).
 * The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
 * When specifying the url field, the peer uses the Websocket protocol as transport.
 * If no config is provided, the Peer connects to the local ('localhost') Daemon using
 * the trivial protocol.
 * Browsers do only support the Websocket transport and must be provided with a config with url field.
 *
 * @param {PeerConfig} [config] A peer configuration
 * @param {string} [config.url] The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
 * @param {string} [config.ip=localhost] The Jet Daemon TCP trivial protocol ip
 * @param {number} [config.port=11122] The Jet Daemon TCP trivial protocol port
 * @param {string} [config.user] The user name used for authentication
 * @param {string} [config.password] The user's password used for auhtentication
 * @returns {Peer} The newly created Peer instance.
 *
 * @example
 * var peer = new jet.Peer({url: 'ws://jetbus.io:8080'})
 */
class Peer extends _1_socket_1$2.EventEmitter {
    #config;
    #jsonrpc;
    #daemonInfo = fallbackDaemonInfo;
    #routes = {};
    #fetcher = {};
    #log;
    cache = {};
    constructor(config, sock) {
        super();
        this.#config = config || {};
        this.#log = new log_1.Logger(this.#config.log);
        this.#jsonrpc = new _2_jsonrpc_1.default(this.#log, config, sock);
        this.#jsonrpc.addListener('get', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const state = this.#routes[m.path];
                if (!(0, utils_1.isState)(state)) {
                    const error = new errors_1$1.invalidMethod(`Tried to get value of ${m.path} which is a method`);
                    this.#log.error(error.toString());
                    this.#jsonrpc.respond(id, error, false);
                }
                else {
                    this.#jsonrpc.respond(id, state.toJson(), true);
                }
            }
            else {
                this.#jsonrpc.respond(id, new errors_1$1.NotFound(m.path), false);
            }
        });
        this.#jsonrpc.addListener('set', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const state = this.#routes[m.path];
                if (!(0, utils_1.isState)(state)) {
                    const error = new errors_1$1.invalidMethod(`Tried to set ${m.path} which is a method`);
                    this.#log.error(error.toString());
                    this.#jsonrpc.respond(id, error, false);
                    return;
                }
                try {
                    state.emit('set', m.value);
                    state.value(m.value);
                    this.#jsonrpc.respond(id, state.toJson(), true);
                }
                catch (err) {
                    this.#jsonrpc.respond(id, new errors_1$1.InvalidParamError('InvalidParam', 'Failed to set value', err && typeof err == 'object' ? err.toString() : undefined), false);
                }
            }
            else {
                const error = new errors_1$1.NotFound(m.path);
                this.#log.error(error.toString());
                this.#jsonrpc.respond(id, error, false);
            }
        });
        this.#jsonrpc.addListener('call', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const method = this.#routes[m.path];
                if ((0, utils_1.isState)(method)) {
                    const error = new errors_1$1.invalidMethod(`Tried to call ${m.path} which is a state`);
                    this.#log.error(error.toString());
                    this.#jsonrpc.respond(id, error, false);
                    return;
                }
                method.call(m.args);
                this.#jsonrpc.respond(id, {}, true);
            }
            else {
                const error = new errors_1$1.NotFound(m.path);
                this.#log.error(error.toString());
                this.#jsonrpc.respond(id, error, false);
            }
        });
        this.#jsonrpc.addListener(types_1.fetchSimpleId, (_peer, _id, m) => {
            this.cache[m.path] = m;
            Object.values(this.#fetcher).forEach((fetcher) => {
                if (fetcher.matches(m.path, m.value)) {
                    fetcher.emit('data', m);
                }
            });
        });
    }
    isConnected = () => this.#jsonrpc._isOpen;
    unfetch = (fetcher) => {
        const [id] = Object.entries(this.#fetcher).find(([, f]) => f === fetcher) || [null, null];
        if (!id)
            return Promise.reject('Could not find fetcher');
        if (!this.fetchFull()) {
            if (Object.keys(this.#fetcher).length === 2) {
                const param = { id: types_1.fetchSimpleId };
                return this.#jsonrpc
                    .sendRequest('unfetch', param)
                    .then(() => delete this.#fetcher[id])
                    .then(() => Promise.resolve());
            }
            else {
                delete this.#fetcher[id];
                return Promise.resolve();
            }
        }
        else {
            return this.#jsonrpc.sendRequest('unfetch', { id }).then(() => {
                delete this.#fetcher[id];
                return Promise.resolve();
            });
        }
    };
    fetchFull = () => this.#daemonInfo.features?.fetch === 'full';
    fetch = (fetcher) => {
        //check if daemon accepts path and value rules for fetching
        // otherwise rules must be applied on peer side
        const fetchFull = this.fetchFull();
        const fetcherId = `f_${(0, nanoid_1.nanoid)(5)}`;
        this.#fetcher[fetcherId] = fetcher;
        if (fetchFull) {
            const params = {
                ...fetcher.message,
                id: fetcherId
            };
            this.#jsonrpc.addListener(fetcherId, (_peer, _id, args) => {
                if (fetcherId in this.#fetcher)
                    this.#fetcher[fetcherId].emit('data', args);
            });
            return this.#jsonrpc
                .sendRequest('fetch', params)
                .then(() => Promise.resolve());
        }
        const sub = new subscription_1.Subscription(fetcher.message);
        Object.values(this.cache)
            .filter((entry) => sub.matchesPath(entry.path) && sub.matchesValue(entry.value))
            .forEach((entry) => {
            fetcher.emit('data', entry);
        });
        if (!(types_1.fetchSimpleId in this.#fetcher)) {
            //create dummy fetcher to
            this.#fetcher[types_1.fetchSimpleId] = new fetcher_1.default();
            const params = { id: types_1.fetchSimpleId, path: { startsWith: '' } };
            return this.#jsonrpc
                .sendRequest('fetch', params)
                .then(() => Promise.resolve());
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Actually connect the peer to the Jet Daemon
     * After the connect Promise has been resolved, the peer provides `peer.daemonInfo` object.
     *
     * ```javascript
     * peer.connect().then(function() {
     *   var daemonInfo = peer.daemonInfo
     *   console.log('name', daemonInfo.name) // string
     *   console.log('version', daemonInfo.version) // string
     *   console.log('protocolVersion', daemonInfo.protocolVersion) // number
     *   console.log('can process JSON-RPC batches', daemonInfo.features.batches) // boolean
     *   console.log('supports authentication', daemonInfo.features.authentication) // boolean
     *   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
     * })
     * ```
     *
     * @returns {external:Promise} A Promise which gets resolved once connected to the Daemon, or gets rejected with either:
     * - [jet.ConnectionClosed](#module:errors~ConnectionClosed)
     *
     * @example
     * var peer = new jet.Peer({url: 'ws://jetbus.io:8012'})
     * peer.connect().then(function() {
     *   console.log('connected')
     * }).catch(function(err) {
     *   console.log('connect failed', err)
     * })
     */
    authenticate = (user, password) => {
        this.#jsonrpc.sendRequest('authenticate', { args: { user, password } });
    };
    connect = (controller = new AbortController()) => this.#jsonrpc
        .connect(controller)
        .then(() => this.info())
        .then((daemonInfo) => {
        this.#daemonInfo = daemonInfo || fallbackDaemonInfo;
        this.#jsonrpc.sendImmediate =
            !this.#daemonInfo.features?.batches || true;
        return Promise.resolve();
    });
    /**
     * Close the connection to the Daemon. All associated States and Methods are automatically
     * removed by the Daemon.
     *
     * @returns {external:Promise}
     *
     */
    close = () => this.#jsonrpc.close();
    /**
     * Batch operations wrapper. Issue multiple commands to the Daemon
     * in one message batch. Only required for performance critical actions.
     *
     * @param {function} action A function performing multiple peer actions.
     *
     */
    batch = (action) => {
        if (this.#daemonInfo.features?.batches) {
            this.#jsonrpc.sendImmediate = false;
        }
        action();
        this.#jsonrpc.sendImmediate = true;
        return this.#jsonrpc.send();
    };
    /**
     * Get {State}s and/or {Method}s defined by a Peer.
     *
     * @param {object} expression A Fetch expression to retrieve a snapshot of the currently matching data.
     * @returns {external:Promise}
     */
    get = (expression) => this.#jsonrpc.sendRequest('get', expression);
    /**
     * Adds a state or method to the Daemon.
     *
     * @param {(State|Method)} content To content to be added.
     * @returns {external:Promise} Gets resolved as soon as the content has been added to the Daemon.
     */
    add = (stateOrMethod) => {
        if ((0, utils_1.isState)(stateOrMethod)) {
            stateOrMethod.addListener('change', (newValue) => {
                this.#jsonrpc.sendRequest('change', {
                    path: stateOrMethod._path,
                    value: newValue
                });
            });
        }
        return this.#jsonrpc.sendRequest('add', stateOrMethod.toJson()).then(() => {
            this.#routes[stateOrMethod._path] = stateOrMethod;
            return Promise.resolve();
        });
    };
    /**
     * Remove a state or method from the Daemon.
     *
     * @param {State|Method} content The content to be removed.
     * @returns {external:Promise} Gets resolved as soon as the content has been removed from the Daemon.
     */
    remove = (stateOrMethod) => this.#jsonrpc
        .sendRequest('remove', { path: stateOrMethod.path() })
        .then(() => Promise.resolve());
    /**
     * Call a {Method} defined by another Peer.
     *
     * @param {string} path The unique path of the {Method}.
     * @param {Array} args The arguments provided to the {Method}.
     * @param {object} [options] Options.
     * @param {number} [options.timeout] A timeout for invoking the {Method} after which a timeout error rejects the promise.
     * @returns {external:Promise}
     */
    call = (path, callparams) => {
        const params = { path: path };
        if (callparams)
            params.args = callparams;
        return this.#jsonrpc.sendRequest('call', params);
    };
    /**
     * Info
     * @private
     */
    info = () => this.#jsonrpc.sendRequest('info', {});
    /**
     * Authenticate
     * @private
     */
    // #authenticate = (user: string, password: string | undefined) =>
    //   this.#jsonrpc.send<AccessType>("authenticate", {
    //     user: user,
    //     password: password,
    //   });
    /**
     * Config
     *
     * @private
     */
    configure = (params) => this.#jsonrpc.sendRequest('config', params);
    /**
     * Set a {State} to another value.
     *
     * @param {string} path The unique path to the {State}.
     * @param {*} value The desired new value of the {State}.
     * @param {object} [options] Optional settings
     * @param {number} [options.timeout]
     *
     */
    set = (path, value) => this.#jsonrpc.sendRequest('set', { path, value });
}
peer$1.Peer = Peer;
peer$1.default = Peer;

var state = {};

Object.defineProperty(state, "__esModule", { value: true });
state.State = void 0;
const _1_socket_1$1 = _1_socket;
const errors_1 = errors;
/**
 * Create a Jet State instance
 * @class
 * @classdesc A Jet State associates a unique path with any piece of
 * cohesive data. The data may represent a Database entry, the configuration
 * of a certain part of software or observations of "real" things (through sensors).
 * A State can change its value at any time. It also can provide "behaviour" by providing
 * a "set" event handler. This event handler can do whatever seems appropriate (validation etc) and may
 * result in an auto-posted state change.
 *
 * @param {string} path A unique name, which identifies this State, e.g. 'persons/#23A51'
 * @param {*} initialValue The initial value of the state.
 * @param {object} [access] Access rights for this state. Per default unrestricted access to all Peers.
 *
 */
class State extends _1_socket_1$1.EventEmitter {
    _path;
    _value;
    _readonly;
    constructor(path, initialValue, readonly = false) {
        super();
        this._path = path;
        this._value = initialValue;
        this._readonly = readonly;
        if (typeof path === 'undefined') {
            throw new errors_1.invalidState(`${path} is not allowed in path`);
        }
    }
    /**
     * Get the state's unchangable path.
     *
     * @returns {string} The state's path.
     *
     */
    path = () => this._path;
    /**
     * Replies to a 'set' request. Either set `response.value` or `response.error`.
     * Only required for asynchronous working {State~setCallback}.
     *
     * @function State~reply
     * @param {object} response The response to send to the invoker of the 'set' callback.
     * @param {*} [response.value] The new State's value.
     * @param {Boolean} [response.dontNotify=false] If set to true, no state change is posted.
     * @param {string|object} [response.error] A error message or error object.
     *
     */
    value = (newValue = undefined) => {
        if (newValue !== undefined && newValue !== this._value) {
            this._value = newValue;
            this.emit('change', newValue);
        }
        return this._value;
    };
    toJson = () => ({
        path: this._path,
        value: this._value
    });
}
state.State = State;
state.default = State;

var method = {};

Object.defineProperty(method, "__esModule", { value: true });
method.Method = void 0;
const _1_socket_1 = _1_socket;
/**
 * A method is a path that can be called. The peer.call method can be used to call methods
 */
class Method extends _1_socket_1.EventEmitter {
    _path;
    constructor(path) {
        super();
        this._path = path;
    }
    path = () => {
        return this._path;
    };
    call = (args) => {
        this.emit('call', args);
    };
    toJson = () => {
        const params = {
            path: this._path
        };
        return params;
    };
}
method.Method = Method;
method.default = Method;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(daemon$1, exports);
	__exportStar(peer$1, exports);
	__exportStar(state, exports);
	__exportStar(method, exports);
	__exportStar(fetcher, exports);
	__exportStar(errors, exports);
	__exportStar(types, exports);
	__exportStar(log, exports);
	__exportStar(_2_jsonrpc, exports); 
} (jet$1));

var jet = jet$1;

var port = parseInt(process.argv[2]) || 8080;

// // Create Jet Daemon
var daemon = new jet.Daemon({
  log: {
    logCallbacks: [console.log],
    logname: 'Daemon',
    loglevel: jet.LogLevel.info
  },
  username: 'Admin',
  password: 'test',
  features: {
    fetch: 'full',
    batches: true,
    asNotification: true
  }
});

daemon.listen({
  wsPort: port
});
console.log('todo-server ready');
console.log('listening on port', port);

// Declare Todo Class
var todoId = 0;

var Todo = function (title) {
  this.id = todoId++;
  if (typeof title !== 'string') {
    throw new Error('title must be a string')
  }
  this.title = title;
  this.completed = false;
};

Todo.prototype.merge = (other) => {
  if (other.completed !== undefined) {
    undefined.completed = other.completed;
  }

  if (other.title !== undefined) {
    undefined.title = other.title;
  }
};

// Create Jet Peer
var peer = new jet.Peer({
  url: `ws://localhost:8080/`,
  // url: `ws://172.19.191.155:8081/`,
  // url: `ws://172.19.211.59:11123/api/jet/`,
  log: {
    logCallbacks: [console.log],
    logname: 'Peer 1',
    loglevel: jet.LogLevel.socket
  }
});
// const peer2 = new jet.Peer({
//   port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

// })

var todoStates = {};

// Provide a "todo/add" method to create new todos
var jetState = new jet.State('todo/value', { test: 4 });
jetState.on('set', (value) => {
  jetState.value(12345);
});
var addTodo = new jet.Method('todo/add');
addTodo.on('call', (args) => {
  var title = args[0];
  var todo = new Todo(title);

  // create a new todo state and store ref.
  var todoState = new jet.State('todo/#' + todo.id, todo);
  todoState.on('set', (requestedTodo) => {
    todo.merge(requestedTodo);
  });
  todoStates[todo.id] = todoState;
  peer.add(todoState);
});

// Provide a "todo/remove" method to delete a certain todo
var removeTodo = new jet.Method('todo/remove');
removeTodo.on('call', (id) => {
  if (id in todoStates) {
    peer.remove(todoStates[id]);
    delete todoStates[id];
  }
});

// Provide a "todo/remove" method to delete a certain todo
var clearCompletedTodos = new jet.Method('todo/clearCompleted');
clearCompletedTodos.on('call', function (test) {
  // console.log("Received clear completed", test)
  Object.keys(todoStates).forEach(function (id) {
    if (todoStates[id].value().completed) {
      todoStates[id].remove();
      delete todoStates[id];
    }
  });
});

// Provide a "todo/remove" method to delete a certain todo
var setCompleted = new jet.Method('todo/setCompleted');
setCompleted.on('call', function (args) {
  Object.keys(todoStates).forEach(function (id) {
    var todo = todoStates[id];
    var current = todo.value();
    if (current.completed !== args[0]) {
      current.completed = args[0];
      todo.value(current);
    }
  });
});
var todos = new jet.Fetcher()
  .path('containsOneOf', ['todo/#0', 'todo/#2', 'todo/#4'])
  .value('greaterThan', 0, 'id')
  .range(1, 30)
  .ascending()
  .sortByValue()
  .on('data', function (todos) {
    renderTodos(todos);
  });

const stateTest = new jet.State('test', 0);

peer
  .connect()
  .then(() =>
    peer.batch(() => {
      peer.add(jetState);
      peer.add(addTodo);
      peer.add(removeTodo);
      peer.add(setCompleted);
      peer.add(clearCompletedTodos);
      peer.add(stateTest);
    })
  )
  .then(() => peer.fetch(todos))
  .then(() => peer.set('test', 2))
  .catch((ex) => {
    console.log('Caught exception', ex);
  });

module.exports = todoServer;
