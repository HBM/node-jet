#!/usr/bin/env node

var jet = require('../../lib/jet');
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
 
var port = parseInt(process.argv[2]) || 80;

// Serve this dir as static content 
var serve = serveStatic('./');
 
// Create server 
var httpServer = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})
 
httpServer.listen(port);

// Create jet daemon
var daemon = new jet.Daemon();
daemon.listen({
	server: httpServer // embed jet websocket upgrade handler
});

// create a peer.
var peer = new jet.Peer({
	url: 'ws://localhost:' + port
});

var todoStates = {};
var id = 0;

// provide a "todo/add" method to create new todos
peer.method({
	path: 'todo/add',
	call: function (todo) {
		// "generate" unique id 
		var todoId = ++id;

		var mergeTodoWithDefaults = function (todo) {
			if (typeof todo !== 'object') {
				todo = {};
			}
			var merged = {};
			merged.completed = todo.completed === true || false;
			merged.title = todo.title || '';
			merged.title = merged.title.substring(0, 30);
			merged.id = todoId;
			return merged;
		};

		// create a new todo state and store ref.
		todoStates[todoId] = peer.state({
			path: 'todo/#' + todoId,
			value: mergeTodoWithDefaults(todo),
			set: function (changedTodo) {
				return {
					value: mergeTodoWithDefaults(changedTodo)
				};
			}
		});
	}
});

peer.method({
	path: 'todo/remove',
	call: function () {
		var args = Array.prototype.slice.call(arguments);
		args.forEach(function (todo) {
			todoStates[todo.id].remove();
			delete todoStates[todo.id];
		});
	}
});

peer.method({
	path: 'todo/removeAll',
	call: function () {
		for (var id in todos) {
			todoStates[id].remove();
			delete todoStates[id];
		}
	}
});
