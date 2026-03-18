### 1. Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        try {
          const result = onFulfilled ? onFulfilled(this.value) : this.value;
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === "rejected") {
        try {
          const result = onRejected ? onRejected(this.reason) : this.reason;
          reject(result);
        } catch (err) {
          reject(err);
        }
      }

      if (this.state === "pending") {
        this.onFulfilledCallbacks.push(() => {
          try {
            const result = onFulfilled ? onFulfilled(this.value) : this.value;
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });

        this.onRejectedCallbacks.push(() => {
          try {
            const result = onRejected ? onRejected(this.reason) : this.reason;
            reject(result);
          } catch (err) {
            reject(err);
          }
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
```

**Example:**

```javascript
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});

p.then(res => {
  console.log(res); // Success!
}).catch(err => {
  console.log(err);
});
```

### 2. Promise.all

* This returned promise fulfills when all of the input's promises fulfill (including when an empty iterable is passed), with an array of the fulfillment values.
* It rejects when any of the input's promises rejects, with this first rejection reason.

```javascript
/**
 * Custom implementation of Promise.all()
 * @param {Array<Promise<any>>} promises - An iterable of promises.
 * @returns {Promise<Array<any>>} - A Promise that resolves with an array of results 
 * or rejects with the reason of the first rejected promise.
 */
function all(promises) {
    // 1. Return a new Promise that handles the logic
    return new Promise((resolve, reject) => {
        // Handle the edge case of an empty promises array
        if (promises.length === 0) {
            return resolve([]);
        }

        const results = [];
        let resolvedCount = 0;
        const totalPromises = promises.length;

        // 2. Iterate over the input promises
        promises.forEach((promise, index) => {
            // Ensure we are working with a promise, even if the element is a plain value.
            // Promise.resolve() does this for us.
            Promise.resolve(promise)
                .then(value => {
                    // 3. Store the resolved value in the correct position (index)
                    results[index] = value;
                    resolvedCount++;

                    // 4. Check if all promises have resolved
                    if (resolvedCount === totalPromises) {
                        // All resolved successfully, resolve the main promise with the results array
                        resolve(results);
                    }
                })
                .catch(reason => {
                    // 5. If any promise rejects, immediately reject the main promise
                    // with the reason of the rejection.
                    reject(reason);
                });
        });
    });
}
```

**Example 1: Immediate Resolution**

```javascript
let ans = "";
const p1 = Promise.resolve(ans += "func1 ");
const p2 = Promise.resolve(ans += "func2 ");
const p3 = Promise.resolve(ans += "func3 ");

all([p1, p2, p3])
    .then(results => {
        // results will be an array of the resolved values: ["func1 ", "func2 ", "func3 "]
        console.log(ans);
    });

// Expected Output: func1 func2 func3
```

**Example 2: Delayed Resolution (Simulated with setTimeout)**

```javascript
let ans = "";

let func1 = () => new Promise(resolve => {
    setTimeout(() => { 
        ans += 'setTimeout called for func1\n'; 
        resolve('func1-result'); // The promise resolves after 100ms
    }, 100);
});

let func2 = () => new Promise(resolve => {
    setTimeout(() => { 
        ans += 'setTimeout called for func2\n'; 
        resolve('func2-result'); // The promise resolves after 200ms
    }, 200);
});

let func3 = () => new Promise(resolve => {
    setTimeout(() => { 
        ans += 'setTimeout called for func3\n'; 
        resolve('func3-result'); // The promise resolves after 300ms
    }, 300);
});

// Note: The example provided in the image had a slight error in how it used 
// setTimeout inside a non-returning function. The common way to simulate 
// this is to have funcN() return a Promise, as shown above.

all([func1(), func2(), func3()]) // Call funcN() to get the promises
    .then(results => {
        // This runs AFTER all timeouts are complete (at ~300ms)
        console.log("\nAll promises resolved. Final results:", results);
        console.log("Final ans string:\n" + ans);
    });

// The output order for the ans string will be:
// 'setTimeout called for func1' (at 100ms)
// 'setTimeout called for func2' (at 200ms)
// 'setTimeout called for func3' (at 300ms)
// Then, the final console.log will run.
```

### 3. Promise.any

* This returned promise fulfills when any of the input's promises fulfills, with this first fulfillment value.
* It rejects when all of the input's promises reject (including when an empty iterable is passed), with an AggregateError containing an array of rejection reasons.

```javascript
/**
 * Custom implementation of Promise.any()
 * @param {Array<Promise<any>>} promises - An iterable of promises.
 * @returns {Promise<any>} - A Promise that resolves with the value of the first 
 * resolved promise, or rejects with an AggregateError if all promises reject.
 */
function any(promises) {
    // 1. Return a new Promise that handles the logic
    return new Promise((resolve, reject) => {
        const totalPromises = promises.length;
        
        // Handle the edge case of an empty promises array immediately, 
        // as Promise.any() on an empty array rejects with an AggregateError.
        if (totalPromises === 0) {
            // Rejects with an AggregateError containing an empty array of errors.
            return reject(new AggregateError([], 'All promises were rejected'));
        }

        const rejectionReasons = [];
        let rejectedCount = 0;

        // 2. Iterate over the input promises
        promises.forEach((promise, index) => {
            // Use Promise.resolve() to handle non-Promise values in the input array
            Promise.resolve(promise)
                .then(value => {
                    // 3. Resolve: If ANY promise resolves, resolve the main promise immediately.
                    // This halts all subsequent checks.
                    resolve(value); 
                })
                .catch(reason => {
                    // 4. Handle Rejection: Store the reason and increment the count
                    rejectionReasons[index] = reason; // Store the reason at the correct index
                    rejectedCount++;

                    // 5. Check if all promises have rejected
                    if (rejectedCount === totalPromises) {
                        // All rejected. Reject the main promise with an AggregateError.
                        // We use the rejectionReasons array to provide the list of errors.
                        reject(new AggregateError(rejectionReasons, 'All promises failed'));
                    }
                });
        });
    });
}
```

**Example 1: Resolution (One promise resolves first)**

```javascript
const p1 = new Promise((_, reject) => setTimeout(() => reject('Error 1'), 100));
const p2 = new Promise((resolve, _) => setTimeout(() => resolve('Success from 2'), 50));
const p3 = new Promise((resolve, _) => setTimeout(() => resolve('Success from 3'), 150));

any([p1, p2, p3])
    .then(result => {
        console.log("Resolved:", result);
    })
    .catch(error => {
        console.error("Rejected:", error);
    });

// Expected Output:
// Resolved: Success from 2
```

**Example 2: Rejection (All promises reject)**

```javascript
const p1 = new Promise((_, reject) => setTimeout(() => reject(new Error('Failure 1')), 100));
const p2 = new Promise((_, reject) => setTimeout(() => reject(new Error('Failure 2')), 50));
const p3 = new Promise((_, reject) => setTimeout(() => reject(new Error('Failure 3')), 150));

any([p1, p2, p3])
    .then(result => {
        console.log("Resolved:", result);
    })
    .catch(error => {
        console.error("Rejected (AggregateError):", error.message);
        console.error("Individual Errors:", error.errors.map(e => e.message));
    });

// Expected Output (at ~150ms):
// Rejected (AggregateError): All promises failed
// Individual Errors: [ 'Failure 1', 'Failure 2', 'Failure 3' ]
```

### 4. Promise.race

* The "first one wins" method. It resolves or rejects as soon as the first promise in the array settles.

```javascript
function race(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => {
      // Whichever settles first calls the wrapper's resolve/reject
      Promise.resolve(p).then(resolve, reject);
    });
  });
}
```

### 5. Promise.allSettled

* This returned promise fulfills when all of the input's promises settle (including when an empty iterable is passed), with an array of objects that describe the outcome of each promise.

```javascript
function allSettled(promises) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(value => {
          results[i] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[i] = { status: 'rejected', reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) resolve(results);
        });
    });
  });
}
```
