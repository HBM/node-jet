#!/usr/bin/env node

var jet = require('../lib/jet')

var daemon = new jet.Daemon()

daemon.listen({
  wsPort: 11123
})
