# Daemon API

## new jet.Daemon([options])

Creates a new Jet daemon instance.

```javascript
var jet = require('node-jet');
var daemon = new jet.Daemon();
```

If you want to run authentication / login, you must provide a user Object.

```javascript

var daemon = new jet.Daemon({
  users: {
    john: {
	  password: '12345',
	  auth: {
	    fetchGroups: ['users','public'],
	    setGroups: ['users'],
	    callGroups: ['users']
	  }
	},
	bob: {
	  ...
	}
  }
});
```


## daemon.listen(options);

Starts listening on the specified ports (on all interfaces). `options` must be
an object. The following entries are allowed/supported:

-  `options.tcpPort`: The listening port for the "trivial" message protocol
-  `options.wsPort`: The listening port for WebSocket protocol
-  `options.wsPingInterval`: The interval in which the client gets pinged [MS]. Useful to prevent getting put to freeze (AWS) be cloud provider.
-  `options.wsGetAuthentication`: A function which may return a user authentication object (see above). If the function returns false, the connection gets refused. The argument to the function is the `info` object from [WebSocketServer:verifyClient](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback)
-  `options.server`: An existing (http or https) server to hook onto providing WebSocket protocol

`options.wsPort` and `options.server` must not be used simultaneously.
`options.tcpPort` and `options.wsPort`/`options.server` can both be defined to
support the "trivial" and the WebSocket protocol at the same time.

### daemon.listen({tcpPort:1234,wsPort:4321})

This example demonstrates how to listen for "trivial" peers on port 1234 and
for WebSocket peers on port 4321.

```javascript
var jet = require('node-jet');
var daemon = new jet.Daemon();
daemon.listen({
  tcpPort: 1234,
  wsPort: 1234
});
```

### daemon.listen({server: httpServer})

This example demonstrates how to hook the Jet daemon to an existing httpServer
to run the "ordinary" webserver on the same port as the Jet WebSocket service.

```javascript
var http = require('http');
var jet = require('node-jet');

var httpServer = http.createServer(function(req, res) {
  // serve your stuff
});
httpServer.listen(80);

var daemon = new jet.Daemon();
daemon.listen({
  server: httpServer
});
```

### daemon.on(event, callback)

The events that can be watched are connection and disconnect
.
```javascript
daemon.on('connection', function (peer) {
  console.log('connect ' + peer.id);
});

daemon.on('disconnect', function (peer) {
  console.log('disconnect ' + peer.id);
});

```
