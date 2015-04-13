#!/usr/bin/env node

var http = require('http');
var jet = require('../lib/jet');
var port = parseInt(process.argv[2]) || 80;

// create a webserver.
// nodejitsu requires embedding the daemon into a http server.
var httpServer = http.createServer();
httpServer.listen(port);

// create jet daemon.
var daemon = new jet.Daemon();
daemon.listen({
	server: httpServer, // embed jet websocket upgrade handler
	tcpPort: 11128
});

// create a peer.
var peer = new jet.Peer({
	name: 'todo-server',
	port: 11128
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