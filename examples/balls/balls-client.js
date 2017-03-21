/*
 * Jet client-server communications:
 */

var jet = require('node-jet')
var d3 = require('d3')
var shared = require('./shared')

var peer = new jet.Peer({
  url: (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host
})

var randomColor = function () {
  var hue = Math.abs(Math.random()) * 360
  var saturation = 40 + Math.abs(Math.random()) * 60
  return 'hsl(' + hue + ',' + saturation + '%,60%)'
}

var balls = {}

var renderBall = function (ball) {
  var circle
  if (ball.event === 'add') {
    balls[ball.path] = circle = svgContainer.append('circle')
    circle
      .transition()
      .duration(400)
      .ease('exp-out')
      .attr('r', ball.value.size)
      .attr('cx', ball.value.pos.x)
      .attr('cy', ball.value.pos.y)
      .style('fill', ball.value.color)
    circle.on('click', function () {
      peer.set(ball.path, {
        color: randomColor(),

      })
    })
  } else if (ball.event === 'change') {
    circle = balls[ball.path]
    circle
      .transition()
      .duration(200)
      .ease('exp-out')
      .attr('r', ball.value.size)
      .attr('cx', ball.value.pos.x)
      .attr('cy', ball.value.pos.y)
      .style('fill', ball.value.color)
  } else {
    circle = balls[ball.path]
    circle
      .remove()
    delete balls[ball.path]
  }
}

var allBalls = new jet.Fetcher()
  .path('startsWith', 'balls/#')
  .on('data', function (ball) {
    renderBall(ball)
  })

peer.fetch(allBalls)

var speedToDelay = {
  fast: 1,
  medium: 3,
  slow: 5
}

var delayToSpeed = {}
delayToSpeed[1] = 'fast'
delayToSpeed[3] = 'medium'
delayToSpeed[5] = 'slow'

var delayValue = new jet.Fetcher()
  .path('equals', 'balls/delay')
  .on('data', function (data) {
    var speed = delayToSpeed[data.value]
    d3.select('input[type="radio"]').attr('checked', false)
    d3.select('input[value="' + speed + '"]').attr('checked', true)
  })

peer.fetch(delayValue)

d3.selectAll('input[type="radio"]')
  .on('change', function () {
    var radio = d3.select(this)
    var delay = speedToDelay[radio.attr('value')]
    peer.set('balls/delay', delay)
  })

var svgContainer = d3.select('svg')
  .attr('viewBox', '0 0 ' + shared.canvasSize + ' ' + shared.canvasSize)
  .on('click', function () {
    var pos = d3.mouse(this)
    var dist = function (x, y) {
      var dx = x - pos[0]
      var dy = y - pos[1]
      return Math.sqrt(dx * dx + dy * dy)
    }
    var radius = Math.random() * 50 + 50
    for (var path in balls) {
      var ball = balls[path]
      var x = parseFloat(ball.attr('cx'))
      var y = parseFloat(ball.attr('cy'))
      var d = dist(x, y)
      var dir = Math.random() * 2 * Math.PI
      if (d < radius) {
        var newPos = {
          x: pos[0] + Math.cos(dir) * radius,
          y: pos[1] + Math.sin(dir) * radius
        }
        peer.set(path, {
          pos: newPos
        })
      }
    }
  })

d3.select('#circle')
  .on('click', function () {
    peer.call('balls/circle', [])
  })

d3.select('#square')
  .on('click', function () {
    peer.call('balls/square', [])
  })

d3.select('#boom')
  .on('click', function () {
    peer.call('balls/boom', [])
  })
