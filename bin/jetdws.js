#!/usr/bin/env node

const jet = require('../lib/jet')

const daemon = new jet.Daemon()

daemon.listen({
  wsPort: 11123
})
