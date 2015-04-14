var jet = require('node-jet');

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

var editTodo = function (id, title, completed) {
	peer.set('todo/#' + id, {
		title: title,
		completed: completed
	});
};

peer.fetch({
	path: {
		startsWith: 'todo/#'
	},
	sort: {
		byValueField: {
			id: 'number'
		},
		from: 1,
		to: 30,
		asArray: true
	}
}, function (todos) {
	renderTodos(todos);
});

var renderTodos = function (todos) {
	var root = document.getElementById('todos');
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}
	todos.forEach(function (todo) {
		var titleElement = document.createElement('h3');
		titleElement.innerText = todo.value.title;
		root.appendChild(titleElement);
	});
	console.log(todos);
};

document.getElementById('add-button').addEventListener('click', function () {
	var titleInput = document.getElementById('title-input');
	addTodo(titleInput.value);
	titleInput.value = '';
});