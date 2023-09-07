/*
 * Jet client-server communications:
 */
import { select, selectAll, pointer } from 'd3-selection'
import { Fetcher, Peer } from '../../../src'
import { canvasSize } from '../defs'
import { ballType } from '../server'

var peer = new Peer({ url: 'ws://localhost:11123' })

type ballEvent = {
  value: ballType
  path: string
  event: string
}

var balls: Record<string, { value: ballType }> = {}

var renderBall = (ball: ballEvent) => {
  if (ball.event === 'Add') {
    try {
      balls[ball.path] = ball
      svgContainer
        .selectAll('circle')
        .data(Object.keys(balls))
        .join('circle')
        .attr('cx', (key) => balls[key].value.pos.x)
        .attr('cy', (key) => balls[key].value.pos.y)
        .attr('r', (key) => balls[key].value.size)
        .style('fill', (key) => balls[key].value.color)
    } catch (ex) {
      console.log(ex, ball.path, balls[ball.path], balls)
    }
  } else if (ball.event === 'Change') {
    balls[ball.path] = ball
    svgContainer
      .selectAll('circle')
      .data(Object.keys(balls))
      .join('circle')
      .attr('r', (key) => balls[key].value.size)
      .attr('cx', (key) => balls[key].value.pos.x)
      .attr('cy', (key) => balls[key].value.pos.y)
      .style('fill', (key) => balls[key].value.color)
  } else {
    // balls[ball.path].remove()
    delete balls[ball.path]
  }
}

var allBalls = new Fetcher()
  .path('startsWith', 'balls/#')
  .on('data', (ball) => renderBall(ball))

var speedToDelay: Record<string, number> = {
  fast: 1,
  medium: 3,
  slow: 5
}

var delayToSpeed: Record<number, string> = { 1: 'fast', 3: 'medium', 5: 'slow' }

var delayValue = new Fetcher()
  .path('equals', 'balls/delay')
  .on('data', (data) => {
    var speed = delayToSpeed[data.value]
    select('input[type="radio"]').attr('checked', false)
    select('input[value="' + speed + '"]').attr('checked', true)
  })

selectAll('input[type="radio"]').on('change', function () {
  var radio = select('input[type="radio"]')
  var delay = speedToDelay[radio.attr('value')]
  peer.set('balls/delay', delay)
})

var svgContainer = select('svg')
  .attr('viewBox', '0 0 ' + canvasSize + ' ' + canvasSize)
  .attr('height', canvasSize)
  .on('click', () => {
    select('svg').on('mousemove', (event) => {
      var coords = pointer(event)
      var dist = (x: number, y: number) => {
        var dx = x - coords[0]
        var dy = y - coords[1]
        return Math.sqrt(dx * dx + dy * dy)
      }
      var radius = Math.random() * 50 + 50
      for (var path in balls) {
        var ball = balls[path]
        var d = dist(ball.value.pos.x, ball.value.pos.y)
        var dir = Math.random() * 2 * Math.PI
        if (d < radius) {
          var newPos = {
            x: coords[0] + Math.cos(dir) * radius,
            y: coords[1] + Math.sin(dir) * radius
          }
          peer.set(path, {
            pos: newPos
          })
        }
      }
    })
  })

select('#circle').on('click', () => {
  peer.call('balls/circle', [])
})

select('#square').on('click', () => {
  peer.call('balls/square', [])
})

select('#boom').on('click', () => {
  peer.call('balls/boom', [])
})

peer
  .connect()
  .then(() => peer.fetch(allBalls))
  .then(() => peer.fetch(delayValue))
