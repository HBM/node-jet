#!/usr/bin/env node

var jet = require('../../lib/jet')

var port = parseInt(process.argv[2]) || 11123

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
  wsPort: 11123,
  path: '/api/jet/'
})
console.log('todo-server ready')
console.log('listening on port', port)
