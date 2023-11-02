import { Daemon, Method, Peer, State, ValueType } from '../../../lib'
import { Todo } from './Todo'

var port = parseInt(process.argv[2]) || 8081

// // Create Jet Daemon
var daemon = new Daemon({
  username: 'Admin',
  password: 'test',
  features: {
    fetch: 'full',
    batches: false,
    asNotification: false
  }
  // log: {
  //   logCallbacks: [console.log],
  //   logName: 'Daemon',
  //   logLevel: LogLevel.socket
  // }
})

daemon.listen({
  wsPort: port
})
console.log('todo-server ready')
console.log('listening on port', port)

// Create Jet Peer
var peer = new Peer({
  url: `ws://localhost:8081/`
  // log: {
  //   logCallbacks: [console.log],
  //   logName: 'Peer 1',
  //   logLevel: LogLevel.socket
  // }
})
// const peer2 = new jet.Peer({
//   port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

// })

var todoStates: Record<string, State<Todo>> = {}

// Provide a "todo/add" method to create new todos
var jetState = new State<ValueType>('todo/value', { test: 4 })
jetState.on('set', (value) => {
  jetState.value(value)
})
var addTodo = new Method('todo/add')
addTodo.on('call', (args) => {
  var title = args[0]
  var todo = new Todo(title)

  // create a new todo state and store ref.
  const todoState = new State('todo/#' + todo.id, todo)
  todoState.on('set', (requestedTodo) => {
    todo.merge(requestedTodo)
  })
  todoStates[todo.id] = todoState
  peer.add(todoState)
})

// Provide a "todo/remove" method to delete a certain todo
var removeTodo = new Method('todo/remove', 'admin')
removeTodo.on('call', (id: string) => {
  if (id in todoStates) {
    peer.remove(todoStates[id] as State<ValueType>)
    delete todoStates[id]
  }
})

// Provide a "todo/remove" method to delete a certain todo
var clearCompletedTodos = new Method('todo/clearCompleted')
clearCompletedTodos.on('call', () => {
  Object.keys(todoStates).forEach((id) => {
    if (todoStates[id].value().completed) {
      delete todoStates[id]
    }
  })
})

// Provide a "todo/remove" method to delete a certain todo
var setCompleted = new Method('todo/setCompleted')
setCompleted.on('call', (args) => {
  Object.keys(todoStates).forEach((id) => {
    var todo = todoStates[id]
    var current = todo.value()
    if (current.completed !== args[0]) {
      current.completed = args[0]
      todo.value(current)
    }
  })
})

const stateTest = new State<ValueType>('test', 1, 'admin', 'admin')
const stateTest2 = new State<ValueType>('test2', 2)

console.log('connecting')
peer
  .connect()
  .then(() => console.log('connected'))
  .then(() => peer.authenticate('Admin', 'test'))
  .then(() => peer.addUser('Operator', '', ['operation']))
  .then(() => peer.addUser('Maintainer', '', ['maintenance']))
  .then(() => peer.add(jetState))
  .then(() => peer.add(addTodo))
  .then(() => peer.add(removeTodo))
  .then(() => peer.add(setCompleted))
  .then(() => peer.add(clearCompletedTodos))
  .then(() => peer.add(stateTest))
  .then(() => peer.add(stateTest2))
  .catch((ex) => {
    console.log('Caught exception', ex)
  })
