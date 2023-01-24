var jet = require('../lib/jet')

console.log('Starting benchmark')
const daemon = new jet.Daemon()
daemon.listen()
const provider = new jet.Peer()
const n = 10000
const changes = 100000
const states = {}

const consumer = new jet.Peer()

const fetcher = new jet.Fetcher()

let changeCount = 0
fetcher.on('data', (data) => {
  if (changeCount < changes) {
    console.log(changeCount, data)
    changeCount++
    const first = states[data[0].path]
    // const last = states[data[data.length - 1].path]
    first.value(Math.random())
  } else {
    console.log('done', changeCount)
    process.exit(0)
  }
})

provider
  .connect()
  .then(() => {
    for (let i = 0; i < n; ++i) {
      const state = new jet.State('#' + i, Math.random())
      states['#' + i] = state
      provider.add(state)
    }
  })
  .then(() => consumer.connect())
  .then(() => consumer.fetch(fetcher))

consumer.connect().then(() => {
  consumer.fetch(fetcher)
})
