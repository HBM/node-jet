# Collaborative Todo-App with Jet

This article demonstrates how to create a realtime collaborative Todo-App with
[Jet](http://jetbus.io). The App will be able to:

   - Create/delete Todos
   - Edit Todos
   - Simultanoeous working of multiple users
   - Sort Todos


## What is Jet?
 
In many ways Jet is similar to [Pusher](http://pusher.com) or [Firebase](http://firebase.com).
But Jet has some notable differences:

   - Self-hosted
   - Flexible realtime filters
   - Flexible realtime sorting


Self-hosted means that running Jet does not involve any 3rd party servers where your data passes through.
Instead the Jet Daemon runs on **your** machine and can be easily embedded into your
node based webserver. As such Jet is free and open source.

![arch-push-3rd](./images/arch-pusher.svg)


## Project setup

For this project we need:

   - Jet
   - Webserver


The webserver is required for serving the static file content (HTML/JS/CSS).

```sh
npm install http-server
npm install node-jet
```

Subsequently we will create these files:

   - todo-server.js
   - todo-client.js
   - index.html

## todo-server.js

First we will setup the webserver and the Jet Daemon:

```javascript
var jet = require('../../lib/jet');
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
 
var port = parseInt(process.argv[2]) || 80;

// Serve this dir as static content 
var serve = serveStatic('./');
 
// Create server 
var httpServer = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})
 
httpServer.listen(port);

// Create jet daemon
var daemon = new jet.Daemon();
daemon.listen({
	server: httpServer // embed jet websocket upgrade handler
}); 
```

## Todo-Service Peer

In order to provide services or content with Jet, you need a [Peer](https://github.com/lipp/node-jet/blob/master/doc/peer.md).
Peers connect to the so called Daemon, which is the center of communications and in most cases will run on the same 
machine as your webserver.

Peers can provide or consume content. 
