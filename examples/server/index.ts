import { Daemon, LogLevel } from '../../src'

var port = parseInt(process.argv[2]) || 11123

// // Create Jet Daemon
var daemon = new Daemon({
  log: {
    logCallbacks: [console.log],
    logName: 'Daemon',
    logLevel: LogLevel.info
  },
  features: {
    fetch: 'full',
    batches: true,
    asNotification: true
  }
})

daemon.listen({
  wsPort: 11123,
  wsPath: '/api/jet/'
})
console.log('todo-server ready')
console.log('listening on port', port)
