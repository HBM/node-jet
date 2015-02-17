
// init jet connection using browserified node-jet where 'jet' is a global.
var peer = new jet.Peer({
  url: 'ws://localhost:11122',
  onOpen: function() {
    console.log('connection to Daemon established');
  }
});
