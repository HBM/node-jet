# jet.Peer API

Load the module "node-jet":

```javascript
var jet = require('node-jet');
```

# `jet.Peer`

The Jet Peer is able to to **consume** content provided by (other) peers:

  - **set** States to new values, see [`peer.set`](#peersetpath-value-options---promise)
  - **call** Methods, see [`peer.call`](#peercallpath-args-options---promise)
  - **fetch** States and Methods as a realtime query, see [`jet.Fetcher`](#jetfetcher)


The Jet Peer is also able to **create** content:

  - add **States** , see [`jet.State`](#jetstate)
  - add **Methods** , see [`jet.Method`](#jetmethod)


## `jet.Peer([config]) -> peer`

Creates and returns a new Jet Peer instance with the specified connection config.
The supported config fields are:

- `url`: {String} The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
- `ip`: {String} The Jet Daemon TCP trivial protocol ip (default: `localhost`)
- `port`: {String} The Jet Daemon TCP trivial protocol port (default: `11122`)
- `user`: {String, Optional} The user name used for authentication
- `password`: {String, Optional} The password used for authentication
- `rejectUnauthorized`: {Boolean, Optional} Allow self signed server certificates, when using wss:// (default: `false`)
- `headers`: {Object, Optional} Pass additional headers (cookies, bearer etc) to the WebSocket upgrade request

The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
When specifying the `url` field, the peer uses the Websocket protocol as transport.
If no `config` is provided, the Peer connects to the local ('localhost') Daemon using the trivial protocol.
Browsers do only support the Websocket transport and must be provided with a `config` with `url` field.

Authentication is optional and is explained separately.

```javascript
var jet = require('node-jet');

var peer = new jet.Peer({
  url: 'ws://jet.nodejitsu.com:80'
});

peer.connect().then(function() {
  console.log('connection to Daemon established');
  console.log('Daemon Info: ', peer.daemonInfo);
});
```
 
## `peer.connect() -> Promise`

Connects to the Daemon and returns a Promise which gets resolved as the connection is established.
After the connect Promise has been resolved, the peer provides `peer.daemonInfo`.

```javascript
peer.connect().then(function() {
   var daemonInfo = peer.daemonInfo;
   console.log('name', daemonInfo.name); // string
   console.log('version', daemonInfo.version); // string
   console.log('protocolVersion', daemonInfo.protocolVersion); // number
   console.log('can process JSON-RPC batches', daemonInfo.features.batches); // boolean
   console.log('supports authentication', daemonInfo.features.authentication); // boolean
   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
});
```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.InvalidUser`](#jetinvaliduser)
  - [`jet.InvalidPassword`](#jetinvalidpassword)
 

## `peer.close()`
 
Closes the connection to the Daemon. Returns a promise which resolves as the connection has been closed.

## `peer.isClosed() -> Promise`

Returns a promise which gets resolved when the connection to the Daemon has been closed.

## `peer.set(path, value, [options]) -> Promise`
 
Tries to set the Jet State specified by `path` to `value`. Returns a Promise which gets resolved as
the specified state has been setted successfully to the specified value. 

```javascript
peer.set('foo', 123)
	.then(function() {
    	console.log('set finished successfully');
  	}).catch(function(err) {
    	console.log('set failed', err);
	});

// dont care about the result
peer.set('foo', 12341);
```

`options` is an optional argument, which supports the following fields:

 - `timeout` in seconds. Time to wait before rejecting with a timeout error
 - `valueAsResult` boolean flag. If set `true` the returned Promise get the "real" new value as argument.


```javascript
peer.set('magic', 123, {
  timeout: 7,
  valueAsResult: true
}).then(function(realNewValue) {
    console.log('magic is now', realNewValue);
}).catch(function(err) {
    console.log('set failed', err);
});
```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.Unauthorized`](#jetunauthorized)
  - [`jet.FetchOnly`](#jetfetchonly)
  - [`jet.NotFound`](#jetnotfound)
  - [`jet.PeerError`](#jetpeererror)
  - [`jet.PeerTimeout`](#jetpeertimeout)
  - [`jet.InvalidArgument`](#jetinvalidargument)


## `peer.call(path, args, [options]) -> Promise`

Calls the Jet Method specified by `path` with `args` as arguments. Returns a Promise which may get resolved with the 
Method call's `result`. An `options` object may be specified which may define a

 - `timeout` in seconds. Time to wait before rejecting with a timeout error


```javascript
peer.call('sum', [1,2,3,4,5]).then(function(result) {
    console.log('sum is', result);
}).catch(function(err) {
    console.log('could not calc the sum', e);
});


// dont care about the result
peer.call('greet', {first: 'John', last: 'Mitchell'});
```
The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.Unauthorized`](#jetunauthorized)
  - [`jet.NotFound`](#jetnotfound)
  - [`jet.PeerError`](#jetpeererror)
  - [`jet.PeerTimeout`](#jetpeertimeout)
  - [`jet.InvalidArgument`](#jetinvalidargument)

## `peer.add(state|method) -> Promise`

Registers a `jet.State` or a `jet.Method` instance at the Daemon. The returned Promise gets resolved
when the Daemon has accepted the request and `set` (States) or `call` (Methods) events may be emitted. 

```javascript
var jim = new jet.State('persons/a4362d', {name: 'jim'});

peer.add(jim).then(function() {
  console.log('jim has been added');
});
```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.Unauthorized`](#jetunauthorized)
  - [`jet.Occupied`](#jetoccupied)

## `peer.remove(state|method) -> Promise`

Unregisters a `jet.State` or a `jet.Method` instance at the Daemon.
As soon as the returned Promise gets resolved, no `set` or `call` events for the state/method are emitted anymore.

```javascript
var jim = new jet.State('persons/a4362d', {name: 'jim'});

peer.add(jim).then(function() {
  console.log('jim has been added');
  peer.remove(jim).then(function() {
	console.log('jim has been removed');
  });
});

```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.NotFound`](#jetnotfound)

## `peer.fetch(fetcher) -> Promise`
 
Registers the fetcher at the Daemon. A `jet.Fetcher` must be created first. The returned Promise gets resolved 
when the Daemon has accepted the fetcher and `data` event may be emitted.

```javascript
var topPlayers = new jet.Fetcher()
  .path('startsWith', 'players/')
  .sortByKey('score', 'number')
  .range(1, 10)
  .on('data', function(playersArray) {
  });

peer.fetch(topPlayers);
```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)

## `peer.unfetch(fetcher) -> Promise`

Unregisters the fetcher at the Daemon. 
As soon as the returned Promise gets resolved, no `data` events for the fetcher are emitted anymore.

# `jet.State`
 
## `new jet.State(path, value, [access])`
 
- `path`: {String} The unique path of the State
- `value`: {Any} The initial value of the State
- `access`: {Object, Optional} Containing `fetchGroups` and `setGroups`

Creates a new State (but does NOT register it at the Daemon).
To register the State call `peer.add`!

```javascript
var john = new jet.State('peoples/25261', {age: 43, name: 'john'}, {
    fetchGroups: ['public'],
	setGroups: ['admin']
});

peer.add(john).then(function() {
});
```

## `state.on('set', cb)`

Registers a `set` event handler. Should be called before the state is actually added (`peer.add(state)`).
The `cb` callback gets the new requested value passed in.

The function is free to:

- return nothing, a State change is posted automatically with the `newValue`
- throw an Error, the Error should be a String or an Object with `code` and `message`
- return on Object with the supported fields:
  - `value`: {Any, Optional} the "real/adjusted" new value. This is posted as the
     new value.
  - `dontNotify`: {Boolean, Optional} Don't auto-send a change Notification


```javascript

john.on('set', function(newValue) {
	var prev = this.value();
    if (newValue.age < prev.age){
      throw 'invalid age';
    }
    return {
		value: {
		  age: newValue.age,
		  name: newValue.name || prev.name
		}
	};
});

```

To provide an async `set` event handler, provide two arguments to the callback.

- The requested `newValue`
- `reply`: {Function} Method for sending the result/error.

```javascript

john.on('set', function(newValue, reply) {
	setTimeout(function() {
		var prev = this.value();
    	if (newValue.age < prev.age){
      		reply({
				error: 'invalid age'
			});
    	} else {
    		reply({
				value: {
		  			age: newValue.age,
		  			name: newValue.name || prev.name
			}});
		}
	}, 200);
});

```

The arguments to `reply` can be:

  - `value`: {Any} The new value of the state. 
  - `dontNotify`: {Boolean} Dont auto notify a state change.
  - `error`: {String/Error, Optional} Operation failed

## `state.value([newValue])`

If `newValue` is `undefined`, returns the current value. Else posts a value
change Notification that the State's value is now `newValue`.
Use this for spontaneouos changes of a State which were not initially triggered
by the `set` event handler invokation.

```javascript
var ticker = new jet.State('ticker', 1);

peer.add(ticker).then(function() {
  setTimeout(function() {
    var old = ticker.value();
    ticker.value(++old);
  },1000);
});

```

## `state.add() -> Promise`

Register the state from the Daemon convenience function. `peer.add(state)` must have been called before to initially bind the state
to the respective peer!

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.Occupied`](#jetoccupied)

## `state.remove() -> Promise`

Unregister the state from the Daemon. Is the same as calling `peer.remove(state)`.

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.NotFound`](#jetnotfound)
 
# `jet.Fetcher`

## `new jet.Fetcher()`

Creates a new fetcher. All fetcher calls are chainable.
Register the fetcher instance with a call to `peer.fetch(fetcher)`.


## `fetcher.on('data', fetchCb) -> Fetcher`

Installs a callback handler for the `data` event. 
The `fetchCb` argument for non-sorting fetches is an Object with:

- `path`: {String} The path of the State / Method which triggered the Fetch Notification
- `event`: {String} The event which triggered the Fetch Notification ('add', 'remove',
   'change')
- `value`: {Any | undefined} The current value of the State or `undefined` for Methods

```javascript
var movies = new Fetcher()
  .path('startsWith', 'movies')
  .on('data', function(data) {
    console.log(data.path, data.event, data.value);
  });

peer.fetch(movies);
```

For sorting fetch rules, the `fetchCb` arguments are: 

- `sortedStatesArray`: {Array} The sorted states/methods

```javascript
var topTenPlayers = new jet.Fetcher()
  .path('startsWith', 'players/')
  .sortByKey('score', 'number')
  .range(1, 10)
  .on('data', function(topTenPlayersArray) {
  });

peer.fetch(topTenPlayers);
```

## `fetcher.path(predicate, comp) -> Fetcher`

Adds a path matching rule to the fetcher.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/path_matcher.js#L6) `path` predicates are:

- `startsWith` {String}
- `startsNotWith` {String}
- `endsWith` {String}
- `endsNotWith` {String}
- `contains` {String}
- `containsNot` {String}
- `containsOneOf` {Array of Strings}
- `containsAllOf` {Array of Strings}
- `containsOneOf` {Array of Strings}
- `equals` {String}
- `equalsOneOf` {Array of Strings}
- `equalsNotOneOf` {Array of Strings}

## `fetcher.pathCaseInsensitive() -> Fetcher`

Makes path matching case insensitive.

## `fetcher.expression(expr) -> Fetcher`

Directly sets the fetch expression rule object. This call overwrite all previously set (chained) rules.
```javascript
// The expression may contain the following entries
var expr = {
  path: { // path based matches
    caseInsensitive: true,
    startsWith: 'foo',
    contains: ['bar', 'test']
    // and all other path based match rules
  },
  value: { // value based matches
    equals: 3
    // and other value based match rules
  },
  valueField: {
    'sub.object.path': {
      isType: 'string'
      // and other value/key based match rules
    },
    'another.sub.object.path': {
      lessThan: 5
      // and other value/key based match rules
    }
  },
  sort: {
    asArray: true, // pass items as sorted array to data callback. See fetcher.differential doc
    byPath: true, // either this
    byValue: 'number', // or this (needs supposed js type)
    byValueFiels: { // or this
      'sub.object.path': 'string'
    },
    descending: true,
    from: 1, // starts with index 1 (inclusive range)
    to: 100 // last index 100 (inclusive range)
  }
}
```

## `fetcher.value(predicate, comp) -> Fetcher`

Adds a value matching rule for **primitive type** values to the fetcher.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7) predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetcher.key(keyString, predicate, comp) -> Fetcher`

Adds a key matching rule for **Object type** values to the fetcher. 
Nested keys can be specified like this: `relatives.father.age`.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7)  predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetcher.sortByPath() -> Fetcher`

Adds a sort by path rule to the fetcher.

## `fetcher.sortByValue(type) -> Fetcher`

Adds a sort by value for **primitive types** to the fetcher. Type can be either:

- `number`
- `string`

## `fetcher.sortByKey(keyString, type) -> Fetcher`

Adds a sort by key for **Object types** to the fetcher. Type can be either:

- `number`
- `string`

Nested keys can be specified like this: `relatives.father.age`.

## `fetcher.range(from, to) -> Fetcher`

Adds a sort range to the fetcher. Note that **the first index is 1**. from-to is a closed interval, that
means `fetcher.range(1,10)` gives you up to ten matching states/methods.

## `fetcher.descending() -> Fetcher`

Adds a sort descending rule to the fetcher.

## `fetcher.ascending() -> Fetcher`

Adds a sort ascending rule to the fetcher.

## `fetcher.unfetch() -> Promise`

Unfetches (removes) the Fetcher. `callbacks` is optional.

```javascript
// setup some fetcher
var fetcher = new jet.Fetcher();

fetcher.on('data', function(path, event, value) {
  if (event === 'remove') {
    this.unfetch();
  }
});

peer.fetch(fetcher);
```

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
 
# `jet.Method`

## `new jet.Method(path, [access])`

Creates and returns a Jet Method. To register the Method at the Daemon call `peer.add(method)`.

- `path`: {String} The unique path of the Method
- `access`: {Object, Optional} Containing `fetchGroups` and `callGroups`

```javascript
var greet = new jet.Method('greet', {
    fetchGroups: ['public'],
	callGroups: ['public']
});

peer.add(greet).then(function() {
});
```

## `method.on('call', cb)`

Installs a `call` event handler, which gets executed whenever some peer issues a call request (`peer.call`).

The arguments to the `call` Function are the forwarded "args" field from of original "call" Request.
Either an Array or an Object.

The `call` method can return anything or throw an Error (String/JSON-RPC error)
if required.

```javascript
greet.on('call', function(who) {
    if (who.first === 'John') {
      throw 'John is dismissed';
    }
    var greeting = 'Hello Mr. ' + who.last;
    console.log(greeting);
    return greeting;
});
```

To provide an async `call` event handler, provide two arguments to the callback.

- The forwarded args (Array or Object)
- `reply`: {Function} Method for sending the result/error.


```javascript
greet.on('call', function(who, reply) {
    if (who.first === 'John') {
      throw 'John is dismissed';
    }
    setTimeout(function() {
      var greeting = 'Hello Mr. ' + who.last;
      console.log(greeting);
      reply({
        result: greeting
      });
    }, 100);
});
```


The arguments to `reply` can be:

  - `result`: {Truish, Optional} Operation was success
  - `error`: {String/Error, Optional} Operation failed


## `method.add() -> Promise`

Register the method from the Daemon convenience function. `peer.add(method)` must have been called before to initially bind the method
to the respective peer!

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.Occupied`](#jetoccupied)

## `method.remove() -> Promise`

Unregister the method from the Daemon. Is the same as calling `peer.remove(method)`.

The returned Promise may be rejected with:

  - [`jet.ConnectionClosed`](#jetconnectionclosed)
  - [`jet.NotFound`](#jetnotfound)
 
# Errors

All Peer methods which return a Promise maybe rejected with a typed error. See the doc of each method to see, which
error types this can be for each respective method. For instance the [`peer.add` method](#peeraddstatemethod---promise)
may throw `jet.ConnectionClosed`, `jet.Unauthorized` or `jet.Occupied`.

There are three recommended strategies for handling different errors: 
   - Using `err.name` to distinguish between the types
   - Using `instanceof` operator

```javascript
// by err.name
peer.set('foo', {age: 3, name: 'bar'})
	.then(function() {})
	.catch(function(err) {
	  if (err.name === 'NotFound') {
	    console.log('foo was not found');
	  } else if (err.name === 'PeerTimeout') {
	    console.log('foo is not responding fast enough');
	  } ...
	});
```

```javascript
// by instanceof
peer.set('foo', {age: 3, name: 'bar'})
	.then(function() {})
	.catch(function(err) {
	  if (err instanceof jet.NotFound) {
	    console.log('foo was not found');
	  } else if (err instanceof jet.PeerTimeout) {
	    console.log('foo is not responding fast enough');
	  } ...
	});
```

## `jet.BaseError`

Base class for all jet Error types. For all error instances `err instanceof Error` and `err instanceof jet.BaseError` is `true`.
 
## `jet.ConnectionClosed`
 
The connection to the specified endpoint could not be established or has been closed.

## `jet.InvalidUser`

The user (name) provided is not registered at the Daemon.

## `jet.InvalidPassword`

The password provided for the user is not correct.

## `jet.NotFound`

The State or Method specified by `path` has not been added to the Daemon.
One could `fetch` the respective State or Method to wait until it becomes available.

## `jet.Occupied`

A State or Method with the specified `path` can not be added, because another 
State/Method with the same `path` already has been added.

## `jet.PeerTimeout` 

The Peer processing the `set` or `get` request has not answered within the specified timeout.

## `jet.PeerError`

The Peer processing the `set` ot `get` request threw an error during dispatching the request.

## `jet.FetchOnly` 

The State specified by `path` cannot be changed. Some States have strict "monitor" characteristics, as they can be observed 
(by fetched), but not changed by calling `peer.set`.

## `jet.Unauthorized`

The peer instance (user/password) is not authorized to perform the requested action.
