#!/usr/bin/env node

var jet = require("../../lib/jet")

// var jet = require("node-jet")
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
const { State } = require("../../lib/jet")

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
var daemon = new jet.Daemon(
  {
    log:{
      logCallbacks:[console.log],
      logname:"Daemon",
      loglevel:jet.LogLevel.socket},
    features:{
      fetch:"simple",
      batches: true, 
      asNotification:true
    }
})

daemon.listen({
  tcpPort: internalPort,wsPort:11123
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
  port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 1",loglevel:jet.LogLevel.info}
})
const peer2 = new jet.Peer({
  port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

})

var todoStates = {}

// Provide a "todo/add" method to create new todos
var value = new jet.State('todo/value',0)
var addTodo = new jet.Method('todo/add')
addTodo.on('call', (args) => {
  // console.log("Called add",args)
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
  if(id in todoStates){
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
  // console.log("Received set completed", test)
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
  .path('containsOneOf', ['todo/#0',"todo/#2","todo/#4"])
  // .sortByKey('id', 'number')
  .value("greaterThan",0,"id")
  .range(1, 30)
  .ascending()
  .sortByValue()
  .on('data', function (todos) {
    console.log("fetch 1",todos.event,todos.path,todos.value)
    // renderTodos(todos)
  })

  var f2 = new jet.Fetcher()
  .path('startsWith', 'test')
  .on('data', function (todos) {
    console.log("fetch 2",todos.event,todos.path,todos.value)
    // renderTodos(todos)
  })
const stateTest = new jet.State("test",0)
console.log("Adding 1st peer")
peer.connect()
.then(()=>peer.batch(()=>{
  peer.add(value)
  peer.add(stateTest)
  peer.add(addTodo)
  peer.add(removeTodo)
  peer.add(setCompleted)
  peer.add(clearCompletedTodos)
  peer.fetch(f2)
}))
.then(()=>peer.call('todo/add',["another one"]))
.then(()=>peer2.connect())
.then(()=>peer.batch(()=>{
  peer.call('todo/add',["first"])
  peer.call('todo/add',["second"])
}))
.then(()=>peer.fetch(todos))
.then(()=>peer.add(new jet.State("test2",4)))
.then(()=>peer.add(new jet.State("test3",4)))
.then(()=>stateTest.value(2))
.then(()=>stateTest.value(0))
.then(()=>peer.set('todo/value',2))
.then(()=>peer.call('todo/add',["third"]))
.then(()=>peer.call('todo/add',["four"]))
.then(()=>peer.set('todo/#0', {id: 4}))
.then(()=>peer.set('todo/#2', {completed: true}))
.catch((ex)=>console.log(ex))





