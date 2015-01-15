#!/usr/bin/env node
var jet = require('../lib/jet');
var express = require('express');
var http = require('http');

var app = express();
app.use(express.static('./'));

var server = http.createServer(app);
var port = parseInt(process.argv[2]) || 80;
server.listen(port);

var daemon = new jet.Daemon();
daemon.listen({
  server: server,
  tcpPort: 11123
});

var peer = new jet.Peer({
  onOpen: function() {
    console.log('todo-server peer connected to daemon');
  },
  name: 'todo-server',
  port: 11123
});

var todos = {};
var id = 0;

peer.method({
  path: 'todo/add',
  call: function(todo) {
    var todoId = ++id;
    var todo = peer.state({
      path: 'todo/#' + todoId,
      value: {
        completed: todo.completed,
        title: todo.title,
        id: todoId
      },
      set: function(todo) {
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
  call: function() {
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (todo) {
      todos[todo.id].remove();
    });
  }
});

peer.method({
  path: 'todo/removeAll',
  call: function() {
    for(var id in todos) {
      todos[id].remove();
    }
  }
});
