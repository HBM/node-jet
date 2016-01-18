var jet = require('../../lib/jet')

var peer = new jet.Peer({
  url: 'ws://localhost:11123'
})

var ticker = new jet.State('ticker', 0)

peer.add(ticker).then(function () {
  setInterval(function () {
    ticker.value(ticker.value() + 1)
  }, 300)
})
