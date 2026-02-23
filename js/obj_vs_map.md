# Keys Supported in `Object` vs `Map` in JavaScript

## Object

### Allowed Key Types
* **String**
* **Symbol**

If we use anything else, it gets converted to a string.

### Example

```js
const obj = {};

obj[1] = "number key";
obj['1'] = "string key";
obj[true] = "boolean key";
obj[{ a: 1 }] = "object key";

console.log(obj);
```

### What actually happens:

```js
{
  "1": "string key", // Number(1) get overriden by String(1)
  "true": "boolean key",
  "[object Object]": "object key"
}
```

Everything becomes a **string**.

### Problem Example

```js
const obj = {};

const key1 = { id: 1 };
const key2 = { id: 2 };

obj[key1] = "value1";
obj[key2] = "value2";

console.log(JSON.stringify(obj)); // {"[object Object]":"value2"} - Both become `"[object Object]"`, So `value1` gets overwritten
```

## Map

### Allowed Key Types

Map supports:

* ✅ String
* ✅ Number
* ✅ Boolean
* ✅ Object
* ✅ Array
* ✅ Function
* ✅ Symbol
* ✅ NaN
* ✅ null / undefined

**ANY value can be a key**

### Example

```js
const map = new Map();

const key1 = { id: 1 };
const key2 = { id: 2 };

map.set(key1, "value1");
map.set(key2, "value2");

console.log(map.get(key1)); // value1
console.log(map.get(key2)); // value2
```

No overwriting — different object references.

### Special Case: NaN

In Object:

```js
const obj = {};
obj[NaN] = "test";
```

Becomes `"NaN"` string.

In Map:

```js
const map = new Map();
map.set(NaN, "test");

map.get(NaN); // "test"
```

Map treats `NaN` as same key (uses SameValueZero comparison).

## Comparison Table

| Feature       | Object                                       | Map                        |
| ------------- | -------------------------------------------- | -------------------------- |
| Key Types     | String, Symbol                               | Any type                   |
| Object as key | ❌ Converted to string                        | ✅ Works                    |
| Key Order     | Mostly insertion (but integers sorted first) | Guaranteed insertion order |
| Size          | `Object.keys(obj).length`                    | `map.size`                 |
| Iteration     | Not directly iterable                        | Directly iterable          |

## When to Use What?

### Use Object when:

* Keys are strings
* Simple dictionary
* JSON-like data
* Lightweight use

### Use Map when:

* Keys are dynamic (objects, functions)
* Frequent insert/delete
* Need guaranteed order
* Large datasets

## Why Integer Keys Behave Differently in Objects

In JavaScript objects: Integer-like keys are sorted first in ascending order because JavaScript internally treats them as array indices and optimizes them differently. String & Symbol as key will preserve the order of the key insertion.

### Example

```js
const obj = {};

obj["b"] = 1;
obj[2] = "two";
obj[1] = "one";
obj["a"] = 3;

console.log(Object.keys(obj)); // ["1", "2", "b", "a"]
```

### Why This Happens
ECMAScript defines property order as:

1. Integer-like keys (ascending numeric order)
2. String keys (in insertion order)
3. Symbol keys (in insertion order)

### What counts as an "integer key"?

A key is treated as an integer index if:

* It is a string
* It represents a non-negative integer
* It is within 2³² − 1 range

Example:

```js
obj["10"]   // treated as integer index
obj["01"]   // NOT treated as integer
obj["-1"]   // NOT treated as integer
```

### Why JS Does This?

Because arrays are just objects internally.

```js
const arr = [];
arr[2] = "A";
arr[1] = "B";
```

JS engines optimize numeric indexes differently for performance, so objects preserve this rule for consistency and engine optimization.
