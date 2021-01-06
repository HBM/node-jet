const jet = require('../lib/jet')

const daemon = new jet.Daemon()

const provider = new jet.Peer()

const n = 10000
const changes = 1000
const states = {}

for (let i = 0; i < n; ++i) {
  const state = new jet.State('#' + i, Math.random())
  states['#' + i] = state
  provider.add(state)
}

provider.connect().then(function () {
  console.log('provider ready')
})

const consumer = new jet.Peer()

const fetcher = new jet.Fetcher()
  .sortByValue('number')
  .range(20, 100)

let changeCount = 0
fetcher.on('data', function (data) {
  changeCount++
  const first = states[data[0].path]
  const last = states[data[data.length - 1].path]
  first.value(last.value() + Math.random())
  if (changeCount === changes) {
    console.log('done', changeCount)
    process.exit(0)
  }
})

consumer.fetch(fetcher)

consumer.connect().then(function () {
  console.log('consumer ready')
})

daemon.listen()
