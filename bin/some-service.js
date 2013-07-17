#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer();

peer.state({
    path: 'test',
    value: 123,
    set: function (val) {}
});
