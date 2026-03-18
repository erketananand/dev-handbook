### Object.assign(target, ...sources)

```JavaScript
function objectAssign(target, ...sources) {
  if (target == null) throw new TypeError('Cannot convert undefined or null to object');
  
  const to = Object(target);
  sources.forEach(nextSource => {
    if (nextSource != null) {
      // Only copy own enumerable properties
      for (const key in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
          to[key] = nextSource[key];
        }
      }
    }
  });
  return to;
}
```
