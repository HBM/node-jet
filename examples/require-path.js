#!/usr/bin/env node
var jet = require('node-jet');

var peer = new jet.Peer({
  ip: 'hbm-000a40'
});

peer.fetch({
  path: {
    equals: process.argv[2] || 'test-state'
  }
}, function(path, event, value) {
  console.log(path, event, value);
});
