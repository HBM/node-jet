/*
 * Jet client-server communications:
 */

var jet = require('node-jet')

var peer = new jet.Peer({
  url: (window.location.protocol === 'http:' ? 'ws://' : 'wss://') + window.location.host
})

var addTodo = function (title) {
  peer.call('todo/add', [title])
}

var removeTodo = function (id) {
  peer.call('todo/remove', [id])
}

var setTodoTitle = function (id, title) {
  peer.set('todo/#' + id, {
    title: title
  })
}

var setTodoCompleted = function (id, completed) {
  peer.set('todo/#' + id, {
    completed: completed
  })
}

var todos = new jet.Fetcher()
  .path('startsWith', 'todo/#')
  .sortByKey('id', 'number')
  .range(1, 30)
  .on('data', function (todos) {
    renderTodos(todos)
  })

peer.fetch(todos)

/*
 * GUI Logic: 
 */

var renderTodo = function (todo) {
  var container = document.createElement('li')
  if (todo.value.completed) {
    container.className = 'completed'
  }
  var view = document.createElement('div')
  var toggleCompleted = document.createElement('input')
  toggleCompleted.type = 'checkbox'
  toggleCompleted.className = 'toggle'
  toggleCompleted.checked = todo.value.completed
  toggleCompleted.addEventListener('change', function () {
    setTodoCompleted(todo.value.id, !todo.value.completed)
  })
  view.appendChild(toggleCompleted)

  var title = document.createElement('label')
  title.innerHTML = todo.value.title
  view.appendChild(title)

  var removeButton = document.createElement('button')
  removeButton.className = 'destroy'
  removeButton.addEventListener('click', function () {
    removeTodo(todo.value.id)
  })
  view.appendChild(removeButton)

  container.appendChild(view)

  return container
}

var getCompleted
var getUncompleted

var renderTodos = function (todos) {
  var root = document.getElementById('todo-list')
  while (root.firstChild) {
    root.removeChild(root.firstChild)
  }
  todos.forEach(function (todo) {
    root.appendChild(renderTodo(todo))
  })

  getCompleted = function () {
    return todos.filter(function (todo) {
      return todo.value.completed === true
    })
  }

  getUncompleted = function () {
    return todos.filter(function (todo) {
      return todo.value.completed === false
    })
  }

  var itemsLeft = document.getElementById('todo-count')
  itemsLeft.innerHTML = '' + getUncompleted().length + ' left'

}

document.getElementById('clear-completed').addEventListener('click', function () {
  getCompleted().forEach(function (todo) {
    removeTodo(todo.value.id)
  })
})

document.getElementById('toggle-all').addEventListener('click', function () {
  var uncompleted = getUncompleted()
  if (uncompleted.length > 0) {
    uncompleted.forEach(function (todo) {
      setTodoCompleted(todo.value.id, true)
    })
  } else {
    getCompleted().forEach(function (todo) {
      setTodoCompleted(todo.value.id, false)
    })
  }
})

document.getElementById('todo-form').addEventListener('submit', function (event) {
  var titleInput = document.getElementById('new-todo')
  addTodo(titleInput.value)
  titleInput.value = ''
  event.preventDefault()
})
