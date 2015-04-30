# About

This is [Jet](http://jetbus.io/) for Javasript. Jet is the hybrid of an **In-Memory Database** and a **Realtime Push-Framework**. Node and Browsers are supported (using Browserify).

[![Build Status](https://travis-ci.org/lipp/node-jet.svg?branch=master)](https://travis-ci.org/lipp/node-jet)

[![Coverage Status](https://coveralls.io/repos/lipp/node-jet/badge.png?branch=master)](https://coveralls.io/r/lipp/node-jet?branch=master)

[![Code Climate](https://codeclimate.com/github/lipp/node-jet/badges/gpa.svg)](https://codeclimate.com/github/lipp/node-jet)

# Synopsis

## Provide Content:

```javascript
var jet = require('node-jet');

// connect to daemon
var peer = new jet.Peer({
  url: 'ws://localhost:11123' 
});

// provide methods/factories/services/actions/etc
var greet = new jet.Method('greet');
greet.on('call', function(who) {
  console.log('Hello', who);
});

peer.add(greet);

// provide documents/realtime-status/configuration/etc
var jim = new jet.State('persons/#123', getPerson('#123'));
jim.on('set', function(changedPerson) {
  setPerson('#123', changedPerson);
  // changes are propageted automatically
});

peer.add(jim);

// provide read-only stuff
var nowState = new jet.State('time/now', new Date().getTime());

peer.add(nowState);

// change async
setInterval(function() {
  nowState.value(new Date().getTime());
}, 100);
```

## Consume Content:

```javascript
// fetch/query content
var persons = new jet.Fetcher()
  .path('startsWith', 'persons/')
  .on('data', function(path, event, value) {
    ...  // events can be 'add', 'change', 'remove'
  });

peer.fetch(persons);

// call methods
peer.call('greet', ['Steve']).then(function(greeting) {
});

// set states
peer.set('person/#123', {name: 'Jose', age: 33});
```

Read the [Todo-App Tutorial](https://github.com/lipp/node-jet/tree/master/examples/todo/README.md) for building a simple collaborative realtime app.

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

# Radar

Open [Radar on jetbus.io](http://jetbus.io/radar.html), which allows you to see/observe Your Jet States and Methods. Your local Jet Daemon's default WebSocket address is `ws://localhost:11123`.


# Doc

 - [Peer](./doc/peer.md)
 - [Daemon](./doc/daemon.md)

For further info and documentation refer to the [Jet Homepage](http://jetbus.io).

# Todo-App

There is also the canonical ToDo-App available:

   - [Client + Server Tutorial](./examples/todo/README.md)
   - [Client code](https://github.com/lipp/todomvc/blob/add-jet-angular/examples/jet-angular/js/controllers/todoCtrl.js)
   - [Client code (using angular-jet)](https://github.com/lipp/angular-jet/blob/master/tests/protractor/todo/todo.js)
