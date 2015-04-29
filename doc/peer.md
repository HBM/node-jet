# jet.Peer API

Load the module "node-jet":

```javascript
var jet = require('node-jet');
```

# Peer

## `jet.Peer([config]) -> peer`

Creates and returns a new Jet Peer instance with the specified connection config.
The supported config fields are:

- `url`: {String} The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
- `ip`: {String} The Jet Daemon TCP trivial protocol ip (default: `localhost`)
- `port`: {String} The Jet Daemon TCP trivial protocol port (default: `11122`)
- `user`: {String, Optional} The user name used for authentication
- `password`: {String, Optional} The password used for authentication

The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
When specifying the `url` field, the peer uses the Websocket protocol as transport.
If no `config` is provided, the Peer connects to the local ('localhost') Daemon using the trivial protocol.
Browsers do only support the Websocket transport and must provided a `config` with `url` field.

Authentication is optional and is explained separately.

```javascript
var jet = require('node-jet');

var peer = new jet.Peer({
  url: 'ws://jet.nodejitsu.com:80'
});

peer.connect().then() {
    console.log('connection to Daemon established');
    console.log('Daemon Info: ', peer.daemonInfo);
});
```

## `peer.connect() -> Promise`

Connects to the Daemon and returns a Promise which gets resolved as the connection is established.
After the connect Promise has been resolved, the peer provides `peer.daemonInfo`.

```javascript
peer.connect().then(function() {
   console.log('name', daemonInfo.name); // string
   console.log('version', daemonInfo.version); // string
   console.log('protocolVersion', daemonInfo.protocolVersion); // number
   console.log('can process JSON-RPC batches', daemonInfo.features.batches); // boolean
   console.log('supports authentication', daemonInfo.features.authentication); // boolean
   console.log('fetch-mode', daemonInfo.features.fetch); // string: 'full' or 'simple'
});
```

## `peer.close()`

Closes the connection to the Daemon.

## `peer.set(path, value, [options]) -> Promise`

Tries to set the Jet State specified by `path` to `value`. Returns a Promise which gets resolved as
the specified state has been setted successfully to the specified value. 

```javascript
peer.set('foo', 123, {
  success: function() {
    console.log('set finished successfully');
  },
  error: function(e) {
    console.log('set failed', e);
  }
});

// dont care about the result
peer.set('foo', 12341);
```

`options` is an optional argument, 
which supports the following fields


The `callbacks` Object may also specify a `timeout` in seconds and set the `valueAsResult` flag, which causes the new "real" value to be provided as argument to `success`.

```javascript
peer.set('magic', 123, {
  timeout: 7,
  valueAsResult: true,
  success: function(realNewValue) {
    console.log('magic is now', realNewValue);
  },
  error: function(e) {
    console.log('set failed', e);
  }
});
```

## `peer.call(path, args, [callbacks])`

Calls the Jet Method specified by `path` with `args` as arguments.
`args` must be an Object or an Array. `callbacks` is an optional parameter of type Object, which may hold `success` and/or `error` callback functions. A `timeout` can also be specified.

```javascript
peer.call('sum', [1,2,3,4,5], {
  success: function(result) {
    console.log('sum is', result);
  },
  error: function(e) {
    console.log('could not calc the sum', e);
  },
  timeout: 0.5
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

## `fetchChain.run(fetchCb, [callbacks])`

Runs (starts) the fetch rule defined by the FetchChain instance. Optionally executes `callbacks.success` or `callbacks.error`.
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

## `fetchChain.path(predicate, comp)`

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

## `fetchChain.value(predicate, comp)`

Adds a value matching rule for **primitive type** values to the fetchChain.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7) predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetchChain.key(keyString, predicate, comp)`

Adds a key matching rule for **Object type** values to the fetchChain. 
Nested keys can be specified like this: `relatives.father.age`.

[Implemented](https://github.com/lipp/node-jet/blob/master/lib/jet/value_matcher.js#L7)  predicates are:

- `lessThan` {any less than comparable}
- `greaterThan` {any greater than comparable}
- `equals` {any primitive type}
- `equalsNot` {any primitive type}
- `isType` {String}

## `fetchChain.sortByPath()`

Adds a sort by path rule to the fetchChain.

## `fetchChain.sortByValue(type)

Adds a sort by value for **primitive types** to the fetchChain. Type can be either:

- `number`
- `string`

## `fetchChain.sortByKey(keyString, type)

Adds a sort by key for **Object types** to the fetchChain. Type can be either:

- `number`
- `string`

Nested keys can be specified like this: `relatives.father.age`.

## `fetchChain.range(from, to)`

Adds a sort range to the fetchChain. Note that **the first index is 1**. from-to is a closed interval, that
means `fetchChain.range(1,10)` gives you up to ten matching states/methods.

## `fetchChain.descending()`

Adds a sort descending rule to the fetchChain.

## `fetchChain.ascending()`

Adds a sort ascending rule to the fetchChain.


## `method = peer.method(desc, [callbacks])`

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
}, {
  success: function() {
    console.log('method added successfully');
  },
  error: function(e) {
    console.log('method adding failed', e);
  }
})
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


## `state = peer.state(desc, [callbacks])`

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
},{
  success: function() {
    console.log('state added successfully');
  },
  error: function(e) {
    console.log('state adding failed', e);
  }
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

The `callbacks` object is optional. When specified, the supported fields are:

- `success`: {Function, Optional} Called, when adding the State to the Daemon was
  ok
- `error`: {Function, Optional} Called, when adding the State to the Daemon was not
  ok

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

## `fetcher.unfetch([callbacks])`

Unfetches (removes) the Fetcher. `callbacks` is optional.

```javascript
// setup some fetcher
var fetcher = peer.fetch({},function(){});

// unfetch it
fetcher.unfetch();
```

## `state.remove([callbacks])`

Removes the State. `callbacks` is optional.

```javascript
// create some state
var state = peer.state({
  path: 'test',
  value: 123
});

// remove it
state.remove({
  success: function() {
    console.log('state is now removed');
  },
  error: function(e) {
    console.log('could not remove state', e);
  }
});

// or just
state.remove();
```

## `method.remove([callbacks])`

Removes the method. `callbacks` is optional.

```javascript
// create some method
var method = peer.method({
  path: 'test',
  value: 123
});

// remove it
method.remove({
  success: function() {
    console.log('method is now removed');
  },
  error: function(e) {
    console.log('could not remove method', e);
  }
});
```

## `state.value([newValue])`

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
