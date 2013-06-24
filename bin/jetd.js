#!/usr/bin/env node

var jet = require('../lib/jet');
jet.createDaemon().listen({
    tcpPort: 11122
});
