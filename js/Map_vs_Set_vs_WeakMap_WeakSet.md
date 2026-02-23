# Difference Between Map, Set, WeakMap, WeakSet

| Feature            | **Map**                   | **Set**            | **WeakMap**             | **WeakSet**                  |
| ------------------ | ------------------------- | ------------------ | ----------------------- | ---------------------------- |
| Stores             | Key → Value pairs         | Unique values only | Key → Value pairs       | Unique objects only          |
| Key Type           | Any type                  | N/A (values only)  | **Only objects**        | **Only objects**             |
| Value Type         | Any type                  | Any type           | Any type                | Only objects (as values)     |
| Allows Primitives  | ✅ Yes                     | ✅ Yes              | ❌ No                    | ❌ No                         |
| Garbage Collection | Strong reference          | Strong reference   | Weak reference          | Weak reference               |
| Prevents GC        | ✅ Yes                     | ✅ Yes              | ❌ No                    | ❌ No                         |
| Iterable           | ✅ Yes                     | ✅ Yes              | ❌ No                    | ❌ No                         |
| Has `.size`        | ✅ Yes                     | ✅ Yes              | ❌ No                    | ❌ No                         |
| Methods            | `set, get, delete, has`   | `add, delete, has` | `set, get, delete, has` | `add, delete, has`           |
| Use Case           | General key-value storage | Unique collections | Private data, caching   | Track object presence safely |

## Examples

### Map
Keys can be anything.
```js
const map = new Map();
map.set("a", 1);
map.set({ id: 1 }, "object key");
```

### Set
Stores unique values.
```js
const set = new Set();
set.add(1);
set.add(1); // duplicate ignored
```

### WeakMap
Only object keys
Not iterable
```js
const wm = new WeakMap();
let obj = {};
wm.set(obj, "data");
obj = null; // eligible for GC
```

### WeakSet
Only objects
Used to track object existence
```js
const ws = new WeakSet();
let obj = {};
ws.add(obj);
obj = null; // eligible for GC
```

## Memory Behavior Summary

| Structure | Holds Strong Reference? |
| --------- | ----------------------- |
| Map       | Yes                     |
| Set       | Yes                     |
| WeakMap   | No                      |
| WeakSet   | No                      |

## When to Use What

* **Map** → Dynamic key-value store
* **Set** → Unique list of values
* **WeakMap** → Private object data / memory-safe cache
* **WeakSet** → Track visited objects (e.g., circular reference detection)
