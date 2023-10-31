#!/usr/bin/env node

import { Daemon, Method, Peer, State } from '../../../lib'
import { canvasSize } from '../defs'

var port = parseInt(process.argv[2]) || 8081
var internalPort = 10225
var numBalls = 150

// Create Jet Daemon
var daemon = new Daemon({
  features: {
    fetch: 'full',
    asNotification: false
  }
})
daemon.listen({
  tcpPort: internalPort,
  wsPort: 11123
})

// Create Jet Peer
var peer = new Peer({
  port: internalPort
})

var randomPos = () => {
  return {
    x: Math.random() * canvasSize,
    y: Math.random() * canvasSize
  }
}

var circlePos = () => {
  var rad = Math.random() * Math.PI
  var max = canvasSize / 2
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

var edgePos = () => {
  var x = Math.random()
  var size = 0.8
  if (Math.random() > 0.7) {
    size = 0.4
  }
  var border = (1 - size) / 2
  var min = border * canvasSize
  var max = (size + border) * canvasSize
  var pos = Math.random() * size * canvasSize + min
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

var randomColor = () => {
  var hue = Math.abs(Math.random()) * 360
  var saturation = 40 + Math.abs(Math.random()) * 60
  return 'hsl(' + hue + ',' + saturation + '%,60%)'
}

var balls: State<ballType>[] = []

var id = 0

export type ballType = {
  pos: { x: number; y: number }
  color: string
  size: number
}
var createBall = () => {
  var pos = circlePos()
  var color = randomColor()
  var ball = new State('balls/#' + id++, {
    pos: pos,
    color: color,
    size: 8
  })
  ball.on('set', (newVal) => {
    var val = ball.value()
    val.pos = newVal.pos || val.pos
    val.color = newVal.color || val.color
    val.size = newVal.size || val.size
    return {
      value: val
    }
  })
  peer.add(ball).then(() => {
    balls.push(ball)
  })
}

var delay = new State('balls/delay', 3)
delay.on('set', () => {
  console.log('set delay')
})

var repositionBalls = (
  calcPos: () => { x: number; y: number },
  delay: number,
  sizeX = 20
) => {
  balls.forEach((ball, index) => {
    setTimeout(() => {
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

var circle = new Method('balls/circle')
circle.on('call', () => {
  repositionBalls(circlePos, delay.value())
})

var square = new Method('balls/square')
square.on('call', () => {
  repositionBalls(edgePos, delay.value())
})

var boom = new Method('balls/boom')
boom.on('call', () => {
  var center = canvasSize / 2
  repositionBalls(
    () => {
      return {
        x: center,
        y: center
      }
    },
    0.1,
    1
  )
  setTimeout(() => {
    repositionBalls(randomPos, 0.1, 8)
  }, 1000)
})

peer
  .connect()
  .then(
    () =>
      Promise.all([
        peer.add(circle),
        peer.add(square),
        peer.add(boom),
        peer.add(delay)
      ]).then(() => {
        for (var i = 0; i < numBalls; ++i) {
          createBall()
        }
      })
    // connect peer and register methods
  )
  .then(() => {
    console.log('balls-server ready')
    console.log('listening on port', port)
  })
