# About

This is [Jet](http://jetbus.io/) for Javasript. Jet is the hybrid of an **In-Memory Database** and a **Realtime Push-Framework**. Node and Browsers are supported (using Browserify).

[![Build Status](https://travis-ci.org/lipp/node-jet.svg?branch=master)](https://travis-ci.org/lipp/node-jet)

[![Coverage Status](https://coveralls.io/repos/lipp/node-jet/badge.png?branch=master)](https://coveralls.io/r/lipp/node-jet?branch=master)

[![Code Climate](https://codeclimate.com/github/lipp/node-jet/badges/gpa.svg)](https://codeclimate.com/github/lipp/node-jet)

# Synopsis

Provide Content:

```javascript
var jet = require('node-jet');

// connect to daemon
var peer = new jet.Peer({
  url: 'ws://localhost:11123' 
});

// provide methods/factories/services/actions/etc
peer.method({
  path: 'greet', // unique path/id
  call: function(who) { // callback/action to perform if someone "calls"
    console.log('Hello', who);
  }
});

// provide documents/realtime-status/configuration/etc
peer.state({
  path: 'person/#123', // unique path/id
  value: getPerson('#123'), // initial value
  set: function(changedPerson) { // callback which processes the requested new value
    setPerson('#123', changedPerson);
    // changes are propageted automatically
  }
});

// provide read-only stuff
var nowState = peer.state({
  path: 'time/now',
  value: new Date().getTime()
});

// change async
setInterval(function() {
  nowState.value(new Date().getTime());
}, 100);
```

Consume Content:

```javascript
// fetch/grab/query/get content
otherPeer.fetch({
  path: {
    startsWith: 'person/'
  }}, function(path, event, value) {
  ...  // events can be 'add', 'change', 'remove'
});

// call methods
otherPeer.call('greet', ['Steve']);

// set states
otherPeer.set('person/#123', {name: 'Jose', age: 33});
```


# Install

## NPM
  
    $ npm install node-jet

## Bower

    $ bower install jet

## script tag
  
```html
<script src="https://rawgit.com/lipp/node-jet/master/build/jet.js"></script>
```

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

Open [Radar on jetbus.io](http://jetbus.io/radar.html), which allows you to see/observe Your Jet States and Methods. Your local Jet Daemon's default WebSocket address is `ws://localhost:11123`.


# Doc

For documentation refer to the [API docs](https://github.com/lipp/node-jet/tree/master/doc)
and the [Jet Homepage](http://jetbus.io).

There is also the canonical ToDo-App available:

   - [Client code](https://github.com/lipp/todomvc/blob/add-jet-angular/examples/jet-angular/js/controllers/todoCtrl.js)
   - [Client code (using angular-jet)](https://github.com/lipp/angular-jet/blob/master/tests/protractor/todo/todo.js)
   - [Server code](https://github.com/lipp/node-jet/blob/master/examples/todo-server.js)
