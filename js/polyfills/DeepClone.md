### Deep Clone (Handling Circular References)

* A simple JSON.parse(JSON.stringify(obj)) fails with circular references or special types (Dates, RegEx).
* We use a WeakMap to keep track of objects we've already seen.

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // If we've seen this object before, return it (handles circular refs)
  if (hash.has(obj)) return hash.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }
  return clone;
}
```
