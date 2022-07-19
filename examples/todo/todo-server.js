#!/usr/bin/env node

var jet = require("../../lib/jet")

// var jet = require("node-jet")
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

var port = parseInt(process.argv[2]) || 8080
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
var daemon = new jet.Daemon({log:{logCallbacks:[console.log],logname:"Daemon",loglevel:jet.LogLevel.debug}})

daemon.listen({
  server: httpServer,
  tcpPort: internalPort
})
console.log('todo-server ready')
console.log('listening on port', port)

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
  console.log("merging",other)
  if (other.completed !== undefined) {
    this.completed = other.completed
  }

  if (other.title !== undefined) {
    this.title = other.title
  }
}

// Create Jet Peer
var peer = new jet.Peer({
  port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 1",loglevel:jet.LogLevel.debug}
})
const peer2 = new jet.Peer({
  port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

})

var todoStates = {}

// Provide a "todo/add" method to create new todos
var value = new jet.State('todo/value',0)

var addTodo = new jet.Method('todo/add')
addTodo.on('call', function (args) {
  console.log("Called add",args)
  var title = args[0]
  var todo = new Todo(title)

  // create a new todo state and store ref.
  var todoState = new jet.State('todo/#' + todo.id, todo)
  todoState.on('set', function (requestedTodo) {
    console.log("Received set", requestedTodo)
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
removeTodo.on('call', function (ids) {
  console.log("Received remove")
  ids.forEach(function (id) {
    if (todoStates[id]) {
      todoStates[id].remove()
      delete todoStates[id]
    }
  })
})

// Provide a "todo/remove" method to delete a certain todo
var clearCompletedTodos = new jet.Method('todo/clearCompleted')
clearCompletedTodos.on('call', function (test) {
  console.log("Received clear completed", test)
  Object.keys(todoStates).forEach(function (id) {
    if (todoStates[id].value().completed) {
      todoStates[id].remove()
      delete todoStates[id]
    }
  })
})

// Provide a "todo/remove" method to delete a certain todo
var setCompleted = new jet.Method('todo/setCompleted')
setCompleted.on('call', function (args) {
  console.log("Received set completed", test)
  Object.keys(todoStates).forEach(function (id) {
    var todo = todoStates[id]
    var current = todo.value()
    if (current.completed !== args[0]) {
      current.completed = args[0]
      todo.value(current)
    }
  })
})
var todos = new jet.Fetcher()
  .path('startsWith', 'todo/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (todos) {
    console.log("data",todos)
    // renderTodos(todos)
  })

  var f2 = new jet.Fetcher()
  .path('equals', 'todo/value')
  .on('data', function (todos) {
    console.log("data",todos)
    // renderTodos(todos)
  })
console.log("Adding 1st peer")
peer.connect()
.then(()=>peer.batch(()=>{
  peer.add(value)
  // peer.add(addTodo)
  // peer.add(removeTodo)
  // peer.add(setCompleted)
  // peer.add(clearCompletedTodos)
 
}))
.then(()=>peer2.connect())
// .then(()=>peer2.call('todo/add',["first"]))
// .then(()=>peer2.call('todo/add',["second"]))
// .then(()=>peer2.fetch(todos))
.then(()=>peer2.fetch(f2))
.then(()=>value.value(4))
.then(()=>value.value(8))
.then(()=>peer2.set('todo/value',2))
// .then(()=>peer2.call('todo/add',["third"]))
// .then(()=>peer2.call('todo/add',["four"]))
// .then(()=>peer2.set('todo/#2', {completed: true}))
.catch((ex)=>console.log(ex))





