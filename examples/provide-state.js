#!/usr/bin/env node
var jet = require('../lib/jet');

var peer = new jet.Peer({
  ip: 'hbm-000a40'
});

peer.state({
  path: process.argv[2] || 'test-state',
  value: 123
});
