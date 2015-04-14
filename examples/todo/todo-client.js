var jet = require('node-jet');

var peer = new jet.Peer({url: 'ws://' + window.location.host});

var addTodo = function(title) {
  peer.call('todo/add', [title]);
};

var removeTodo = function(id) {
  peer.call('todo/remove', [id]);
};

var removeAllTodos = function() {
  peer.call('todo/remove', []);
};

var editTodo = function(id, title, completed) {
  peer.set('todo/#' + id, {title: title, completed: completed});
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
}, function(todos) {
  renderTodos(todos);
});

var renderTodos = function(todos) {
	console.log(todos);
};

var addButton = document.getElementById('add-button');

addButton.addEventListener('click', function() {
	var title = document.getElementById('title-input').value;
	addTodo(title);
});
