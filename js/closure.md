### Closure:
A **closure** is a function that **remembers** the variables from its outer (enclosing) scope even after the outer function has finished executing.
  * A function remembers outer variables even after outer function execution is over.
  * State persistence + data privacy + function-level encapsulation

Needed for:
  * Private variables
  * Persistent state
  * Clean code

Impossible to replicate cleanly without:
  * Globals (bad)
  * Classes/objects (heavier)

**Q&A:**

* If a variable is updated after a closure is created, will the closure reflect the updated value?
  * Yes. A closure captures the reference to the variable, not its value.
  * So if the variable is updated later, the closure will see the latest value.
* Does referencing variables (via closures) cause memory leaks?
  * Closures themselves don’t cause memory leaks, but they can keep variables in memory longer than expected.
  * A memory leak happens when those references are unnecessarily retained and never released.
  * Since closures hold a reference to variables, the JavaScript garbage collector cannot free that memory as long as the closure is still reachable.
 

**Examples:**

```javascript
// Imagine a website where each button tracks how many times it was clicked independently.
function createClickHandler(buttonId) {
  let clickCount = 0;

  return function () {
    clickCount++;
    console.log(`Button ${buttonId} clicked ${clickCount} times`);
  };
}

const btn1Handler = createClickHandler("A");
const btn2Handler = createClickHandler("B");

btn1Handler(); // Button A clicked 1 times
btn1Handler(); // Button A clicked 2 times
btn2Handler(); // Button B clicked 1 times
```

```javascript
// Instead of hitting an API repeatedly, you cache results.
function createAPICache() {
  const cache = {};

  return async function (url) {
    if (cache[url]) {
      console.log("Returning cached data");
      return cache[url];
    }

    const response = await fetch(url);
    const data = await response.json();
    cache[url] = data;
    return data;
  };
}

const fetchWithCache = createAPICache();
```

```javascript
// Used when you don’t want a function to fire too often (like search typing).
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const searchHandler = debounce((text) => {
  console.log("Searching for:", text);
}, 500);
```

#### Function Currying

* Currying transforms a function of multiple arguments into a series of nesting functions.

```javascript
function curry(fn) {
  return function curried(...args) {
    // If we have enough arguments, execute the original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return a new function to collect more arguments
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

// Usage:
const sum = (a, b, c) => a + b + c;
const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 6
```

#### Private Variables & Module Pattern (IIFE)

* Closures allow us to create "private" state that cannot be accessed from the outside. The Module Pattern uses an IIFE to return only the "public" API.

```javascript
const CounterModule = (function() {
  // Private variable - inaccessible from the global scope
  let _count = 0; 

  function _logChange() {
    console.log(`Value changed to: ${_count}`);
  }

  return {
    increment() {
      _count++;
      _logChange();
    },
    getCount() {
      return _count;
    }
  };
})();

CounterModule.increment(); // Value changed to: 1
console.log(CounterModule._count); // undefined (Safe!)
```
