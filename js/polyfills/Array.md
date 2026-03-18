### Map

```JavaScript
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  // Use a standard for-loop to handle sparse arrays correctly
  for (let i = 0; i < this.length; i++) {
    // Ensure we only process properties that actually exist
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};
```

### Filter

```JavaScript
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
```

### Flat Array

* Flattening a nested array to a specific depth.

```JavaScript
function flatten(arr, depth = 1) {
  return depth > 0 
    ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : arr.slice();
}
```

### Custom `reduce()`

```JavaScript
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue === undefined ? this[0] : initialValue;
  let startIndex = initialValue === undefined ? 1 : 0;

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};
```
