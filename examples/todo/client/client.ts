/*
 * Jet client-server communications:
 */
import { Fetcher, Peer, PublishMessage } from '../../../lib'
import { Todo } from '../server/Todo'
import './base.css'

const todoList: Record<string, Todo> = {}
const peer = new Peer({
  url: `ws://localhost:8081/`
  // log: {
  //   logCallbacks: [console.log],
  //   logName: 'Peer 2',
  //   logLevel: LogLevel.socket
  // }
})

const addTodo = (title: string) => {
  peer.call('todo/add', [title])
}

const removeTodo = (id: string) => {
  peer.call('todo/remove', [id])
}

const setTodoCompleted = (todo: Todo, completed?: boolean) => {
  peer.set(`todo/#${todo.id}`, {
    ...todo,
    completed: completed ? completed : !todo.completed
  })
}
const todos = new Fetcher()
  .path('startsWith', 'todo/#')
  .addListener('data', (todo: PublishMessage<Todo>) => {
    switch (todo.event) {
      case 'Add':
      case 'Change':
        todoList[todo.path] = todo.value
        break
      case 'Remove':
        delete todoList[todo.path]
        break
    }
    renderTodos()
  })
/*
 * GUI Logic:
 */

const renderTodo = (todo: Todo) => {
  var container = document.createElement('li')
  if (todo.completed) {
    container.className = 'completed'
  }
  var view = document.createElement('div')
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = todo.completed
  toggleCompleted.addEventListener('change', () => {
    setTodoCompleted(todo)
  })
  view.appendChild(toggleCompleted)

  var title = document.createElement('label')
  title.innerHTML = todo.title
  view.appendChild(title)

  var removeButton = document.createElement('button')
  removeButton.className = 'destroy'
  removeButton.addEventListener('click', () => {
    removeTodo(todo.id)
  })
  view.appendChild(removeButton)

  container.appendChild(view)

  return container
}

var getCompleted: () => Todo[]
var getUncompleted: () => Todo[]

const renderTodos = () => {
  var root = document.getElementById('todo-list')!
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }
  Object.values(todoList).forEach((todo) => {
    root.appendChild(renderTodo(todo))
  })

  getCompleted = () =>
    Object.values(todoList).filter((todo) => todo.completed === true)

  getUncompleted = () =>
    Object.values(todoList).filter((todo) => todo.completed === false)

  var itemsLeft = document.getElementById('todo-count')!
  itemsLeft.innerHTML = '' + getUncompleted().length + ' left'
}
document.getElementById('clear-completed')!.addEventListener('click', () => {
  getCompleted().forEach((todo) => {
    removeTodo(todo.id)
  })
})

document.getElementById('toggle-all')!.addEventListener('click', () => {
  var uncompleted = getUncompleted()
  if (uncompleted.length > 0) {
    uncompleted.forEach((todo) => {
      setTodoCompleted(todo, true)
    })
  } else {
    getCompleted().forEach((todo) => {
      setTodoCompleted(todo, false)
    })
  }
})

document.getElementById('todo-form')!.addEventListener('submit', (event) => {
  try {
    const titleInput = (
      document.getElementById('new-todo')! as HTMLInputElement
    ).value
    addTodo(titleInput)
    ;(document.getElementById('new-todo')! as HTMLInputElement).value = ''
  } catch (ex) {
    console.log(ex)
  }
  event.preventDefault()
})

peer
  .connect()
  .then(() => peer.authenticate('Admin', 'test'))
  .then(() => peer.fetch(todos))
  .then(() => renderTodos())
  .catch((ex) => console.log(ex))
