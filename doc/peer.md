# jet.Peer API

Load the module "node-jet":

```javascript
var jet = require('node-jet');
```

## `peer = new jet.Peer(config)`

Creates and returns a new Jet Peer instance with the specified config.
The supported config fields are:

- `url`: {String} The Jet Daemon Websocket URL, e.g. `ws://localhost:11123`
- `ip`: {String} The Jet Daemon TCP trivial protocol ip (default: `localhost`)
- `port`: {String} The Jet Daemon TCP trivial protocol port (default: `11122`)

The peer uses either the Websocket protocol or the TCP trivial protocol (default) as transport.
When specifying the `url` field, the peer uses the Websocket protocol as transport.

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

## `peer.close()`

Closes the connection to the Daemon.

## `peer.set(path, value, [callbacks])`

Tries to set the Jet State specified by `path` to `value`. 

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

## `peer.call(path, args, [callbacks])`

Calls the Jet Method specified by `path` with `args` as arguments.
`args` must be an Object or an Array.

```javascript
peer.call('sum', [1,2,3,4,5], {
  success: function(result) {
    console.log('sum is', result);
  },
  error: function(e) {
    console.log('could not calc the sum', e);
  }
});

// dont care about the result
peer.call('greet', {first: 'John', last: 'Mitchell'});
```

## `fetch = peer.fetch(rule, fetchCb, [callbacks])`

Creates and returns a Fetch instance. The supported fields of `rule` are:

- `path`: {Object, Optional} For path based fetches
- `value`: {Object, Optional} For value based fetches
- `valueField`: {Object, Optional} For valuefield based fetches
- `sort`: {Object, Optional} For sorted fetches

If `rule` is a empty Object, a "Fetch all" is set up.

```javascript
var fetchAll = peer.fetch({}, function(path, event, value) {
  console.log(path, event, value);
});
```

The `fetchCb` arguments for non-sorting fetches are:

- `path`: {String} The path of the State / Method which triggered the Fetch Notification
- `event`: {String} The event which triggered the Fetch Notification ('add', 'remove',
   'change')
- `value`: {Any | undefined} The current value of the State or `undefined` for Methods

```javascript
var fetchPersons = peer.fetch({
  path: {
    startsWith: 'persons/'
  }
}, function(path, event, value) {
  console.log(path, event, value);
}, {
  success: function() {
    console.log('fetch setup successfully');
  },
  error: function(e) {
    console.log('fetch setup failed', e);
  }
}});
```

The `fetchCb` argument for sorting fetches are:

- `changes`: {Array} The changes compared to the previous time the function was
  invoked:
  - `path`: {String} The path of the State / Method which triggered the Fetch Notification
  - `index`: {Number} The index / position within the range (from-to)
  - `value`: {Any | undefined} The current value of the State or `undefined` for Methods
- `n`: {Number} The number of matches within the given range (from-to)

```javascript
var sortedPersons = [];
var fetchPersons = peer.fetch({
  path: {
    startsWith: 'persons/'
  },
  sort: {
    from: 1,
    to: 10,
    byValueField: {
      age: 'number'
    }
  }
}, function(changes, n) {
  sortedPersons.length = n;  
  changes.forEach(function(change) {
    // indices are 1 based (not 0 based).
    sortedPersons[change.index-1] = {
      name: change.value.name,
      age: change.value.age
    };
  });
});
```

## `method = peer.method(desc, [callbacks])`

Creates and returns a Jet Method given the information provided by `desc`.
The supported `desc` fields are:

- `path`: {String} The unique path of the Method
- `call`: {Function, Optional} The Function which "executes" the method (synchonous)
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
