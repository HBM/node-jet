# About

This is [Jet](http://jetbus.io/) for Javasript. Jet is realtime PUSH communication and an in-memory Database hybrid. Node and Browsers are supported (using Browserify).

[![Build Status](https://travis-ci.org/lipp/node-jet.svg?branch=master)](https://travis-ci.org/lipp/node-jet)

[![Coverage Status](https://coveralls.io/repos/lipp/node-jet/badge.png?branch=master)](https://coveralls.io/r/lipp/node-jet?branch=master)

[![Code Climate](https://codeclimate.com/github/lipp/node-jet/badges/gpa.svg)](https://codeclimate.com/github/lipp/node-jet)

```javascript
var jet = require('node-jet');

var peer = new jet.Peer({
  url: 'ws://localhost:11123'
});

var nowState = peer.state({
  path: 'time/now',
  value: new Date().getTime()
});

setInterval(function() {
  nowState.value(new Date().getTime());
}, 100);
```


# Install

     $ npm install node-jet
     
# Stand-Alone Daemon

The package provides a stand-alone Jet Daemon which listens on ports
11122 (trivial protocol) and 11123 (WebSockets) per default.

Start it like this (globally):

     $ jetd.js
     
Or - if installed locally:

     $ node_modules/.bin/jetd.js
     

# Integrated Daemon

If you want the Jet Daemon to listen for WebSockets on the same port as your existing
(node.js) HTTP server, use the [daemon.listen({server:httpServer})](https://github.com/lipp/node-jet/blob/master/doc/daemon.md#daemonlistentcpport1234wsport4321)
method like this:

```javascript
var httpServer = http.createServer(function(req, res) {
  // serve your stuff
});
httpServer.listen(80);

var daemon = new jet.Daemon();
daemon.listen({
  server: httpServer
});
```

# Add content

The package provides an example Peer, which adds some States and Methods to play
with:

     $ node_modules/.bin/some-service.js
     
Or just write your own:

```javascript
var jet = require('node-jet');

var peer = new jet.Peer({
  url: 'ws://localhost:11123'
});

peer.state({
  path: 'me/friends',
  value: ['John', 'Mike', 'Horst'],
  set: function(newFriends) {
    if (!likeFriends(newFriends)) {
      throw new Error('sorry, don't like you guys');
    }
  }
});

```

# Radar

Open [Radar on jetbus.io](http://jetbus.io/radar.html). Your local Jet Daemon's default WebSocket address is `ws://localhost:11123`.

To use the github Radar version:

    $ git clone https://github.com/lipp/radar
    $ jetd.js <path-to-radar>

Visit [Your Radar](http://localhost:8080). 

# Doc

For documentation refer to the [API docs](https://github.com/lipp/node-jet/tree/master/doc)
and the [Jet Homepage](http://jetbus.io).

There is also the canonical ToDo-App available:

   - [Client code](https://github.com/lipp/todomvc/blob/add-jet-angular/examples/jet-angular/js/controllers/todoCtrl.js)
   - [Client code (using angular-jet)](https://github.com/lipp/angular-jet/blob/master/tests/protractor/todo/todo.js)
   - [Server code](https://github.com/lipp/node-jet/blob/master/examples/todo-server.js)
