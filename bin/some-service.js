#!/usr/bin/env node

var jet = require('../lib/jet');

var peer = new jet.Peer();

peer.state({
    path: 'acceptAll',
    value: 123,
    set: function (val) {
        console.log('acceptAll is now', val);
    }
});

peer.state({
    path: 'acceptAllButSlow',
    value: 123,
    set: function (val, done) {
        setTimeout(function () {
            console.log('acceptAllButSlow is now', val);
            done();
        }, 1000);
    }
});
