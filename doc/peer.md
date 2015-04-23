# jet.Peer API

Load the module "node-jet":

```javascript
var jet = require('node-jet');
```

## `peer = new jet.Peer([config])`

Creates and returns a new Jet Peer instance with the specified connection config.
The supported config fields are:

- `url`: {String} The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
- `ip`: {String} The Jet Daemon TCP trivial protocol ip (default: `localhost`)
- `port`: {String} The Jet Daemon TCP trivial protocol port (default: `11122`)

The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
When specifying the `url` field, the peer uses the Websocket protocol as transport.
If no `config` is provided, the Peer connects to the local ('localhost') Daemon using the trivial protocol.
Browsers do only support the Websocket transport and must provided a `config` with `url` field.

```javascript
var jet = require('node-jet');

var peer = new jet.Peer({
  url: 'ws://jet.nodejitsu.com:80'
});

peer.on('open', function(daemonInfo) {
    console.log('connection to Daemon established');
    console.log('Daemon Info: ', daemonInfo);
});
```
### Events
 
The Jet Peer is an EventEmitter and emits the events:
 - "close" (argument: `reason` {any})
 - "open" (argument: `daemonInfo` {Object})
 - "error" (argument: `error` {any})

The `daemonInfo` argument to the "open" event is as follows:

```javascript
peer.on('open', function(daemonInfo) {
   console.log('name', daemonInfo.name); // string
   console.log('version', daemonInfo.version); // string
   console.log('protocolVersion', daemonInfo.protocolVersion); // number
   console.log('can process JSON-RPC batches', daemonInfo.features.batches); // boolean
   console.log('supports authentication', daemonInfo.features.authentication); // boolean
   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
});
```
## `promise = peer.authenticate(user, password)`

Authenticates the `peer` as `user` if the `password` is correct. The peer gains the access rights 
as defined in the daemon's `users` object.

Must be called before calling `peer.fetch`. Unauthenticated peers will have access to all States and Methods
which did not specify an `access` field.

```javascript
peer.authenticate('foo', 'secretbar').then(function() {
  console.log('great success!');
}).catch(function(err) {
  console.log('failed', err);
});
```

## `peer.close()`
 
Closes the connection to the Daemon.

## `promise = peer.set(path, value, [timeout])`
 
Tries to set the Jet State specified by `path` to `value` with an optional `timeout` [seconds]. 

```javascript
peer.set('foo', 123).then(function() {
    console.log('set finished successfully');
  }).catch(function(err) {
    console.log('set failed', e);
  });

// dont care about the result
peer.set('foo', 12341);
```

The promise resolve callback may define an input argument, 
which will have the new "real" value of the state as this may be different than the one specified. This is a more expensive call
ans should be used only when neccesary.

```javascript
peer.set('magic', 32.12).then(function(realValue) {
    console.log('real value is', realValue);
  }).catch(err) {
    console.log('err', err);
  });
```

## `promise = peer.call(path, args, [timeout])`

Calls the Jet Method specified by `path` with `args` as arguments with an optional `timeout` [seconds].
`args` must be an Object or an Array. 

```javascript
peer.call('sum', [1,2,3,4,5]).then(function(result) {
    console.log('sum is', result);
  }).catch(function(e) {
    console.log('could not calc the sum', e);
  });
});

// dont care about the result
peer.call('greet', {first: 'John', last: 'Mitchell'});
```

## `fetchChain = peer.fetch()`

Creates and returns a FetchChain instance. Use it like this:

```javascript
fetchRef = peer.fetch()
  .path('startsWith', 'players/')
  .sortByKey('score', 'number')
  .range(1, 10)
  .run(function(topTenPlayers, fetchRef) {
  });
```

## `promise = fetchChain.run(fetchCb)`

Runs (starts) the fetch rule defined by the FetchChain instance. 
`.run` stops the fetchChain and returns a promise which gets resolved when
it has been registered at the Daemon.

The `fetchCb` arguments for non-sorting fetches are:

- `path`: {String} The path of the State / Method which triggered the Fetch Notification
- `event`: {String} The event which triggered the Fetch Notification ('add', 'remove',
   'change')
- `value`: {Any | undefined} The current value of the State or `undefined` for Methods
- `fetchRef`: {Object} The reference of the fetch (for unfetching)

```javascript
fetchRef = peer.fetch()
  .path('startsWith', 'movie)
  .run(function(path, event, value, fetchRef) {
    if (value.title === 'Foo') {
	  fetchRef.unfetch();
	}
  }).then(function() {
    console.log('fetch is setup');  
  });
```

For sorting fetch rules, the `fetchCb` arguments are: 

- `sortedStatesArray`: {Array} The sorted states/methods
- `fetchRef`: {Object} The reference of the fetch (for unfetching)

```javascript
fetchRef = peer.fetch()
  .path('startsWith', 'players/')
  .sortByKey('score', 'number')
  .range(1, 10)
  .run(function(topTenPlayers, fetchRef) {
  });
```

## `fetchChain = fetchChain.path(predicate, comp)`

Adds a path matching rule to the fetchChain.

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

## `fetchChain = fetchChain.value(predicate, comp)`
 
Adds a value matching rule for **primitive type** values to the fetchChain.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7) predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetchChain = fetchChain.key(keyString, predicate, comp)`

Adds a key matching rule for **Object type** values to the fetchChain. 
Nested keys can be specified like this: `relatives.father.age`.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7)  predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetchChain = fetchChain.sortByPath()`

Adds a sort by path rule to the fetchChain.

## `fetchChain = fetchChain.sortByValue(type)

Adds a sort by value for **primitive types** to the fetchChain. Type can be either:

- `number`
- `string`

## `fetchChain = fetchChain.sortByKey(keyString, type)

Adds a sort by key for **Object types** to the fetchChain. Type can be either:

- `number`
- `string`

Nested keys can be specified like this: `relatives.father.age`.

## `fetchChain = fetchChain.range(from, to)`

Adds a sort range to the fetchChain. Note that **the first index is 1**. from-to is a closed interval, that
means `fetchChain.range(1,10)` gives you up to ten matching states/methods.

## `fetchChain = fetchChain.descending()`

Adds a sort descending rule to the fetchChain.

## `fetchChain = fetchChain.ascending()`

Adds a sort ascending rule to the fetchChain.


## `method = peer.method(desc)`
 
Creates and returns a Jet Method given the information provided by `desc`.
The supported `desc` fields are:

- `path`: {String} The unique path of the Method
- `access`: {Object, Optional} Containing `fetchGroups` and `callGroups`
- `call`: {Function, Optional} The Function which "executes" the method (synchronous)
- `callAsync`: {Function, Optional} The Function which "executes" the method
  (asychronously)

Don't specify `call` and `callAsync` at the same time.

The arguments to the `call` Function are:

- An Object with the forwarded "args" field from of original "call" Request
- An unpacked Array, if the forwarded "args" of the original "call" Request
  field was an Array

The `call` method can return anything or throw an Error (String/JSON-RPC error)
if required.

```javascript
var greet = peer.method({
  path: 'greet',
  access: {
    fetchGroups: ['public'],
	callGroups: ['public']
  },
  call: function(who) {
    if (who.first === 'John') {
      throw 'John is dismissed';
    }
    var greet = 'Hello Mr. ' + who.last;
    console.log(greet);
    return greet;
  }
})

var sum = peer.method({
  path: `sum`,
  call: function(a,b,c,d,e) {
    var sum = a + b +c + d + e;
    return sum;
  }
}).then(function() {
    console.log('method added successfully');
}).catch(function(e) {
    console.log('method adding failed', e);
});
```

The arguments to the `callAsync` Function are:

- `reply`: {Function} Method for sending the result/error.
- __Either__ An Object with the forwarded "args" field from of original "call" Request
- __Or__ An unpacked Array, if the forwarded "args" of the original "call" Request
  field was an Array

The `callAsync` method can return anything or throw an Error (String/JSON-RPC error)
if required.

```javascript
var greet = peer.method({
  path: `greet`,
  callAsync: function(reply, who) {
    if (who.first === 'John') {
      throw 'John is dismissed';
    }
    setTimeout(function() {
      if (allOk) {
        var greet = 'Hello Mr. ' + who.last;
        console.log(greet);
        reply({
          result: greet
        });
      } else {
        reply({
          error: 'something went wrong'
        });
      }
    }, 100);
  }
})
```


## `state = peer.state(desc)`

Creates and returns a State given the information provided by `desc`.
The supported `desc` fields are:

- `path`: {String} The unique path of the State
- `value`: {Any} The initial value of the State
- `access`: {Object, Optional} Containing `fetchGroups` and `setGroups`
- `set`: {Function, Optional} The callback Function, that handles State "set"
  messages (synchronously)
- `setAsync`: {Function, Optional} The callback Function, that handles State "set"
  messages (asynchronously)

Don't specify `set` and `setAsync` at the same time. If neither one is provided,
the State is considered read-only and an appropriate response is replied when
someone tries to `set` the State.

The argument to the `set` is the requested `newValue`. The function is free to:

- return nothing, a State change is posted automatically with the `newValue`
- throw an Error, the Error should be a String or an Object with `code` and `message`
- return on Object with the supported fields:
  - `value`: {Any, Optional} the "real/adjusted" new value. This is posted as the
     new value.
  - `dontNotify`: {Boolean, Optional} Don't auto-send a change Notification


```javascript
var test = peer.state({
  path: 'test',
  value: 123,
  access: {
    fetchGroups: ['public'],
	setGroups: ['admin']
  },
  set: function(newValue) {
    if (newValue > 999999){
      throw 'too big';
    }
    setTest(newValue);
  }
}).then(function() {
    console.log('state added successfully');
}).catch(e) {
    console.log('state adding failed', e);
});

var testAdjust = peer.state({
  path: 'testAdjust',
  value: 123,
  set: function(newValue) {
    if (newValue > 999999){
      throw 'too big';
    } else if (newValue < 1000) {
      newValue = 1000; // adjust the request value
    }
    setTest(newValue);
    return {
      value: newValue
    };
  }
});
```

The arguments to the `setAsync` is a `reply` Function and the requested `newValue`.
The Function is free to:

- return nothing, the implementation MUST call the `reply` Function with
  - `result`: {Truish, Optional} Operation was success
  - `error`: {String/JSON-RPC Error, Optional} Operation failed
  - `dontNotify`: {Boolean, Optional} Don't auto-send a change Notification
- throw an Error, the Error should be a String or an Object with `code` and `message`


```javascript
var testAsync = peer.state({
  path: 'testAsync',
  value: 123,
  setAsync: function(reply, newValue) {
    if (newValue > 999999){
      throw 'too big';
    }
    setTimeout(function() {
      if (allOk) {
        setTest(newValue);
        reply({
          result: true
        });
      } else {
        reply({
          error: 'something went wrong'
        });
      }
    },100);
  }
});

var testAsyncAdjust = peer.state({
  path: 'testAsyncAdjust',
  value: 123,
  setAsync: function(newValue) {
    if (newValue > 999999){
      throw 'too big';
    }
    setTimeout(function() {
      if (allOk) {
        if (newValue < 1000) {
          newValue = 1000;
        }
        setTest(newValue);
        reply({
          result: true,
          value: newValue
        });
      } else {
        reply({
          error: 'something went wrong'
        });
      }
    },100);
  }
});
```

## `promise = fetcher.unfetch()`

Unfetches (removes) the Fetcher.

```javascript
// setup some fetcher
var fetcher = peer.fetch().all().run(function() {});

// unfetch it
fetcher.unfetch().then(function() {
  console.log('unfetched');
});
```

## `promise = state.remove()`

Removes the State.

```javascript
// create some state
var state = peer.state({
  path: 'test',
  value: 123
});

// remove it
state.remove().then(function() {
    console.log('state is now removed');
}).catch(function(e) {
    console.log('could not remove state', e);
});

// or just
state.remove();
```

## `promise = method.remove()`

Removes the method.

```javascript
// create some method
var method = peer.method({
  path: 'test',
  value: 123
});

// remove it
method.remove().then(function() {
    console.log('method is now removed');
}).catch(function(e) {
    console.log('could not remove method', e);
});
```

## `promise = state.value([newValue])`

If `newValue` is `undefined`, returns the current value. Else posts a value
change Notification that the State's value is now `newValue`.
Use this for spontaneouos changes of a State which were not initially triggered
by a `set` or `setAsync` invokation.

```javascript
var ticker = peer.state({
  path: 'ticker',
  value: 1
});

setTimeout(function() {
  var old = ticker.value();
  ticker.value(++old);
},1000);
```
