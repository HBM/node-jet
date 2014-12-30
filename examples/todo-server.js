#!/usr/bin/env node
var jet = require('../lib/jet');

var peer = new jet.Peer({url:'ws://localhost:11123'});

var todos = {};
var id = 0;

peer.method({
	path: 'todo/add',
	call: function (todo) {
		var todoId = ++id;
		var todo = peer.state({
			path: 'todo/#' + todoId,
			value: {
				completed: todo.completed,
				title: todo.title,
				id: todoId
			},
			set: function (todo) {
				return {
					value: {
						completed: todo.completed,
						title: todo.title,
						id: todo.id
					}
				};
			}
		});

		todos[todoId] = todo;
	}
});

peer.method({
	path: 'todo/remove',
	call: function () {
		var args = Array.prototype.slice.call(arguments);
		args.forEach(function (todo) {
			todos[todo.id].remove();
		});
	}
});
