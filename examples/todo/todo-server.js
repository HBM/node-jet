#!/usr/bin/env node

var jet = require('../../lib/jet')

// var jet = require("node-jet")
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
const { State } = require('../../lib/jet')
const assert = require('assert')

var port = parseInt(process.argv[2]) || 8080
var internalPort = 11128

// Serve this dir as static content
// var serve = serveStatic('./')

// Create Webserver
// var httpServer = http.createServer(function (req, res) {
//   var done = finalhandler(req, res)
//   // serve(req, res, done)
// })

// httpServer.listen(port)

// // Create Jet Daemon
var daemon = new jet.Daemon({
  log: {
    logCallbacks: [console.log],
    logname: 'Daemon',
    loglevel: jet.LogLevel.info
  },
  features: {
    fetch: 'full',
    batches: true,
    asNotification: true
  }
})

daemon.listen({
  wsPort: port
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

Todo.prototype.merge = (other) => {
  if (other.completed !== undefined) {
    this.completed = other.completed
  }

  if (other.title !== undefined) {
    this.title = other.title
  }
}

// Create Jet Peer
var peer = new jet.Peer({
  url: `ws://localhost:8080/`,
  // url: `ws://172.19.191.155:8081/`,
  // url: `ws://172.19.211.59:11123/api/jet/`,
  log: {
    logCallbacks: [console.log],
    logname: 'Peer 1',
    loglevel: jet.LogLevel.socket
  }
})
// const peer2 = new jet.Peer({
//   port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

// })

var todoStates = {}

// Provide a "todo/add" method to create new todos
var jetState = new jet.State('todo/value', { test: 4 })
jetState.on('set', (value) => {
  jetState.value(12345)
})
var addTodo = new jet.Method('todo/add')
addTodo.on('call', (args) => {
  var title = args[0]
  var todo = new Todo(title)

  // create a new todo state and store ref.
  var todoState = new jet.State('todo/#' + todo.id, todo)
  todoState.on('set', (requestedTodo) => {
    todo.merge(requestedTodo)
  })
  todoStates[todo.id] = todoState
  peer.add(todoState)
})

// Provide a "todo/remove" method to delete a certain todo
var removeTodo = new jet.Method('todo/remove')
removeTodo.on('call', (id) => {
  if (id in todoStates) {
    peer.remove(todoStates[id])
    delete todoStates[id]
  }
})

// Provide a "todo/remove" method to delete a certain todo
var clearCompletedTodos = new jet.Method('todo/clearCompleted')
clearCompletedTodos.on('call', function (test) {
  // console.log("Received clear completed", test)
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
  .path('containsOneOf', ['todo/#0', 'todo/#2', 'todo/#4'])
  .value('greaterThan', 0, 'id')
  .range(1, 30)
  .ascending()
  .sortByValue()
  .on('data', function (todos) {
    renderTodos(todos)
  })

const stateTest = new jet.State('test', 0)

peer
  .connect()
  .then(() =>
    peer.batch(() => {
      peer.add(jetState)
      peer.add(addTodo)
      peer.add(removeTodo)
      peer.add(setCompleted)
      peer.add(clearCompletedTodos)
      peer.add(stateTest)
    })
  )
  .then(() => peer.fetch(todos))
  .then(() => peer.set("test",2))
  .catch((ex) => {console.log('Caught exception', ex)
  })
  
