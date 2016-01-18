#!/usr/bin/env node

var jet = require('node-jet')
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

var port = parseInt(process.argv[2]) || 80
var internalPort = 11128

// Serve this dir as static content 
var serve = serveStatic('./')

// Create Webserver 
var httpServer = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

httpServer.listen(port)

// Create Jet Daemon
var daemon = new jet.Daemon()
daemon.listen({
  server: httpServer, // embed jet websocket upgrade handler
  tcpPort: internalPort // nodejitsu prevents internal websocket connections
})

// Declare Todo Class
var todoId = 0

var Todo = function (title) {
  this.id = todoId++
  if (typeof title !== 'string') {
    throw new Error('title must be a string')
  }
  this.title = title
  this.completed = false
}

Todo.prototype.merge = function (other) {
  if (other.completed !== undefined) {
    this.completed = other.completed
  }

  if (other.title !== undefined) {
    this.title = other.title
  }
}

// Create Jet Peer
var peer = new jet.Peer({
  port: internalPort
})

var todoStates = {}

// Provide a "todo/add" method to create new todos
var addTodo = new jet.Method('todo/add')
addTodo.on('call', function (args) {
  var title = args[0]
  var todo = new Todo(title)

  // create a new todo state and store ref.
  var todoState = new jet.State('todo/#' + todo.id, todo)
  todoState.on('set', function (requestedTodo) {
    todo.merge(requestedTodo)
    return {
      value: todo
    }

  })
  todoStates[todo.id] = todoState
  peer.add(todoState)
})

// Provide a "todo/remove" method to delete a certain todo
var removeTodo = new jet.Method('todo/remove')
removeTodo.on('call', function (args) {
  var todoId = args[0]
  todoStates[todoId].remove()
  delete todoStates[todoId]
})

// connect peer and register methods
jet.Promise.all([
  peer.connect(),
  peer.add(addTodo),
  peer.add(removeTodo)
]).then(function () {
  console.log('todo-server ready')
  console.log('listening on port', port)
})
