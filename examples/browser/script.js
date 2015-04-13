// init jet connection using browserified node-jet where 'jet' is a global.
var peer = new jet.Peer({
	url: 'ws://localhost:11123'
});

peer.on('open', function (info) {
	console.log('connection to Daemon established', info);
});