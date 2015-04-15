# Collaborative Todo-App with Jet

This article demonstrates how to create a realtime collaborative Todo-App with
[Jet](http://jetbus.io). The App will be able to:

   - Create/delete Todos
   - Edit Todos
   - Simultanoeous working of multiple users
	
Collaborative working in this context means, that you can open multiple browser windows and edit
the Todo List simultaneously from each of them and every windows shows the changes and stay in sync.

## What is Jet?
 
In many ways Jet is similar to [Pusher](http://pusher.com) or [Firebase](http://firebase.com) as it
can be used as backbone for distributed realtime Apps.
But Jet has some notable differences:

   - Self-hostable
   - Fully customizable backend-logic (e.g. validation)
   - Flexible realtime filters
   - Flexible realtime sorting (low-traffic)
   - Distributed Services / Content


Self-hosted means that running **Jet does not involve any 3rd party servers** where your data passes through.
Instead the Jet Daemon runs on **your** machine and can be easily embedded into your
node based webserver. 

Realtime filtering and sorting can save you a lot of bandwidth. Imagine you have records of 5000 players, but you
want to display only the ten female players with the highest score: Jet only transmits the relevant data (10 records!)
and updates your query in realtime.

Jet is free and open source.



## Project setup

For this project we need:

   - Jet
   - Webserver


The webserver is required for serving the static file content (HTML/JS/CSS).

```sh
npm install serve-static
npm install node-jet
```

Subsequently we will create these files:

   - todo-server.js (Webserver + Jet Daemon + Jet Peer)
   - todo-client.js (Jet Peer)
   - index.html

## todo-server.js

The todo-server.js will provide a webserver for serving static files and Jet Daemon
for routing. A Jet Peer will finally add the Todo-App logic be providing means for:

   - create/delete single Todos
   - let Todos change
   - delete all Todos at once


### Webserver and Jet Daemon
 
First we will setup the webserver for static files and create a Jet Daemon:

```javascript
var jet = require('node-jet');
...

// Serve this dir as static content 
var serve = serveStatic('./');

var httpServer = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})
 
httpServer.listen(port);

// Create jet daemon and embed into httpServer
var daemon = new jet.Daemon();
daemon.listen({
  server: httpServer
});
```

The Jet [Daemon](https://github.com/lipp/node-jet/blob/master/doc/daemon.md) uses Websockets 
for communication and is hooked up into the webserver so that
both listen on the same port. If required, the Daemon may run on a different port or even on another
machine.

Next we will provide the Todo-App service, by creating a [Peer](https://github.com/lipp/node-jet/blob/master/doc/peer.md)
and connecting it to the Daemon.
But first we have to understand the basic of Jet's core components: **States** and **Methods**.


### Jet Methods Primer

For actions (services) Jet provides **Methods**. They are defined by a unique **path** and a **function**, 
which gets invoked when the Method is called by another (remote) Peer. This snippet adds a "service" which prints
two arguments to the console:

```javascript
peer.method({
  path: 'print',
  call: function(a, b) {
    console.log(a, b);
  }
});
```

Another Peer may now consume the "print" service like this:

```javascript
otherPeer.call('print', ['Hello', 'World']);
```

Methods may have **any JSON-compatible argument** type and may **return any JSON-compatible** value.
Read more on Methods in the [Doc](https://github.com/lipp/node-jet/blob/master/doc/peer.md#method--peermethoddesc-callbacks).

### Jet States Primer

A Jet State is similar to a database document/entry. It has a unique **path** (key) and an associated (initial) value, which can
be of any JSON-compatible type. A **set callback** can be specified, which allows the State to react on change requests.
If the set function does not throw, **a State-Change is posted automatically**.

```javascript
var francis = {
  name: 'Francis',
  age: 33
};

var frank = peer.state({
  path: 'persons/#52A92d',
  value: francis,
  set: function(requestedValue) {
    if (requestedValue.age < francis.age) {
      throw new Error('Sorry, this is not possible');
	}
	francis = requestedValue;
  }
});
```

Another Peer may try to modify States:

```javascript
peer.set('persons/#52A92d', {name: 'Francis U.', age: 34});

peer.set('persons/#52A92d', {name: 'Francis U.', age: 20}, {
  success: function() {
    console.log('Francis just unaged');
  },
  error: function(err) {
    console.log('Damn', err);
  }
});
```

This is just a simple uncomplete example how jet allows to custom validate change requests. Jet allows you to do anything
inside the set callback, like:

   - interpolating the requested value (partial changes)
   - custom validation
   - adapting the request value

No matter what you do, all Peers will have the correct value of the State and **stay in sync**. 

### Implement the Todo-Service Peer

The following implementation also goes into the todo-server.js file.

Create a Peer which connects to the local Daemon, an Object to store all Todo States and a simple Todo class.

```javascript
var peer = new jet.Peer({
  url: 'ws://localhost:' + port
});

var todoStates = {};

var todoId = 0;

var Todo = function(title) {
  this.id = todoId++;
  this.title = title;
  this.completed = false;
};

Todo.prototype.merge = function(other) {
  if (other.completed !== undefined) {
    this.completed = other.completed;
  }

  if (other.title !== undefined) {
    this.title = other.title;
  }
};

Todo.prototype.id = function() {
  return this.id;
};
```

Provide the **todo/add** Method, which will create a new Todo State when called.

```javascript
peer.method({
	path: 'todo/add',
	call: function (title) {
		var todo = new Todo(title);
		// create a new todo state and store ref
		todoStates[todo.id()] = peer.state({
			path: 'todo/#' + todo.id(),
			value: todo,
			set: function (requestedTodo) {
			  	todo.merge(requestedTodo);
				// tell jet the actually new "value"
				return {
					value: todo
				};
			}
		});
	}
});
```

To be able to delete a Todo, we will implement **todo/remove**. If no Todo ID is provided, we will delete all Todos at once:

```javascript
peer.method({
	path: 'todo/remove',
	call: function (todoId) {
	    if (typeof todoId === 'undefined') {
			for (var id in todos) {
				todoStates[id].remove();
				delete todoStates[id];
			}
		} else {
			todoStates[todoId].remove();
			delete todoStates[todoId];
		}
	}
});
```

## todo-client.js

The Peer running in the Browser will act as a "consumer" of the Methods and States the Todo-Server Peer provides.
It will:

   - **fetch** the Todo States to display them
   - call the **todo/add** Method to create Todos
   - call the **todo/remove** Method to delete Todos
   - edit States by calling **set**

### Jet Fetch Primer

Fetching is like having a realtime query. It provides you with initial values of States and keeps track of events.
These events include:

    - a new State has been added
    - a State has been removed
    - a State's value has changed

The Jet Daemon is able to filter and sort your Fetch query based on **paths** and/or **values**. A Callback must be provided
that will be invoked everytime something relevant happens. A Fetch for getting the top ten female players could look like this:

```
peer.fetch({
    path: {
      startsWith: 'player/'
    },
    valueField: {
      gender: { // nested fields can be accessed like this: 'details.parents.name'
        equals: 'female'
      }
    },
    sort: {
      byValueField: {
        score: 'number' // nested fields can be accessed like this: 'details.parents.name'
      },
      descending: true,
      from: 1,
      to: 10,
      asArray: true
    }
  }, function(topFemalePlayers) {}
);
```

Fetch is very powerful and is exmplained in more detail in the API [doc](https://github.com/lipp/node-jet/blob/master/doc/peer.md#fetch--peerfetchrule-fetchcb-callbacks). Note that there is no **get** call at all! That is because Jet wants to keep pollers out, since they may decrease system performance.


### Implement Todo-Client

The Todo-Client implementation is straight forward:

```javascript
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
```


![arch-push-3rd](./images/arch-pusher.svg)
