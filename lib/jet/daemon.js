'use strict'

const net = require('./net')

const uuid = require('uuid')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const EventEmitter = require('events').EventEmitter
const MessageSocket = typeof window === 'undefined' && require('./message-socket').MessageSocket

const jetUtils = require('./utils')
const jetAccess = require('./daemon/access')
const JsonRPC = require('./daemon/jsonrpc')
const jetFetcher = require('./fetcher')
const fetchCommon = require('./fetch-common')
const Router = require('./daemon/router').Router
const Peers = require('./daemon/peers').Peers
const Elements = require('./element').Elements

const isDefined = jetUtils.isDefined
const noop = jetUtils.noop
const checked = jetUtils.checked
const errorObject = jetUtils.errorObject
const version = '2.2.0'

const InfoObject = function (options) {
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
const createDaemon = function (options) {
  options = options || {}
  const log = options.log || noop

  const users = options.users || {}
  delete options.users
  options.users = false
  const router = new Router(log)
  const elements = new Elements()
  const daemon = new EventEmitter()
  const infoObject = new InfoObject(options)
  let peers = null

  // dispatches the 'change' jet call.
  // updates the internal cache (element table)
  // and publishes a change event.
  const change = function (peer, message) {
    const params = checked(message, 'params', 'object')
    fetchCommon.changeCore(peer, elements, params)
  }

  const fetchSimpleId = 'fetch_all'

  // dispatches the 'fetch' (simple variant) jet call.
  // sets up simple fetching for this peer (fetch all (with access), unsorted).
  const fetchSimple = function (peer, message) {
    if (peer.fetchingSimple === true) {
      throw jetUtils.invalidParams('already fetching')
    }
    const queueNotification = function (nparams) {
      peer.sendMessage({
        method: fetchSimpleId,
        params: nparams
      })
    }
    // create a "fetch all" fetcher
    const fetcher = jetFetcher.create({}, queueNotification)
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
  const unfetchSimple = function (peer, message) {
    if (!peer.fetchingSimple) {
      throw jetUtils.invalidParams('not fetching')
    }
    const fetchId = fetchSimpleId
    const fetchPeerId = peer.id + fetchId

    peer.removeFetcher(fetchId)
    elements.removeFetcher(fetchPeerId)
  }

  const get = function (peer, message) {
    const params = checked(message, 'params', 'object')
    params.id = uuid.v1()
    let queueNotification
    let result

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

    const queueSuccess = function () {}

    fetchCommon.fetchCore(peer, elements, params, queueNotification, queueSuccess)
    fetchCommon.unfetchCore(peer, elements, params)
    return result
  }

  // dispatches the 'fetch' jet call.
  // creates a fetch operation and optionally a sorter.
  // all elements are inputed as "fake" add events. The
  // fetcher is only asociated with the element if
  // it "shows interest".
  const fetch = function (peer, message) {
    const params = checked(message, 'params', 'object')
    const fetchId = checked(params, 'id')

    const queueNotification = function (nparams) {
      peer.sendMessage({
        method: fetchId,
        params: nparams
      })
    }

    const queueSuccess = function () {
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
  const unfetch = function (peer, message) {
    const params = message.params
    fetchCommon.unfetchCore(peer, elements, params)
  }

  // route / forwards a peer request or notification ("call","set") to the peer
  // of the corresponding element specified by "params.path".
  // creates an entry in the "route" table if it is a request and sets up a timer
  // which will respond a response timeout error to the requestor if
  // no corresponding response is received.
  const route = function (peer, message) {
    const params = message.params
    const path = checked(params, 'path', 'string')
    const element = elements.get(path)
    if (!jetAccess.hasAccess(message.method, peer, element)) {
      throw jetUtils.invalidParams({
        noAccess: path
      })
    } else if (element.fetchOnly) {
      throw jetUtils.invalidParams({
        fetchOnly: path
      })
    }
    const req = {}
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

  const add = function (peer, message) {
    const params = checked(message, 'params', 'object')
    fetchCommon.addCore(peer, peers.eachPeerFetcherWithAccess(), elements, params)
  }

  const remove = function (peer, message) {
    const params = checked(message, 'params', 'object')
    fetchCommon.removeCore(peer, elements, params)
  }

  const config = function (peer, message) {
    const params = message.params
    const name = params.name
    delete params.name

    if (Object.keys(params).length > 0) {
      throw jetUtils.invalidParams('unsupported config field')
    }

    if (name) {
      peer.name = name
    }
  }

  const info = function (peer, message) {
    return infoObject
  }

  const authenticate = function (peer, message) {
    const params = checked(message, 'params', 'object')
    const user = checked(params, 'user', 'string')
    const password = checked(params, 'password', 'string')

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

  const safe = function (f) {
    return function (peer, message) {
      try {
        const result = f(peer, message) || true
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

  const safeForward = function (f) {
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

  const services = {
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

  const jsonrpc = new JsonRPC(services, router)

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
    const defaultListenOptions = {
      tcpPort: 11122,
      wsPort: 11123
    }
    listenOptions = listenOptions || defaultListenOptions
    if (listenOptions.tcpPort) {
      daemon.listener = net.createServer(function (peerSocket) {
        const sock = new MessageSocket(peerSocket)
        const peer = peers.add(sock)
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
        verifyClient: listenOptions.wsGetAuthentication
          ? function (info) {
              const auth = listenOptions.wsGetAuthentication(info)
              if (typeof auth === 'object') {
                info.req._jetAuth = auth
                return true
              }
              return false
            }
          : null,
        handleProtocols: function (protocols) {
          if (protocols.indexOf('jet') > -1) {
            return 'jet'
          } else {
            return false
          }
        }
      })
      daemon.wsServer.on('connection', function (ws, req) {
        const peer = peers.add(ws)
        peer.auth = req._jetAuth
        const pingMs = Object.hasOwnProperty.call(listenOptions, 'wsPingInterval') ? listenOptions.wsPingInterval : 5000
        let pingInterval
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
