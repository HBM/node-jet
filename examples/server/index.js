#!/usr/bin/env node

var jet = require('../../lib/jet')

var port = parseInt(process.argv[2]) || 8080

// // Create Jet Daemon
var daemon = new jet.Daemon({
  log: {
    logCallbacks: [console.log],
    logname: 'Daemon',
    loglevel: jet.LogLevel.info
  },
  features: {
    fetch: 'full',
    batches: true,
    asNotification: true
  }
})

daemon.listen({
  wsPort: port
})
console.log('todo-server ready')
console.log('listening on port', port)
