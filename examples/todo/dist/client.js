/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONNECTION_ERROR_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.CONNECTION_ERROR_CODE),
/* harmony export */   ConnectionClosed: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed),
/* harmony export */   ConnectionInUse: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ConnectionInUse),
/* harmony export */   Daemon: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Daemon),
/* harmony export */   FetchOnly: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.FetchOnly),
/* harmony export */   Fetcher: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Fetcher),
/* harmony export */   INTERNAL_ERROR_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INTERNAL_ERROR_CODE),
/* harmony export */   INVALID_PARAMS_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_PARAMS_CODE),
/* harmony export */   INVALID_PATH: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_PATH),
/* harmony export */   INVALID_REQUEST: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.INVALID_REQUEST),
/* harmony export */   InvalidArgument: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument),
/* harmony export */   InvalidParamError: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvalidParamError),
/* harmony export */   InvvalidCredentials: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.InvvalidCredentials),
/* harmony export */   JSONRPCError: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.JSONRPCError),
/* harmony export */   JsonRPC: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.JsonRPC),
/* harmony export */   LogLevel: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.LogLevel),
/* harmony export */   Logger: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Logger),
/* harmony export */   METHOD_NOT_FOUND: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.METHOD_NOT_FOUND),
/* harmony export */   Method: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Method),
/* harmony export */   NO_ERROR_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NO_ERROR_CODE),
/* harmony export */   NotAuthorized: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized),
/* harmony export */   NotFound: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.NotFound),
/* harmony export */   Occupied: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Occupied),
/* harmony export */   PARSE_ERROR_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.PARSE_ERROR_CODE),
/* harmony export */   ParseError: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.ParseError),
/* harmony export */   Peer: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.Peer),
/* harmony export */   PeerTimeout: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.PeerTimeout),
/* harmony export */   RESPONSE_TIMEOUT_CODE: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.RESPONSE_TIMEOUT_CODE),
/* harmony export */   State: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.State),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   events: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.events),
/* harmony export */   fetchSimpleId: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId),
/* harmony export */   invalidMethod: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidMethod),
/* harmony export */   invalidRequest: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidRequest),
/* harmony export */   invalidState: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.invalidState),
/* harmony export */   methodNotFoundError: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.methodNotFoundError),
/* harmony export */   notAllowed: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.notAllowed),
/* harmony export */   operators: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.operators),
/* harmony export */   pathRules: () => (/* reexport safe */ _jet__WEBPACK_IMPORTED_MODULE_0__.pathRules)
/* harmony export */ });
/* harmony import */ var _jet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_jet__WEBPACK_IMPORTED_MODULE_0__);


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONNECTION_ERROR_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.CONNECTION_ERROR_CODE),
/* harmony export */   ConnectionClosed: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ConnectionClosed),
/* harmony export */   ConnectionInUse: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ConnectionInUse),
/* harmony export */   Daemon: () => (/* reexport safe */ _3_jet_daemon__WEBPACK_IMPORTED_MODULE_0__.Daemon),
/* harmony export */   FetchOnly: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.FetchOnly),
/* harmony export */   Fetcher: () => (/* reexport safe */ _3_jet_peer_fetcher__WEBPACK_IMPORTED_MODULE_4__.Fetcher),
/* harmony export */   INTERNAL_ERROR_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INTERNAL_ERROR_CODE),
/* harmony export */   INVALID_PARAMS_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_PARAMS_CODE),
/* harmony export */   INVALID_PATH: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_PATH),
/* harmony export */   INVALID_REQUEST: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.INVALID_REQUEST),
/* harmony export */   InvalidArgument: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvalidArgument),
/* harmony export */   InvalidParamError: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvalidParamError),
/* harmony export */   InvvalidCredentials: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.InvvalidCredentials),
/* harmony export */   JSONRPCError: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.JSONRPCError),
/* harmony export */   JsonRPC: () => (/* reexport safe */ _2_jsonrpc__WEBPACK_IMPORTED_MODULE_8__.JsonRPC),
/* harmony export */   LogLevel: () => (/* reexport safe */ _3_jet_log__WEBPACK_IMPORTED_MODULE_7__.LogLevel),
/* harmony export */   Logger: () => (/* reexport safe */ _3_jet_log__WEBPACK_IMPORTED_MODULE_7__.Logger),
/* harmony export */   METHOD_NOT_FOUND: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.METHOD_NOT_FOUND),
/* harmony export */   Method: () => (/* reexport safe */ _3_jet_peer_method__WEBPACK_IMPORTED_MODULE_3__.Method),
/* harmony export */   NO_ERROR_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NO_ERROR_CODE),
/* harmony export */   NotAuthorized: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NotAuthorized),
/* harmony export */   NotFound: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.NotFound),
/* harmony export */   Occupied: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.Occupied),
/* harmony export */   PARSE_ERROR_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.PARSE_ERROR_CODE),
/* harmony export */   ParseError: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.ParseError),
/* harmony export */   Peer: () => (/* reexport safe */ _3_jet_peer__WEBPACK_IMPORTED_MODULE_1__.Peer),
/* harmony export */   PeerTimeout: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.PeerTimeout),
/* harmony export */   RESPONSE_TIMEOUT_CODE: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.RESPONSE_TIMEOUT_CODE),
/* harmony export */   State: () => (/* reexport safe */ _3_jet_peer_state__WEBPACK_IMPORTED_MODULE_2__.State),
/* harmony export */   events: () => (/* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.events),
/* harmony export */   fetchSimpleId: () => (/* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.fetchSimpleId),
/* harmony export */   invalidMethod: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod),
/* harmony export */   invalidRequest: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidRequest),
/* harmony export */   invalidState: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.invalidState),
/* harmony export */   methodNotFoundError: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.methodNotFoundError),
/* harmony export */   notAllowed: () => (/* reexport safe */ _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__.notAllowed),
/* harmony export */   operators: () => (/* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.operators),
/* harmony export */   pathRules: () => (/* reexport safe */ _3_jet_types__WEBPACK_IMPORTED_MODULE_6__.pathRules)
/* harmony export */ });
/* harmony import */ var _3_jet_daemon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _3_jet_peer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(25);
/* harmony import */ var _3_jet_peer_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(29);
/* harmony import */ var _3_jet_peer_method__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(30);
/* harmony import */ var _3_jet_peer_fetcher__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(26);
/* harmony import */ var _3_jet_errors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _3_jet_types__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);
/* harmony import */ var _3_jet_log__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(4);
/* harmony import */ var _2_jsonrpc__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(17);











/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Daemon: () => (/* binding */ Daemon),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _path_matcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _subscription__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _route__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12);
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
/* harmony import */ var _2_jsonrpc_server__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(16);
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);
/* harmony import */ var _authenticator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(24);









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
    constructor(options, authenticate = false) {
        this.name = options.name || 'node-jet';
        this.version = version;
        this.protocolVersion = '1.1.0';
        this.features = {
            batches: options.features?.batches || false,
            fetch: options.features?.fetch || 'full',
            asNotification: options.features?.asNotification || false,
            authenticate: authenticate
        };
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
class Daemon extends _1_socket__WEBPACK_IMPORTED_MODULE_6__.EventEmitter {
    infoObject;
    log;
    jsonRPCServer;
    routes = {};
    subscriber = [];
    authenticator;
    /**
     * Constructor for creating the instance
     * @param {DaemonOptions & InfoOptions} [options] Options for the daemon creation
     */
    constructor(options = {}) {
        super();
        this.authenticator = new _authenticator__WEBPACK_IMPORTED_MODULE_7__.Authenticator(options.username, options.password);
        this.infoObject = new InfoObject(options, this.authenticator.enabled);
        this.log = new _log__WEBPACK_IMPORTED_MODULE_0__.Logger(options.log);
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
        if (this.authenticator.login(params.user, params.password)) {
            peer.user = params.user;
            peer.respond(id, {}, true);
        }
        else {
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.InvvalidCredentials(params.user), false);
        }
    };
    /*
    Add as Notification: The message is acknowledged,then all the peers are informed about the new state
    Add synchronous: First all Peers are informed about the new value then message is acknowledged
    */
    add = (peer, id, params) => {
        const path = params.path;
        if (path in this.routes) {
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.Occupied(path), false);
            return;
        }
        this.routes[path] = new _route__WEBPACK_IMPORTED_MODULE_3__.Route(peer, path, params.value, params.access);
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
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(), false);
        }
    };
    /*
    Fetch as Notification: The message is acknowledged,then the peer is informed of all the states matching the fetchrule
    Fetch synchronous: First the peer is informed of all the states matching the fetchrule then the message is acknowledged
    */
    fetch = (peer, id, msg) => {
        if (this.simpleFetch() &&
            this.subscriber.find((sub) => sub.owner === peer)) {
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.ConnectionInUse('Only one fetcher per peer in simple fetch Mode'), false);
            return;
        }
        if (this.subscriber.find((sub) => sub.id === msg.id)) {
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.Occupied('FetchId already in use'), false);
            return;
        }
        try {
            const sub = new _subscription__WEBPACK_IMPORTED_MODULE_2__.Subscription(msg, peer);
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
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(`No Subscription with id ${params.id} found`), false);
            return;
        }
        if (this.subscriber[subIdx].owner !== peer) {
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.notAllowed(`Peer does not own subscription with id ${params.id}`), false);
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
            const matcher = (0,_path_matcher__WEBPACK_IMPORTED_MODULE_1__.createPathMatcher)(params);
            const resp = Object.keys(this.routes)
                .filter((route) => matcher(route) && this.authenticator.isAllowed("get", peer.user, this.routes[route].access))
                .map((route) => {
                console.log(route);
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
            peer.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(route), false);
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
            return Promise.reject(new _errors__WEBPACK_IMPORTED_MODULE_4__.NotFound(params.path));
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
        this.jsonRPCServer = new _2_jsonrpc_server__WEBPACK_IMPORTED_MODULE_5__.JsonRPCServer(this.log, listenOptions, this.infoObject.features.batches);
        this.jsonRPCServer.addListener('connection', (newPeer) => {
            this.log.info('Peer connected');
            newPeer.addListener('info', this.info);
            newPeer.addListener('configure', this.configure);
            newPeer.addListener('authenticate', this.authenticate);
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Daemon);


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LogLevel: () => (/* binding */ LogLevel),
/* harmony export */   Logger: () => (/* binding */ Logger)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["socket"] = 1] = "socket";
    LogLevel[LogLevel["debug"] = 2] = "debug";
    LogLevel[LogLevel["info"] = 3] = "info";
    LogLevel[LogLevel["warn"] = 4] = "warn";
    LogLevel[LogLevel["error"] = 5] = "error";
    LogLevel[LogLevel["none"] = 6] = "none";
})(LogLevel || (LogLevel = {}));
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
            this.stream = fs__WEBPACK_IMPORTED_MODULE_0__.createWriteStream(settings.logFile);
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


/***/ }),
/* 5 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPathMatcher: () => (/* binding */ createPathMatcher)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
// import { Notification } from "./fetcher";


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
const generators = {
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
        if (!(key in generators) && key !== 'caseInsensitive')
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('unknown rule ' + key);
    });
    const predicates = [];
    _types__WEBPACK_IMPORTED_MODULE_1__.pathRules.forEach((name) => {
        let option = po[name];
        if (option) {
            const gen = generators[name];
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


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONNECTION_ERROR_CODE: () => (/* binding */ CONNECTION_ERROR_CODE),
/* harmony export */   ConnectionClosed: () => (/* binding */ ConnectionClosed),
/* harmony export */   ConnectionInUse: () => (/* binding */ ConnectionInUse),
/* harmony export */   FetchOnly: () => (/* binding */ FetchOnly),
/* harmony export */   INTERNAL_ERROR_CODE: () => (/* binding */ INTERNAL_ERROR_CODE),
/* harmony export */   INVALID_PARAMS_CODE: () => (/* binding */ INVALID_PARAMS_CODE),
/* harmony export */   INVALID_PATH: () => (/* binding */ INVALID_PATH),
/* harmony export */   INVALID_REQUEST: () => (/* binding */ INVALID_REQUEST),
/* harmony export */   InvalidArgument: () => (/* binding */ InvalidArgument),
/* harmony export */   InvalidParamError: () => (/* binding */ InvalidParamError),
/* harmony export */   InvvalidCredentials: () => (/* binding */ InvvalidCredentials),
/* harmony export */   JSONRPCError: () => (/* binding */ JSONRPCError),
/* harmony export */   METHOD_NOT_FOUND: () => (/* binding */ METHOD_NOT_FOUND),
/* harmony export */   NO_ERROR_CODE: () => (/* binding */ NO_ERROR_CODE),
/* harmony export */   NotAuthorized: () => (/* binding */ NotAuthorized),
/* harmony export */   NotFound: () => (/* binding */ NotFound),
/* harmony export */   Occupied: () => (/* binding */ Occupied),
/* harmony export */   PARSE_ERROR_CODE: () => (/* binding */ PARSE_ERROR_CODE),
/* harmony export */   ParseError: () => (/* binding */ ParseError),
/* harmony export */   PeerTimeout: () => (/* binding */ PeerTimeout),
/* harmony export */   RESPONSE_TIMEOUT_CODE: () => (/* binding */ RESPONSE_TIMEOUT_CODE),
/* harmony export */   invalidMethod: () => (/* binding */ invalidMethod),
/* harmony export */   invalidRequest: () => (/* binding */ invalidRequest),
/* harmony export */   invalidState: () => (/* binding */ invalidState),
/* harmony export */   methodNotFoundError: () => (/* binding */ methodNotFoundError),
/* harmony export */   notAllowed: () => (/* binding */ notAllowed)
/* harmony export */ });

const errorUrlBase = 'https://github.com/lipp/node-jet/blob/master/doc/peer.markdown';
const NO_ERROR_CODE = 1000;
const PARSE_ERROR_CODE = -32600;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS_CODE = -32602;
const INTERNAL_ERROR_CODE = -32603;
const INVALID_PATH = -32604;
const RESPONSE_TIMEOUT_CODE = -32001;
const CONNECTION_ERROR_CODE = -32002;
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
class ParseError extends JSONRPCError {
    constructor(details = '') {
        super(PARSE_ERROR_CODE, 'ParseError', 'Message could not be parsed', details);
    }
}
class InvalidParamError extends JSONRPCError {
    constructor(name, message, details = '') {
        super(INVALID_PARAMS_CODE, name, message, details);
    }
}
class NotFound extends InvalidParamError {
    constructor(details) {
        super('NotFound', 'No State/Method matching the specified path', details);
    }
}
class InvvalidCredentials extends InvalidParamError {
    constructor(details) {
        super('invalid params', 'invalid credentials', details);
    }
}
class NotAuthorized extends InvalidParamError {
    constructor(details) {
        super('invalid params', 'Missing authorization', details);
    }
}
class InvalidArgument extends InvalidParamError {
    constructor(details) {
        super('InvalidArgument', 'The provided argument(s) have been refused by the State/Method', details);
    }
}
class Occupied extends InvalidParamError {
    constructor(details) {
        super('Occupied', 'A State/Method with the same path has already been added', details);
    }
}
class FetchOnly extends InvalidParamError {
    constructor(details) {
        super('FetchOnly', 'The State cannot be modified', details);
    }
}
class methodNotFoundError extends JSONRPCError {
    constructor(details = '') {
        super(METHOD_NOT_FOUND, 'MethodNotFound', 'Method not found', details);
    }
}
class invalidMethod extends JSONRPCError {
    constructor(details) {
        super(INVALID_REQUEST, 'invalidMethod', 'The path does not support this method', details);
    }
}
class invalidState extends JSONRPCError {
    constructor(details) {
        super(INVALID_PATH, 'invalidState', 'The path is not supported', details);
    }
}
class invalidRequest extends JSONRPCError {
    constructor(name = 'invalidRequest', message = 'Invalid Request', details = '') {
        super(INVALID_REQUEST, name, message, details);
    }
}
class notAllowed extends invalidRequest {
    constructor(details) {
        super('NotAllowed', 'Not allowed', details);
    }
}
class ConnectionClosed extends JSONRPCError {
    constructor(details) {
        super(CONNECTION_ERROR_CODE, 'ConnectionClosed', 'The connection is closed', details);
    }
}
class ConnectionInUse extends JSONRPCError {
    constructor(err) {
        super(CONNECTION_ERROR_CODE, 'ConnectionInUse', 'Could not establish connection', err);
    }
}
class PeerTimeout extends JSONRPCError {
    constructor(details) {
        super(RESPONSE_TIMEOUT_CODE, 'PeerTimeout', 'The peer processing the request did not respond within the specified timeout', details);
    }
}


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   events: () => (/* binding */ events),
/* harmony export */   fetchSimpleId: () => (/* binding */ fetchSimpleId),
/* harmony export */   operators: () => (/* binding */ operators),
/* harmony export */   pathRules: () => (/* binding */ pathRules)
/* harmony export */ });

const events = [
    'authenticate',
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
const pathRules = [
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
const operators = [
    'greaterThan',
    'lessThan',
    'equals',
    'equalsNot',
    'isType'
];
const fetchSimpleId = 'fetch_all';


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Subscription: () => (/* binding */ Subscription)
/* harmony export */ });
/* harmony import */ var _path_matcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _value_matcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);



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
        this.pathMatcher = (0,_path_matcher__WEBPACK_IMPORTED_MODULE_0__.createPathMatcher)(msg);
        this.valueMatcher = (0,_value_matcher__WEBPACK_IMPORTED_MODULE_1__.create)(msg);
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


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   create: () => (/* binding */ create)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);


const generators = {
    equals: (field, other) => (x) => (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) === other,
    lessThan: (field, other) => (x) => (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) < other,
    equalsNot: (field, other) => (x) => (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) !== other,
    greaterThan: (field, other) => (x) => (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) > other,
    isType: (field, other) => (x) => typeof (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getValue)(x, field) === other
};
const generatePredicate = (field, rule) => {
    const gen = generators[rule.operator];
    if (!gen) {
        throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('unknown rule ' + rule.operator);
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


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   errorObject: () => (/* binding */ errorObject),
/* harmony export */   getValue: () => (/* binding */ getValue),
/* harmony export */   isState: () => (/* binding */ isState)
/* harmony export */ });
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
const isState = (stateOrMethod) => {
    return '_value' in stateOrMethod;
};


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Route: () => (/* binding */ Route)
/* harmony export */ });
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);


/**
 * A Route is a path and corresponds to a state.
 * The daemon keeps a local cache of all registered routes and all momentary values.
 * The corresponding owner of a route is also remembered
 */
class Route extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    owner;
    value;
    path;
    access;
    constructor(owner, path, value = undefined, access) {
        super();
        this.owner = owner;
        this.value = value;
        this.path = path;
        this.access = access;
    }
    updateValue = (newValue) => {
        if (newValue === this.value)
            return;
        this.value = newValue;
        this.emit('Change', this.path, newValue);
    };
    remove = () => this.emit('Remove', this.path);
}


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventEmitter: () => (/* binding */ EventEmitter),
/* harmony export */   WebSocketImpl: () => (/* binding */ WebSocketImpl),
/* harmony export */   isBrowser: () => (/* binding */ isBrowser),
/* harmony export */   isNodeJs: () => (/* binding */ isNodeJs)
/* harmony export */ });
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(15);
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_1__);
/* istanbul ignore file */


const isNodeJs = typeof window === 'undefined';
const isBrowser = typeof window !== 'undefined';
const WebSocketImpl = isNodeJs ? ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket : WebSocket;
const EventEmitter = events__WEBPACK_IMPORTED_MODULE_1__.EventEmitter;


/***/ }),
/* 14 */
/***/ (() => {

/* (ignored) */

/***/ }),
/* 15 */
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
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
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
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

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
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

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
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

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
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

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
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

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
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

EventEmitter.prototype.eventNames = function eventNames() {
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
    };

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


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonRPCServer: () => (/* binding */ JsonRPCServer)
/* harmony export */ });
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(17);
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _1_socket_tcpserver__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(22);
/* harmony import */ var _1_socket_wsserver__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23);




/**
 * JSONRPCServer instance
 */
class JsonRPCServer extends _1_socket__WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
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
            this.tcpServer = new _1_socket_tcpserver__WEBPACK_IMPORTED_MODULE_2__.TCPServer(this.config);
            this.tcpServer.addListener('connection', (sock) => {
                const jsonRpc = new ___WEBPACK_IMPORTED_MODULE_0__["default"](this.log, { batches: this.batches }, sock);
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
            this.wsServer = new _1_socket_wsserver__WEBPACK_IMPORTED_MODULE_3__.WebsocketServer(this.config);
            this.wsServer.addListener('connection', (sock) => {
                const jsonRpc = new ___WEBPACK_IMPORTED_MODULE_0__["default"](this.log, { batches: this.batches }, sock);
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


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonRPC: () => (/* binding */ JsonRPC),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony import */ var _3_jet_messages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(18);
/* harmony import */ var _1_socket_socket__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);




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
class JsonRPC extends _1_socket__WEBPACK_IMPORTED_MODULE_3__.EventEmitter {
    sock;
    config;
    messages = [];
    messageId = 1;
    user = "";
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
        this.sock = new _1_socket_socket__WEBPACK_IMPORTED_MODULE_2__.Socket();
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
                this.respond(decodedId, new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ParseError(message), false);
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
            this._dispatchRequest((0,_3_jet_messages__WEBPACK_IMPORTED_MODULE_1__.castMessage)(message));
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
            this.respond(message.id, new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.methodNotFoundError(message.method), false);
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
            return Promise.reject(new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed());
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
                reject(new _3_jet_errors__WEBPACK_IMPORTED_MODULE_0__.ConnectionClosed());
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JsonRPC);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   castMessage: () => (/* binding */ castMessage)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);

const castMessage = (msg) => {
    if (!('method' in msg))
        throw new _errors__WEBPACK_IMPORTED_MODULE_0__.invalidRequest('No method');
    const method = msg.method;
    const params = msg.params;
    switch (method) {
        case 'info':
            return msg;
        case 'authenticate':
            if (!params || !('user' in params) || !('password' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Only params.user & params.password supported');
            return msg;
        case 'configure':
            if (!params || !('name' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Only params.name supported');
            return msg;
        case 'unfetch':
            if (!params || !('id' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Fetch id required');
            return msg;
        default:
            if (!params || !('path' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Path required');
    }
    switch (method) {
        case 'fetch':
            if (!('id' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Fetch id required');
            return msg;
        case 'change':
        case 'set':
            if (!('value' in params))
                throw new _errors__WEBPACK_IMPORTED_MODULE_0__.InvalidArgument('Value required');
            return msg;
        default:
            return msg;
    }
};


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Socket: () => (/* binding */ Socket)
/* harmony export */ });
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _message_socket__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(20);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* istanbul ignore file */



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
        if (___WEBPACK_IMPORTED_MODULE_2__.isBrowser) {
            this.sock = new WebSocket(url || `ws://${window.location.host}:${port || 2315}`, 'jet');
            this.type = 'ws';
        }
        else if (___WEBPACK_IMPORTED_MODULE_2__.isNodeJs && url) {
            this.sock = new ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket(url, 'jet');
            this.type = 'ws';
        }
        else {
            this.sock = new _message_socket__WEBPACK_IMPORTED_MODULE_1__["default"](port || 11122, ip);
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
        if ((this.type === 'ws' && ___WEBPACK_IMPORTED_MODULE_2__.isBrowser) || this.type === 'ms') {
            ;
            this.sock.addEventListener(event, cb);
        }
        else if (this.type === 'ws' && ___WEBPACK_IMPORTED_MODULE_2__.isNodeJs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;
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


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MessageSocket: () => (/* binding */ MessageSocket),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(21);
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(net__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* istanbul ignore file */


/**
 * Class Message socket
 */
class MessageSocket extends ___WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
    last = Buffer.alloc(0);
    len = -1;
    socket;
    constructor(port, ip = '') {
        super();
        if (port instanceof net__WEBPACK_IMPORTED_MODULE_0__.Socket) {
            this.socket = port;
        }
        else {
            this.socket = (0,net__WEBPACK_IMPORTED_MODULE_0__.connect)(port, ip);
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MessageSocket);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

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

// yes, I know this seems stupid, but I have my reasons.

var net = __webpack_require__(21)
for(k in net)
	__webpack_require__.g[k] = net[k]



/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TCPServer: () => (/* binding */ TCPServer)
/* harmony export */ });
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(21);
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(net__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _message_socket__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(20);
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(19);
/* istanbul ignore file */




/**
 * Class implementation of a TCP server. This implementation only runs in a node.js environment
 */
class TCPServer extends ___WEBPACK_IMPORTED_MODULE_1__.EventEmitter {
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
        this.tcpServer = (0,net__WEBPACK_IMPORTED_MODULE_0__.createServer)((peerSocket) => {
            const sock = new _socket__WEBPACK_IMPORTED_MODULE_3__.Socket(new _message_socket__WEBPACK_IMPORTED_MODULE_2__["default"](peerSocket));
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


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebsocketServer: () => (/* binding */ WebsocketServer)
/* harmony export */ });
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(14);
/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(ws__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _socket__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19);
/* istanbul ignore file */



/**
 * Class implementation of a WS server. This implementation only runs in a node.js environment
 */
class WebsocketServer extends ___WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
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
        this.wsServer = new ws__WEBPACK_IMPORTED_MODULE_1__.WebSocketServer({
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
            const sock = new _socket__WEBPACK_IMPORTED_MODULE_2__.Socket(ws);
            sock.id = `ws_${this.connectionId}`;
            this.connectionId++;
            const pingMs = this.config.wsPingInterval || 5000;
            let pingInterval;
            if (pingMs) {
                pingInterval = setInterval(() => {
                    if (ws.readyState === ___WEBPACK_IMPORTED_MODULE_0__.WebSocketImpl.OPEN) {
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


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Authenticator: () => (/* binding */ Authenticator)
/* harmony export */ });
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);

class Authenticator {
    users;
    groups;
    enabled;
    constructor(adminUser, password) {
        if (adminUser && password) {
            this.enabled = true;
            this.users = { [adminUser]: password };
            this.groups = { "admin": [adminUser] };
        }
        else {
            this.users = {};
            this.groups = {};
            this.enabled = false;
        }
    }
    addUser = (requestUser, newUser, password, groups) => {
        if (!(requestUser in this.groups["admin"])) {
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized("Only admin users can create User");
        }
        if (newUser in Object.keys(this.users)) {
            throw new _errors__WEBPACK_IMPORTED_MODULE_0__.NotAuthorized("User already exists");
        }
        this.users[newUser] = password;
        groups.forEach((group) => {
            if (!(group in Object.keys(this.groups))) {
                this.groups[group] = [];
            }
            this.groups[group].push(newUser);
        });
    };
    login = (user, password) => user in this.users && password === this.users[user];
    isAllowed = (method, user, access) => {
        console.log(method, user, access);
        if (!access)
            return true;
        return user in this.groups[method === "get" ? access.readgroup : access.writegroup];
    };
}


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Peer: () => (/* binding */ Peer),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _2_jsonrpc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var _fetcher__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(26);
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _daemon_subscription__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9);
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(13);
/* harmony import */ var nanoid__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(27);










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
class Peer extends _1_socket__WEBPACK_IMPORTED_MODULE_7__.EventEmitter {
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
        this.#log = new _log__WEBPACK_IMPORTED_MODULE_3__.Logger(this.#config.log);
        this.#jsonrpc = new _2_jsonrpc__WEBPACK_IMPORTED_MODULE_1__["default"](this.#log, config, sock);
        this.#jsonrpc.addListener('get', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const state = this.#routes[m.path];
                if (!(0,_utils__WEBPACK_IMPORTED_MODULE_4__.isState)(state)) {
                    const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(`Tried to get value of ${m.path} which is a method`);
                    this.#log.error(error.toString());
                    this.#jsonrpc.respond(id, error, false);
                }
                else {
                    this.#jsonrpc.respond(id, state.toJson(), true);
                }
            }
            else {
                this.#jsonrpc.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(m.path), false);
            }
        });
        this.#jsonrpc.addListener('set', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const state = this.#routes[m.path];
                if (!(0,_utils__WEBPACK_IMPORTED_MODULE_4__.isState)(state)) {
                    const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(`Tried to set ${m.path} which is a method`);
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
                    this.#jsonrpc.respond(id, new _errors__WEBPACK_IMPORTED_MODULE_5__.InvalidParamError('InvalidParam', 'Failed to set value', err && typeof err == 'object' ? err.toString() : undefined), false);
                }
            }
            else {
                const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(m.path);
                this.#log.error(error.toString());
                this.#jsonrpc.respond(id, error, false);
            }
        });
        this.#jsonrpc.addListener('call', (_peer, id, m) => {
            if (m.path in this.#routes) {
                const method = this.#routes[m.path];
                if ((0,_utils__WEBPACK_IMPORTED_MODULE_4__.isState)(method)) {
                    const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.invalidMethod(`Tried to call ${m.path} which is a state`);
                    this.#log.error(error.toString());
                    this.#jsonrpc.respond(id, error, false);
                    return;
                }
                method.call(m.args);
                this.#jsonrpc.respond(id, {}, true);
            }
            else {
                const error = new _errors__WEBPACK_IMPORTED_MODULE_5__.NotFound(m.path);
                this.#log.error(error.toString());
                this.#jsonrpc.respond(id, error, false);
            }
        });
        this.#jsonrpc.addListener(_types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId, (_peer, _id, m) => {
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
                const param = { id: _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId };
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
        const fetcherId = `f_${(0,nanoid__WEBPACK_IMPORTED_MODULE_8__.nanoid)(5)}`;
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
        const sub = new _daemon_subscription__WEBPACK_IMPORTED_MODULE_6__.Subscription(fetcher.message);
        Object.values(this.cache)
            .filter((entry) => sub.matchesPath(entry.path) && sub.matchesValue(entry.value))
            .forEach((entry) => {
            fetcher.emit('data', entry);
        });
        if (!(_types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId in this.#fetcher)) {
            //create dummy fetcher to
            this.#fetcher[_types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId] = new _fetcher__WEBPACK_IMPORTED_MODULE_2__["default"]();
            const params = { id: _types__WEBPACK_IMPORTED_MODULE_0__.fetchSimpleId, path: { startsWith: '' } };
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
        return this.#jsonrpc.sendRequest('authenticate', { user, password });
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
        if ((0,_utils__WEBPACK_IMPORTED_MODULE_4__.isState)(stateOrMethod)) {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Peer);


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fetcher: () => (/* binding */ Fetcher),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _daemon_subscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);


class Fetcher extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
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
        const sub = new _daemon_subscription__WEBPACK_IMPORTED_MODULE_1__.Subscription(this.message);
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fetcher);


/***/ }),
/* 27 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customAlphabet: () => (/* binding */ customAlphabet),
/* harmony export */   customRandom: () => (/* binding */ customRandom),
/* harmony export */   nanoid: () => (/* binding */ nanoid),
/* harmony export */   random: () => (/* binding */ random),
/* harmony export */   urlAlphabet: () => (/* reexport safe */ _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__.urlAlphabet)
/* harmony export */ });
/* harmony import */ var _url_alphabet_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(28);

let random = bytes => crypto.getRandomValues(new Uint8Array(bytes))
let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
  let step = -~((1.6 * mask * defaultSize) / alphabet.length)
  return (size = defaultSize) => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      let j = step
      while (j--) {
        id += alphabet[bytes[j] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}
let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)
let nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63
    if (byte < 36) {
      id += byte.toString(36)
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte > 62) {
      id += '-'
    } else {
      id += '_'
    }
    return id
  }, '')


/***/ }),
/* 28 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   urlAlphabet: () => (/* binding */ urlAlphabet)
/* harmony export */ });
const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   State: () => (/* binding */ State),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/* harmony import */ var _errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);



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
class State extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    _path;
    _value;
    _readGroup;
    _writeGroup;
    constructor(path, initialValue, readgroup = "all", writeGroup = "all") {
        super();
        this._path = path;
        this._value = initialValue;
        this._readGroup = readgroup;
        this._writeGroup = writeGroup;
        if (typeof path === 'undefined') {
            throw new _errors__WEBPACK_IMPORTED_MODULE_1__.invalidState(`${path} is not allowed in path`);
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
        value: this._value,
        access: { read: this._readGroup, write: this._writeGroup }
    });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (State);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Method: () => (/* binding */ Method),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _1_socket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);

/**
 * A method is a path that can be called. The peer.call method can be used to call methods
 */
class Method extends _1_socket__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Method);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(35);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(36);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(37);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(38);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_base_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 33 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),
/* 34 */
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),
/* 35 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),
/* 36 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),
/* 37 */
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),
/* 38 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(39);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(40);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(41);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(42), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(43), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `html,
body {
	margin: 0;
	padding: 0;
}

button {
	margin: 0;
	padding: 0;
	border: 0;
	background: none;
	font-size: 100%;
	vertical-align: baseline;
	font-family: inherit;
	font-weight: inherit;
	color: inherit;
	-webkit-appearance: none;
	appearance: none;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	font-smoothing: antialiased;
}

body {
	font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
	line-height: 1.4em;
	background: #f5f5f5;
	color: #4d4d4d;
	min-width: 230px;
	max-width: 550px;
	margin: 0 auto;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	font-smoothing: antialiased;
	font-weight: 300;
}

button,
input[type="checkbox"] {
	outline: none;
}

.hidden {
	display: none;
}

#todoapp {
	background: #fff;
	margin: 130px 0 40px 0;
	position: relative;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2),
	            0 25px 50px 0 rgba(0, 0, 0, 0.1);
}

#todoapp input::-webkit-input-placeholder {
	font-style: italic;
	font-weight: 300;
	color: #e6e6e6;
}

#todoapp input::-moz-placeholder {
	font-style: italic;
	font-weight: 300;
	color: #e6e6e6;
}

#todoapp input::input-placeholder {
	font-style: italic;
	font-weight: 300;
	color: #e6e6e6;
}

#todoapp h1 {
	position: absolute;
	top: -155px;
	width: 100%;
	font-size: 100px;
	font-weight: 100;
	text-align: center;
	color: rgba(175, 47, 47, 0.15);
	-webkit-text-rendering: optimizeLegibility;
	-moz-text-rendering: optimizeLegibility;
	text-rendering: optimizeLegibility;
}

#new-todo,
.edit {
	position: relative;
	margin: 0;
	width: 100%;
	font-size: 24px;
	font-family: inherit;
	font-weight: inherit;
	line-height: 1.4em;
	border: 0;
	outline: none;
	color: inherit;
	padding: 6px;
	border: 1px solid #999;
	box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
	box-sizing: border-box;
	-webkit-font-smoothing: antialiased;
	-moz-font-smoothing: antialiased;
	font-smoothing: antialiased;
}

#new-todo {
	padding: 16px 16px 16px 60px;
	border: none;
	background: rgba(0, 0, 0, 0.003);
	box-shadow: inset 0 -2px 1px rgba(0,0,0,0.03);
}

#main {
	position: relative;
	z-index: 2;
	border-top: 1px solid #e6e6e6;
}

label[for='toggle-all'] {
	display: none;
}

#toggle-all {
	position: absolute;
	top: -55px;
	left: -12px;
	width: 60px;
	height: 34px;
	text-align: center;
	border: none; /* Mobile Safari */
}

#toggle-all:before {
	content: '❯';
	font-size: 22px;
	color: #e6e6e6;
	padding: 10px 27px 10px 27px;
}

#toggle-all:checked:before {
	color: #737373;
}

#todo-list {
	margin: 0;
	padding: 0;
	list-style: none;
}

#todo-list li {
	position: relative;
	font-size: 24px;
	border-bottom: 1px solid #ededed;
}

#todo-list li:last-child {
	border-bottom: none;
}

#todo-list li.editing {
	border-bottom: none;
	padding: 0;
}

#todo-list li.editing .edit {
	display: block;
	width: 506px;
	padding: 13px 17px 12px 17px;
	margin: 0 0 0 43px;
}

#todo-list li.editing .view {
	display: none;
}

#todo-list li .toggle {
	text-align: center;
	width: 40px;
	/* auto, since non-WebKit browsers doesn't support input styling */
	height: auto;
	position: absolute;
	top: 0;
	bottom: 0;
	margin: auto 0;
	border: none; /* Mobile Safari */
	-webkit-appearance: none;
	appearance: none;
}

#todo-list li .toggle:after {
	content: url(${___CSS_LOADER_URL_REPLACEMENT_0___});
}

#todo-list li .toggle:checked:after {
	content: url(${___CSS_LOADER_URL_REPLACEMENT_1___});
}

#todo-list li label {
	white-space: pre;
	word-break: break-word;
	padding: 15px 60px 15px 15px;
	margin-left: 45px;
	display: block;
	line-height: 1.2;
	transition: color 0.4s;
}

#todo-list li.completed label {
	color: #d9d9d9;
	text-decoration: line-through;
}

#todo-list li .destroy {
	display: none;
	position: absolute;
	top: 0;
	right: 10px;
	bottom: 0;
	width: 40px;
	height: 40px;
	margin: auto 0;
	font-size: 30px;
	color: #cc9a9a;
	margin-bottom: 11px;
	transition: color 0.2s ease-out;
}

#todo-list li .destroy:hover {
	color: #af5b5e;
}

#todo-list li .destroy:after {
	content: '×';
}

#todo-list li:hover .destroy {
	display: block;
}

#todo-list li .edit {
	display: none;
}

#todo-list li.editing:last-child {
	margin-bottom: -1px;
}

#footer {
	color: #777;
	padding: 10px 15px;
	height: 20px;
	text-align: center;
	border-top: 1px solid #e6e6e6;
}

#footer:before {
	content: '';
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 50px;
	overflow: hidden;
	box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
	            0 8px 0 -3px #f6f6f6,
	            0 9px 1px -3px rgba(0, 0, 0, 0.2),
	            0 16px 0 -6px #f6f6f6,
	            0 17px 2px -6px rgba(0, 0, 0, 0.2);
}

#todo-count {
	float: left;
	text-align: left;
}

#todo-count strong {
	font-weight: 300;
}

#filters {
	margin: 0;
	padding: 0;
	list-style: none;
	position: absolute;
	right: 0;
	left: 0;
}

#filters li {
	display: inline;
}

#filters li a {
	color: inherit;
	margin: 3px;
	padding: 3px 7px;
	text-decoration: none;
	border: 1px solid transparent;
	border-radius: 3px;
}

#filters li a.selected,
#filters li a:hover {
	border-color: rgba(175, 47, 47, 0.1);
}

#filters li a.selected {
	border-color: rgba(175, 47, 47, 0.2);
}

#clear-completed,
html #clear-completed:active {
	float: right;
	position: relative;
	line-height: 20px;
	text-decoration: none;
	cursor: pointer;
	position: relative;
}

#clear-completed:hover {
	text-decoration: underline;
}

#info {
	margin: 65px auto 0;
	color: #bfbfbf;
	font-size: 10px;
	text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
	text-align: center;
}

#info p {
	line-height: 1;
}

#info a {
	color: inherit;
	text-decoration: none;
	font-weight: 400;
}

#info a:hover {
	text-decoration: underline;
}

/*
	Hack to remove background from Mobile Safari.
	Can't use it globally since it destroys checkboxes in Firefox
*/
@media screen and (-webkit-min-device-pixel-ratio:0) {
	#toggle-all,
	#todo-list li .toggle {
		background: none;
	}

	#todo-list li .toggle {
		height: 40px;
	}

	#toggle-all {
		-webkit-transform: rotate(90deg);
		transform: rotate(90deg);
		-webkit-appearance: none;
		appearance: none;
	}
}

@media (max-width: 430px) {
	#footer {
		height: 50px;
	}

	#filters {
		bottom: 10px;
	}
}
`, "",{"version":3,"sources":["webpack://./base.css"],"names":[],"mappings":"AAAA;;CAEC,SAAS;CACT,UAAU;AACX;;AAEA;CACC,SAAS;CACT,UAAU;CACV,SAAS;CACT,gBAAgB;CAChB,eAAe;CACf,wBAAwB;CACxB,oBAAoB;CACpB,oBAAoB;CACpB,cAAc;CACd,wBAAwB;CACxB,gBAAgB;CAChB,mCAAmC;CACnC,gCAAgC;CAChC,2BAA2B;AAC5B;;AAEA;CACC,yDAAyD;CACzD,kBAAkB;CAClB,mBAAmB;CACnB,cAAc;CACd,gBAAgB;CAChB,gBAAgB;CAChB,cAAc;CACd,mCAAmC;CACnC,gCAAgC;CAChC,2BAA2B;CAC3B,gBAAgB;AACjB;;AAEA;;CAEC,aAAa;AACd;;AAEA;CACC,aAAa;AACd;;AAEA;CACC,gBAAgB;CAChB,sBAAsB;CACtB,kBAAkB;CAClB;6CAC4C;AAC7C;;AAEA;CACC,kBAAkB;CAClB,gBAAgB;CAChB,cAAc;AACf;;AAEA;CACC,kBAAkB;CAClB,gBAAgB;CAChB,cAAc;AACf;;AAEA;CACC,kBAAkB;CAClB,gBAAgB;CAChB,cAAc;AACf;;AAEA;CACC,kBAAkB;CAClB,WAAW;CACX,WAAW;CACX,gBAAgB;CAChB,gBAAgB;CAChB,kBAAkB;CAClB,8BAA8B;CAC9B,0CAA0C;CAC1C,uCAAuC;CACvC,kCAAkC;AACnC;;AAEA;;CAEC,kBAAkB;CAClB,SAAS;CACT,WAAW;CACX,eAAe;CACf,oBAAoB;CACpB,oBAAoB;CACpB,kBAAkB;CAClB,SAAS;CACT,aAAa;CACb,cAAc;CACd,YAAY;CACZ,sBAAsB;CACtB,iDAAiD;CACjD,sBAAsB;CACtB,mCAAmC;CACnC,gCAAgC;CAChC,2BAA2B;AAC5B;;AAEA;CACC,4BAA4B;CAC5B,YAAY;CACZ,gCAAgC;CAChC,6CAA6C;AAC9C;;AAEA;CACC,kBAAkB;CAClB,UAAU;CACV,6BAA6B;AAC9B;;AAEA;CACC,aAAa;AACd;;AAEA;CACC,kBAAkB;CAClB,UAAU;CACV,WAAW;CACX,WAAW;CACX,YAAY;CACZ,kBAAkB;CAClB,YAAY,EAAE,kBAAkB;AACjC;;AAEA;CACC,YAAY;CACZ,eAAe;CACf,cAAc;CACd,4BAA4B;AAC7B;;AAEA;CACC,cAAc;AACf;;AAEA;CACC,SAAS;CACT,UAAU;CACV,gBAAgB;AACjB;;AAEA;CACC,kBAAkB;CAClB,eAAe;CACf,gCAAgC;AACjC;;AAEA;CACC,mBAAmB;AACpB;;AAEA;CACC,mBAAmB;CACnB,UAAU;AACX;;AAEA;CACC,cAAc;CACd,YAAY;CACZ,4BAA4B;CAC5B,kBAAkB;AACnB;;AAEA;CACC,aAAa;AACd;;AAEA;CACC,kBAAkB;CAClB,WAAW;CACX,kEAAkE;CAClE,YAAY;CACZ,kBAAkB;CAClB,MAAM;CACN,SAAS;CACT,cAAc;CACd,YAAY,EAAE,kBAAkB;CAChC,wBAAwB;CACxB,gBAAgB;AACjB;;AAEA;CACC,gDAAqN;AACtN;;AAEA;CACC,gDAAoR;AACrR;;AAEA;CACC,gBAAgB;CAChB,sBAAsB;CACtB,4BAA4B;CAC5B,iBAAiB;CACjB,cAAc;CACd,gBAAgB;CAChB,sBAAsB;AACvB;;AAEA;CACC,cAAc;CACd,6BAA6B;AAC9B;;AAEA;CACC,aAAa;CACb,kBAAkB;CAClB,MAAM;CACN,WAAW;CACX,SAAS;CACT,WAAW;CACX,YAAY;CACZ,cAAc;CACd,eAAe;CACf,cAAc;CACd,mBAAmB;CACnB,+BAA+B;AAChC;;AAEA;CACC,cAAc;AACf;;AAEA;CACC,YAAY;AACb;;AAEA;CACC,cAAc;AACf;;AAEA;CACC,aAAa;AACd;;AAEA;CACC,mBAAmB;AACpB;;AAEA;CACC,WAAW;CACX,kBAAkB;CAClB,YAAY;CACZ,kBAAkB;CAClB,6BAA6B;AAC9B;;AAEA;CACC,WAAW;CACX,kBAAkB;CAClB,QAAQ;CACR,SAAS;CACT,OAAO;CACP,YAAY;CACZ,gBAAgB;CAChB;;;;+CAI8C;AAC/C;;AAEA;CACC,WAAW;CACX,gBAAgB;AACjB;;AAEA;CACC,gBAAgB;AACjB;;AAEA;CACC,SAAS;CACT,UAAU;CACV,gBAAgB;CAChB,kBAAkB;CAClB,QAAQ;CACR,OAAO;AACR;;AAEA;CACC,eAAe;AAChB;;AAEA;CACC,cAAc;CACd,WAAW;CACX,gBAAgB;CAChB,qBAAqB;CACrB,6BAA6B;CAC7B,kBAAkB;AACnB;;AAEA;;CAEC,oCAAoC;AACrC;;AAEA;CACC,oCAAoC;AACrC;;AAEA;;CAEC,YAAY;CACZ,kBAAkB;CAClB,iBAAiB;CACjB,qBAAqB;CACrB,eAAe;CACf,kBAAkB;AACnB;;AAEA;CACC,0BAA0B;AAC3B;;AAEA;CACC,mBAAmB;CACnB,cAAc;CACd,eAAe;CACf,6CAA6C;CAC7C,kBAAkB;AACnB;;AAEA;CACC,cAAc;AACf;;AAEA;CACC,cAAc;CACd,qBAAqB;CACrB,gBAAgB;AACjB;;AAEA;CACC,0BAA0B;AAC3B;;AAEA;;;CAGC;AACD;CACC;;EAEC,gBAAgB;CACjB;;CAEA;EACC,YAAY;CACb;;CAEA;EACC,gCAAgC;EAChC,wBAAwB;EACxB,wBAAwB;EACxB,gBAAgB;CACjB;AACD;;AAEA;CACC;EACC,YAAY;CACb;;CAEA;EACC,YAAY;CACb;AACD","sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 39 */
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),
/* 40 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),
/* 41 */
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),
/* 42 */
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"-10 -18 100 135\"><circle cx=\"50\" cy=\"50\" r=\"50\" fill=\"none\" stroke=\"#ededed\" stroke-width=\"3\"/></svg>";

/***/ }),
/* 43 */
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"-10 -18 100 135\"><circle cx=\"50\" cy=\"50\" r=\"50\" fill=\"none\" stroke=\"#bddad5\" stroke-width=\"3\"/><path fill=\"#5dc2af\" d=\"M72 25L42 71 27 56l-4 4 20 20 34-52z\"/></svg>";

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			0: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(31);
/*
 * Jet client-server communications:
 */


const todoList = {};
const peer = new _src__WEBPACK_IMPORTED_MODULE_0__.Peer({ url: `ws://localhost:8081/` });
const addTodo = (title) => {
    peer.call('todo/add', [title]);
};
const removeTodo = (id) => {
    peer.call('todo/remove', [id]);
};
const setTodoCompleted = (todo, completed) => {
    peer.set(`todo/#${todo.id}`, {
        ...todo,
        completed: completed ? completed : !todo.completed
    });
};
const todos = new _src__WEBPACK_IMPORTED_MODULE_0__.Fetcher().path('startsWith', 'todo/#').on('data', (todo) => {
    switch (todo.event) {
        case 'Add':
        case 'Change':
            todoList[todo.path] = todo.value;
            break;
        case 'Remove':
            delete todoList[todo.path];
            break;
    }
    renderTodos();
});
/*
 * GUI Logic:
 */
const renderTodo = (todo) => {
    var container = document.createElement('li');
    if (todo.completed) {
        container.className = 'completed';
    }
    var view = document.createElement('div');
    var toggleCompleted = document.createElement('input');
    toggleCompleted.type = 'checkbox';
    toggleCompleted.className = 'toggle';
    toggleCompleted.checked = todo.completed;
    toggleCompleted.addEventListener('change', () => {
        setTodoCompleted(todo);
    });
    view.appendChild(toggleCompleted);
    var title = document.createElement('label');
    title.innerHTML = todo.title;
    view.appendChild(title);
    var removeButton = document.createElement('button');
    removeButton.className = 'destroy';
    removeButton.addEventListener('click', () => {
        removeTodo(todo.id);
    });
    view.appendChild(removeButton);
    container.appendChild(view);
    return container;
};
var getCompleted;
var getUncompleted;
const renderTodos = () => {
    var root = document.getElementById('todo-list');
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
    Object.values(todoList).forEach((todo) => {
        root.appendChild(renderTodo(todo));
    });
    getCompleted = () => Object.values(todoList).filter((todo) => todo.completed === true);
    getUncompleted = () => Object.values(todoList).filter((todo) => todo.completed === false);
    var itemsLeft = document.getElementById('todo-count');
    itemsLeft.innerHTML = '' + getUncompleted().length + ' left';
};
document.getElementById('clear-completed').addEventListener('click', () => {
    getCompleted().forEach((todo) => {
        removeTodo(todo.id);
    });
});
document.getElementById('toggle-all').addEventListener('click', () => {
    var uncompleted = getUncompleted();
    if (uncompleted.length > 0) {
        uncompleted.forEach((todo) => {
            setTodoCompleted(todo, true);
        });
    }
    else {
        getCompleted().forEach((todo) => {
            setTodoCompleted(todo, false);
        });
    }
});
document.getElementById('todo-form').addEventListener('submit', (event) => {
    try {
        const titleInput = document.getElementById('new-todo').value;
        addTodo(titleInput);
        document.getElementById('new-todo').value = "";
    }
    catch (ex) {
        console.log(ex);
    }
    event.preventDefault();
});
peer
    .connect()
    .then(() => peer.authenticate('Admin', 'test'))
    .then(() => peer.fetch(todos)).then(() => renderTodos())
    .catch((ex) => console.log(ex));

})();

/******/ })()
;
//# sourceMappingURL=client.js.map