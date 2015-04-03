# About

This is [Jet](http://jetbus.io/) daemon and peer
implementation.

[![Build Status](https://travis-ci.org/lipp/node-jet.svg?branch=master)](https://travis-ci.org/lipp/node-jet)

[![Coverage Status](https://coveralls.io/repos/lipp/node-jet/badge.png?branch=master)](https://coveralls.io/r/lipp/node-jet?branch=master)

[![Code Climate](https://codeclimate.com/github/lipp/node-jet/badges/gpa.svg)](https://codeclimate.com/github/lipp/node-jet)


# Install

     $ npm install node-jet

# Stand-alone daemon

The package provides a stand-alone Jet Daemon which listens on ports
11122 (trivial protocol) and 11123 (WebSockets). The daemon can optionally serve
the debug interface Radar (see below).

     $ jetd.js

# Daemon Integration

If you want the Daemon to listen for WebSockets on the same port as your existing
(node.js) HTTP server, use the [daemon.listen({server:httpServer})](https://github.com/lipp/node-jet/blob/master/doc/daemon.md#daemonlistentcpport1234wsport4321)
method.

# Start some example peer

The package provides an example peer, which adds some States and Methods to play
with.

     $ some-service.js

# Radar

Open [Radar on jetbus.io](http://jetbus.io/radar.html). Your local Jet Daemon's default WebSocket address is `ws://localhost:11123`.

To use the github Radar version:

    $ git clone https://github.com/lipp/radar
    $ jetd.js <path-to-radar>

Visit [Your Radar](http://localhost:8080). 

# Doc

For documentation refer to the [API docs](https://github.com/lipp/node-jet/tree/master/doc)
and the [Jet Homepage](http://jetbus.io).
