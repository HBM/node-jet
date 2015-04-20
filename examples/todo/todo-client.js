var jet = require('../../lib/jet');

var peer = new jet.Peer({
	url: 'ws://' + window.location.host
});

var addTodo = function (title) {
	peer.call('todo/add', [title]);
};

var removeTodo = function (id) {
	peer.call('todo/remove', [id]);
};

var removeAllTodos = function () {
	peer.call('todo/remove', []);
};

var setTodoTitle = function (id, title) {
	peer.set('todo/#' + id, {
		title: title
	});
};

var setTodoCompleted = function (id, completed) {
	peer.set('todo/#' + id, {
		completed: completed
	});
};

peer.fetch()
  .wherePath('startsWith', 'todo/#')
	.sortByKey('id', 'number')
	.range(1, 30)
	.run(renderTodos);

var renderTodo = function (todo) {
	var container = document.createElement('div');

	var input = document.createElement('input');
	input.type = 'text';
	input.value = todo.value.title;

	var changeButton = document.createElement('input');
	changeButton.type = 'button';
	changeButton.value = 'change title';
	changeButton.addEventListener('click', function () {
		setTodoTitle(todo.value.id, input.value);
	});

	var completedCheckbox = document.createElement('input');
	completedCheckbox.type = 'checkbox';
	completedCheckbox.checked = todo.value.completed;
	completedCheckbox.addEventListener('click', function () {
		setTodoCompleted(todo.value.id, !todo.value.completed);
	});

	container.appendChild(input);
	container.appendChild(changeButton);
	container.appendChild(completedCheckbox);

	return container;
};

var renderTodos = function (todos) {
	var root = document.getElementById('todos');
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}
	todos.forEach(function (todo) {
		root.appendChild(renderTodo(todo));
	});
	console.log(todos);
};

document.getElementById('add-button').addEventListener('click', function () {
	var titleInput = document.getElementById('title-input');
	addTodo(titleInput.value);
	titleInput.value = '';
});
