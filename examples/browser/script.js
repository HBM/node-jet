
var peer = new jet.Peer({
  url: 'ws://jet.nodejitsu.com:80',
  onOpen: function() {
    console.log('connection to Daemon established');
  }
});
