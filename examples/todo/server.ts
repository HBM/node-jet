import {
  Daemon,
  Fetcher,
  LogLevel,
  Method,
  Peer,
  State,
  ValueType
} from '../../src'

var port = parseInt(process.argv[2]) || 8080

// // Create Jet Daemon
var daemon = new Daemon({
  log: {
    logCallbacks: [console.log],
    logName: 'Daemon',
    logLevel: LogLevel.info
  },
  username: 'Admin',
  password: 'test',
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

// Create Jet Peer
var peer = new Peer({
  url: `ws://localhost:8080/`,
  // url: `ws://172.19.191.155:8081/`,
  // url: `ws://172.19.211.59:11123/api/jet/`,
  log: {
    logCallbacks: [console.log],
    logName: 'Peer 1',
    logLevel: LogLevel.socket
  }
})
// const peer2 = new jet.Peer({
//   port: internalPort,log:{logCallbacks:[console.log],logname:"Peer 2",loglevel:jet.LogLevel.debug}

// })
type todoType = {
  completed: boolean
}

var todoStates: Record<string, State<todoType>> = {}

// Provide a "todo/add" method to create new todos
var jetState = new State<ValueType>('todo/value', { test: 4 })
jetState.on('set', (value) => {
  jetState.value(value)
})
var addTodo = new Method('todo/add')
addTodo.on('call', (args) => {
  console.log(args)
})

// Provide a "todo/remove" method to delete a certain todo
var removeTodo = new Method('todo/remove')
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
var todos = new Fetcher()
  .path('containsOneOf', ['todo/#0', 'todo/#2', 'todo/#4'])
  .value('greaterThan', 0, 'id')
  .range(1, 30)
  .ascending()
  .sortByValue()
  .on('data', () => {
    // renderTodos(todos)
  })

const stateTest = new State<ValueType>('test', 0)

peer
  .connect()
  .then(() => peer.authenticate('Admin', 'test'))
  .then(() => peer.add(jetState))
  .then(() => peer.add(addTodo))
  .then(() => peer.add(removeTodo))
  .then(() => peer.add(setCompleted))
  .then(() => peer.add(clearCompletedTodos))
  .then(() => peer.add(stateTest))
  .then(() => peer.fetch(todos))
  .then(() => peer.set('test', 2))
  .catch((ex) => {
    console.log('Caught exception', ex)
  })
