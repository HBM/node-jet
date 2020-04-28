#!/usr/bin/env node

var jet = require('node-jet')
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
var shared = require('./shared')

var port = parseInt(process.argv[2]) || 80
var numBalls = 150

// Serve this dir as static content
var serve = serveStatic('./')

// Create Webserver
var httpServer = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

httpServer.listen(port)

// Create Jet Daemon
var daemon = new jet.Daemon()
daemon.listen({
  server: httpServer // embed jet websocket upgrade handler
})

// Create Jet Peer
var peer = new jet.Peer({
  url: 'ws://localhost:' + port
})

var randomPos = function () {
  return {
    x: Math.random() * shared.canvasSize,
    y: Math.random() * shared.canvasSize
  }
}

var circlePos = function () {
  var rad = Math.random() * Math.PI
  var max = shared.canvasSize / 2
  var radius = 0.8 * max
  if (Math.random() > 0.5) {
    rad = rad * -1
  }
  if (Math.random() > 0.8) {
    radius = max * 0.2
  }
  return {
    x: Math.sin(rad) * radius + max,
    y: Math.cos(rad) * radius + max
  }
}

var edgePos = function () {
  var x = Math.random()
  var size = 0.8
  if (Math.random() > 0.7) {
    size = 0.4
  }
  var border = (1 - size) / 2
  var min = border * shared.canvasSize
  var max = (size + border) * shared.canvasSize
  var pos = Math.random() * size * shared.canvasSize + min
  if (x > 0.75) {
    return {
      x: min,
      y: pos
    }
  } else if (x > 0.5) {
    return {
      x: max,
      y: pos
    }
  } else if (x > 0.25) {
    return {
      x: pos,
      y: max
    }
  } else {
    return {
      x: pos,
      y: min
    }
  }
}

var randomColor = function () {
  var hue = Math.abs(Math.random()) * 360
  var saturation = 40 + Math.abs(Math.random()) * 60
  return 'hsl(' + hue + ',' + saturation + '%,60%)'
}

var balls = []

var id = 0

var createBall = function () {
  var pos = circlePos()
  var color = randomColor()
  var ball = new jet.State('balls/#' + id++, {
    pos: pos,
    color: color,
    size: 8
  })
  ball.on('set', function (newVal) {
    var val = this.value()
    val.pos = newVal.pos || val.pos
    val.color = newVal.color || val.color
    val.size = newVal.size || val.size
    return {
      value: val
    }
  })
  peer.add(ball).then(function () {
    balls.push(ball)
  })
}

for (var i = 0; i < numBalls; ++i) {
  createBall()
}

var delay = new jet.State('balls/delay', 3)
delay.on('set', jet.State.acceptAny)

var repositionBalls = function (calcPos, delay, sizeX) {
  balls.forEach(function (ball, index) {
    setTimeout(function () {
      var pos = calcPos()
      var color = ball.value().color
      var size = sizeX || ball.value().size
      ball.value({
        pos: pos,
        color: color,
        size: size
      })
    }, index * delay)
  })
}

var circle = new jet.Method('balls/circle')
circle.on('call', function (args) {
  repositionBalls(circlePos, delay.value())
})

var square = new jet.Method('balls/square')
square.on('call', function (args) {
  repositionBalls(edgePos, delay.value())
})

var boom = new jet.Method('balls/boom')
boom.on('call', function (args) {
  var center = shared.canvasSize / 2
  repositionBalls(function () {
    return {
      x: center,
      y: center
    }
  }, 0.1, 1)
  setTimeout(function () {
    repositionBalls(randomPos, 0.1, 8)
  }, 1000)
})

// connect peer and register methods
Promise.all([
  peer.connect(),
  peer.add(circle),
  peer.add(square),
  peer.add(boom),
  peer.add(delay)
]).then(function () {
  console.log('balls-server ready')
  console.log('listening on port', port)
})
