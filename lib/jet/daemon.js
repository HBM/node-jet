'use strict'

var net = require('./net')

var uuid = require('uuid')
var WebSocket = require('ws')
var WebSocketServer = WebSocket.Server

var EventEmitter = require('events').EventEmitter
var MessageSocket = typeof window === 'undefined' && require('./message-socket').MessageSocket

var jetUtils = require('./utils')
var jetAccess = require('./daemon/access')
var JsonRPC = require('./daemon/jsonrpc')
var jetFetcher = require('./fetcher')
var fetchCommon = require('./fetch-common')
var Router = require('./daemon/router').Router
var Peers = require('./daemon/peers').Peers
var Elements = require('./element').Elements

var isDefined = jetUtils.isDefined
var noop = jetUtils.noop
var checked = jetUtils.checked
var errorObject = jetUtils.errorObject
var version = '1.5.2'

var InfoObject = function (options) {
  options.features = options.features || {}
  this.name = options.name || 'node-jet'
  this.version = version
  this.protocolVersion = '1.1.0'
  this.features = {}
  this.features.batches = true
  this.features.authentication = true
  this.features.fetch = options.features.fetch || 'full'
  return this
}

/**
 * Creates a Daemon instance
 *
 * @classdesc
 * In most cases you need one Jet Daemon instance running.
 * All Peers connect to it as in typical master(Daemon) slave(Peer)
 * architectures.
 *
 * ```javascript
 * var jet = require('node-jet')
 * var daemon = new jet.Daemon()
 * ```
 *
 * If you want to use authentication / login, you must provide a user object.
 *
 * ```javascript
 * var daemon = new jet.Daemon({
 *   users: {
 *    john: {
 *      password: '12345',
 *      auth: {
 *        fetchGroups: ['users', 'public'],
 *        setGroups: ['users'],
 *        callGroups: ['users']
 *      }
 *    }
 *  },
 *  bob: {
 *    ...
 *  }
 * })
 * ```
 *
 * @class
 * @name Daemon
 * @param {Object} [options] Options for the daemon creation
 * @param {Object} [options.users] Access restrictions and passwords for each user
 * @returns {Daemon} The newly created Daemon instance.
 *
 */
var createDaemon = function (options) {
  options = options || {}
  var log = options.log || noop

  var users = options.users || {}
  delete options.users
  options.users = false
  var router = new Router(log)
  var elements = new Elements()
  var daemon = new EventEmitter()
  var infoObject = new InfoObject(options)
  var peers

  // dispatches the 'change' jet call.
  // updates the internal cache (element table)
  // and publishes a change event.
  var change = function (peer, message) {
    var params = checked(message, 'params', 'object')
    fetchCommon.changeCore(peer, elements, params)
  }

  var fetchSimpleId = 'fetch_all'

  // dispatches the 'fetch' (simple variant) jet call.
  // sets up simple fetching for this peer (fetch all (with access), unsorted).
  var fetchSimple = function (peer, message) {
    if (peer.fetchingSimple === true) {
      throw jetUtils.invalidParams('already fetching')
    }
    var queueNotification = function (nparams) {
      peer.sendMessage({
        method: fetchSimpleId,
        params: nparams
      })
    }
    // create a "fetch all" fetcher
    var fetcher = jetFetcher.create({}, queueNotification)
    peer.fetchingSimple = true
    if (isDefined(message.id)) {
      peer.sendMessage({
        id: message.id,
        result: fetchSimpleId
      })
    }
    peer.addFetcher(fetchSimpleId, fetcher)
    elements.addFetcher(peer.id + fetchSimpleId, fetcher, peer)
  }

  // dispatchers the 'unfetch' (simple variant) jet call.
  // removes all ressources associated with the fetcher.
  var unfetchSimple = function (peer, message) {
    if (!peer.fetchingSimple) {
      throw jetUtils.invalidParams('not fetching')
    }
    var fetchId = fetchSimpleId
    var fetchPeerId = peer.id + fetchId

    peer.removeFetcher(fetchId)
    elements.removeFetcher(fetchPeerId)
  }

  var get = function (peer, message) {
    var params = checked(message, 'params', 'object')
    params.id = uuid.v1()
    var queueNotification
    var result

    if (params.sort) {
      queueNotification = function (nparams) {
        result = nparams.changes
      }
    } else {
      result = []
      queueNotification = function (nparams) {
        result.push(nparams)
      }
    }

    var queueSuccess = function () {}

    fetchCommon.fetchCore(peer, elements, params, queueNotification, queueSuccess)
    fetchCommon.unfetchCore(peer, elements, params)
    return result
  }

  // dispatches the 'fetch' jet call.
  // creates a fetch operation and optionally a sorter.
  // all elements are inputed as "fake" add events. The
  // fetcher is only asociated with the element if
  // it "shows interest".
  var fetch = function (peer, message) {
    var params = checked(message, 'params', 'object')
    var fetchId = checked(params, 'id')

    var queueNotification = function (nparams) {
      peer.sendMessage({
        method: fetchId,
        params: nparams
      })
    }

    var queueSuccess = function () {
      if (isDefined(message.id)) {
        peer.sendMessage({
          id: message.id,
          result: true
        })
      }
    }
    fetchCommon.fetchCore(peer, elements, params, queueNotification, queueSuccess)
  }

  // dispatchers the 'unfetch' jet call.
  // removes all ressources associated with the fetcher.
  var unfetch = function (peer, message) {
    var params = message.params
    fetchCommon.unfetchCore(peer, elements, params)
  }

  // route / forwards a peer request or notification ("call","set") to the peer
  // of the corresponding element specified by "params.path".
  // creates an entry in the "route" table if it is a request and sets up a timer
  // which will respond a response timeout error to the requestor if
  // no corresponding response is received.
  var route = function (peer, message) {
    var params = message.params
    var path = checked(params, 'path', 'string')
    var element = elements.get(path)
    if (!jetAccess.hasAccess(message.method, peer, element)) {
      throw jetUtils.invalidParams({
        noAccess: path
      })
    } else if (element.fetchOnly) {
      throw jetUtils.invalidParams({
        fetchOnly: path
      })
    }
    var req = {}
    if (isDefined(message.id)) {
      req.id = router.request(message, peer, element)
    }
    req.method = path

    if (message.method === 'set') {
      req.params = {
        value: params.value,
        valueAsResult: params.valueAsResult
      }
    } else {
      req.params = params.args
    }
    element.peer.sendMessage(req)
  }

  var add = function (peer, message) {
    var params = checked(message, 'params', 'object')
    fetchCommon.addCore(peer, peers.eachPeerFetcherWithAccess(), elements, params)
  }

  var remove = function (peer, message) {
    var params = checked(message, 'params', 'object')
    fetchCommon.removeCore(peer, elements, params)
  }

  var config = function (peer, message) {
    var params = message.params
    var name = params.name
    delete params.name

    if (Object.keys(params).length > 0) {
      throw jetUtils.invalidParams('unsupported config field')
    }

    if (name) {
      peer.name = name
    }
  }

  var info = function (peer, message) {
    return infoObject
  }

  var authenticate = function (peer, message) {
    var params = checked(message, 'params', 'object')
    var user = checked(params, 'user', 'string')
    var password = checked(params, 'password', 'string')

    if (peer.hasFetchers()) {
      throw jetUtils.invalidParams({
        alreadyFetching: true
      })
    }

    if (!users[user]) {
      throw jetUtils.invalidParams({
        invalidUser: true
      })
    }

    if (users[user].password !== password) {
      throw jetUtils.invalidParams({
        invalidPassword: true
      })
    }

    peer.auth = users[user].auth
    return peer.auth
  }

  var safe = function (f) {
    return function (peer, message) {
      try {
        var result = f(peer, message) || true
        if (isDefined(message.id)) {
          peer.sendMessage({
            id: message.id,
            result: result
          })
        }
      } catch (err) {
        if (isDefined(message.id)) {
          peer.sendMessage({
            id: message.id,
            error: errorObject(err)
          })
        }
      }
    }
  }

  var safeForward = function (f) {
    return function (peer, message) {
      try {
        f(peer, message)
      } catch (err) {
        if (message.id) {
          peer.sendMessage({
            id: message.id,
            error: errorObject(err)
          })
        }
      }
    }
  }

  var services = {
    add: safe(add),
    remove: safe(remove),
    call: safeForward(route),
    set: safeForward(route),
    change: safe(change),
    config: safe(config),
    info: safe(info),
    get: safe(get),
    authenticate: safe(authenticate),
    echo: safe(function (peer, message) {
      return message.params
    })
  }

  if (infoObject.features.fetch === 'full') {
    services.fetch = safeForward(fetch)
    services.unfetch = safe(unfetch)
  } else {
    services.fetch = safeForward(fetchSimple)
    services.unfetch = safe(unfetchSimple)
  }

  var jsonrpc = new JsonRPC(services, router)

  peers = new Peers(jsonrpc, elements)

  /**
   * Connection event.
   *
   * @event Daemon#connection
   * @type {Peer} The new connected Peer
   *
   */

  /**
   * Disconnect event.
   *
   * @event Daemon#disconnect
   * @type {Peer} The disconnected Peer instance.
   *
   */

  /**
   * Starts listening on the specified ports (on all interfaces). options must be an object.
   *
   * `options.wsPort` and `options.server` must not be used simultaneously. `options.tcpPort` and `options.wsPort` /
   * `options.server` can both be defined to support the "trivial" and the websocket protocol at the same time.
   * Browser Peers can only connect via Websocket.
   *
   * This shows how to use custom ports:
   * ```javascript
   * var jet = require('node-jet')
   * var daemon = new jet.Daemon()
   * daemon.listen({
   *   tcpPort: 1234,
   *   wsPort: 4321
   * })
   *
   * ```
   *
   * This shows how to attach to an http webserver:
   * ```javascript
   * var http = require('http')
   * var jet = require('node-jet')
   *
   * var httpServer = http.createServer(function(req, res) {
   *   // serve your stuff
   * })
   * httpServer.listen(80)
   *
   * var daemon = new jet.Daemon()
   * daemon.listen({
   *   server: httpServer
   * })
   * ```
   *
   * @function listen
   * @memberof Daemon
   * @param [options] The listen options
   * @param [options.tcpPort=11122] The port for the "trivial" tcp protocol
   * @param [options.wsPort=11123] The port for the Websocket protocol
   * @param [options.server] An existing http or https server to hook onto providing Websocket protocol.
   * @fires Daemon#connection
   * @fires Daemon#disconnect
   *
   */
  daemon.listen = function (listenOptions) {
    var defaultListenOptions = {
      tcpPort: 11122,
      wsPort: 11123
    }
    listenOptions = listenOptions || defaultListenOptions
    if (listenOptions.tcpPort) {
      daemon.listener = net.createServer(function (peerSocket) {
        var sock = new MessageSocket(peerSocket)
        var peer = peers.add(sock)
        peer.on('disconnect', function () {
          daemon.emit('disconnect', peer)
        })
        daemon.emit('connection', peer)
      })
      daemon.listener.listen(listenOptions.tcpPort)
    }
    if (listenOptions.wsPort || listenOptions.server) {
      daemon.wsServer = new WebSocketServer({
        port: listenOptions.wsPort,
        server: listenOptions.server,
        verifyClient: listenOptions.wsGetAuthentication ? function (info) {
          var auth = listenOptions.wsGetAuthentication(info)
          if (typeof auth === 'object') {
            info.req._jetAuth = auth
            return true
          }
          return false
        } : null,
        handleProtocols: function (protocols) {
          if (protocols.indexOf('jet') > -1) {
            return 'jet'
          } else {
            return false
          }
        }
      })
      daemon.wsServer.on('connection', function (ws, req) {
        var peer = peers.add(ws)
        peer.auth = req._jetAuth
        var pingMs = Object.hasOwnProperty.call(listenOptions, 'wsPingInterval') ? listenOptions.wsPingInterval : 5000
        var pingInterval
        if (pingMs) {
          pingInterval = setInterval(function () {
            if (ws.readyState === WebSocket.OPEN) {
              ws.ping()
            }
          }, pingMs)
        }
        peer.on('close', function () {
          clearInterval(pingInterval)
        })
        peer.on('disconnect', function () {
          daemon.emit('disconnect', peer)
        })
        daemon.emit('connection', peer)
      })
    }
  }

  daemon.close = function () {
    daemon.listener.close()
    daemon.wsServer.close()
  }
  return daemon
}

module.exports = createDaemon
