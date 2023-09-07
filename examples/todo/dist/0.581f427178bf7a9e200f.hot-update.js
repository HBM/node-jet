'use strict'
self['webpackHotUpdate'](
  0,
  {
    /***/ 26: /***/ (
      __unused_webpack_module,
      __webpack_exports__,
      __webpack_require__
    ) => {
      __webpack_require__.r(__webpack_exports__)
      /* harmony import */ var _src__WEBPACK_IMPORTED_MODULE_0__ =
        __webpack_require__(27)
      /* harmony import */ var _base_css__WEBPACK_IMPORTED_MODULE_1__ =
        __webpack_require__(56)
      /*
       * Jet client-server communications:
       */

      const todoList = {}
      const peer = new _src__WEBPACK_IMPORTED_MODULE_0__.Peer({
        url: `ws://localhost:8081/`
      })
      const addTodo = (title) => {
        peer.call('todo/add', [title])
      }
      const removeTodo = (id) => {
        peer.call('todo/remove', [id])
      }
      const setTodoCompleted = (todo, completed) => {
        peer.set(`todo/#${todo.id}`, {
          ...todo,
          completed: completed ? completed : !todo.completed
        })
      }
      const todos = new _src__WEBPACK_IMPORTED_MODULE_0__.Fetcher()
        .path('startsWith', 'todo/#')
        .on('data', (todo) => {
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
      const renderTodo = (todo) => {
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
      var getCompleted
      var getUncompleted
      const renderTodos = () => {
        var root = document.getElementById('todo-list')
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
        var itemsLeft = document.getElementById('todo-count')
        itemsLeft.innerHTML = '' + getUncompleted().length + ' left'
      }
      document
        .getElementById('clear-completed')
        .addEventListener('click', () => {
          getCompleted().forEach((todo) => {
            removeTodo(todo.id)
          })
        })
      document.getElementById('toggle-all').addEventListener('click', () => {
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
      document
        .getElementById('todo-form')
        .addEventListener('submit', (event) => {
          try {
            const titleInput = document.getElementById('new-todo').value
            addTodo(titleInput)
            document.getElementById('new-todo').value = ''
          } catch (ex) {
            console.log(ex)
          }
          event.preventDefault()
        })
      peer
        .connect()
        .then(() => peer.authenticate('Admin', 'test'))
        .then(() => peer.get({ path: { startsWith: 'test' } }))
        .then((val) => console.log(val))
        // .then(() => peer.authenticate('Operator', ''))
        .then(() => peer.fetch(todos))
        .then(() => renderTodos())
        .catch((ex) => console.log(ex))

      /***/
    }
  },
  /******/ function (__webpack_require__) {
    // webpackRuntimeModules
    /******/ /* webpack/runtime/getFullHash */
    /******/ ;(() => {
      /******/ __webpack_require__.h = () => '3f7c0d2195c2d5d3cff5'
      /******/
    })()
    /******/
    /******/
  }
)
//# sourceMappingURL=0.581f427178bf7a9e200f.hot-update.js.map
