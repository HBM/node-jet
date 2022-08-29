/*
 * Jet client-server communications:
 */
import { Peer, Fetcher } from "node-jet";
const protocol = window.location.protocol === "http:" ? "ws://" : "wss://";
const todoList= {}
var peer = new Peer({port: 11123});

var addTodo = (title) => {
  peer.call("todo/add", [title]);
};

var removeTodo = (id) => {
  peer.call("todo/remove", [id]);
};

var setTodoTitle = (id, title) => {
  peer.set("todo/#" + id, {
    title: title,
  });
};

var setTodoCompleted = (todo,completed=undefined) => {
  peer.set("todo/#" + todo.id, {
    id: todo.id,
    title: todo.title,
    completed: completed?completed:!todo.completed,
  });
};

var todos = new Fetcher()
  .path("startsWith", "todo/#")
  .on("data", (todo) => {
    switch(todo.event){
      case "Add":
      case "Change":
        todoList[todo.path] = todo.value
        break
      case "Remove":
        delete todoList[todo.path]
        break
    }
    renderTodos();
  });



/*
 * GUI Logic:
 */

var renderTodo = (todo) =>{
  var container = document.createElement("li");
  if (todo.completed) {
    container.className = "completed";
  }
  var view = document.createElement("div");
  var toggleCompleted = document.createElement("input");
  toggleCompleted.type = "checkbox";
  toggleCompleted.className = "toggle";
  toggleCompleted.checked = todo.completed;
  toggleCompleted.addEventListener("change", () => {
    setTodoCompleted(todo);
  });
  view.appendChild(toggleCompleted);

  var title = document.createElement("label");
  title.innerHTML = todo.title;
  view.appendChild(title);

  var removeButton = document.createElement("button");
  removeButton.className = "destroy";
  removeButton.addEventListener("click", () => {
    removeTodo(todo.id);
  });
  view.appendChild(removeButton);

  container.appendChild(view);

  return container;
};

var getCompleted;
var getUncompleted;

var renderTodos = () => {
  var root = document.getElementById("todo-list");
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }
  Object.values(todoList).forEach((todo) => {
    root.appendChild(renderTodo(todo));
  });

  getCompleted = () => Object.values(todoList).filter((todo) =>todo.completed === true)
 

  getUncompleted = () => Object.values(todoList).filter((todo) => todo.completed === false)
 

  var itemsLeft = document.getElementById("todo-count");
  itemsLeft.innerHTML = "" + getUncompleted().length + " left";
};

document
  .getElementById("clear-completed")
  .addEventListener("click", () => {
    getCompleted().forEach((todo) => {
      removeTodo(todo.id);
    });
  });

document.getElementById("toggle-all").addEventListener("click", () =>{
  var uncompleted = getUncompleted();
  if (uncompleted.length > 0) {
    uncompleted.forEach((todo) =>{
      setTodoCompleted(todo, true);
    });
  } else {
    getCompleted().forEach((todo) => {
      setTodoCompleted(todo, false);
    });
  }
});

document
  .getElementById("todo-form")
  .addEventListener("submit", (event) =>{
    var titleInput = document.getElementById("new-todo");
    addTodo(titleInput.value);
    titleInput.value = "";
    event.preventDefault();
  });

peer.connect().then(()=>{
  peer.fetch(todos)
})