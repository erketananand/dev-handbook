### Debounce:

```javascript
/**
 * Creates a debounced function that delays invoking func until after 
 * 'time' milliseconds have elapsed since the last time the debounced function was invoked.
 * @param {function} func - The function to debounce.
 * @param {number} time - The number of milliseconds to delay.
 * @returns {function} - The new debounced function.
 */
function debounce(func, time) {
    let timeoutId; // This variable is maintained by the closure

    return function (...args) {
        // 'this' refers to the context (e.g., the element) where the function is called
        const context = this; 
        
        // 1. Clear the previous timer
        // This is the core of debounce: every new call resets the countdown.
        clearTimeout(timeoutId);

        // 2. Set a new timer
        timeoutId = setTimeout(() => {
            // 3. Execute the function with the correct context and arguments
            func.apply(context, args);
        }, time);
    };
}
```

### Throttle:

```javascript
/**
 * Creates a throttled function that limits func execution to at most once every 'time' milliseconds.
 * @param {function} func - The function to throttle.
 * @param {number} time - The number of milliseconds to throttle invocations to.
 * @returns {function} - The new throttled function.
 */
function throttle(func, time) {
    let lastArgs; // Stores arguments from the latest call during the cooldown period
    let lastContext; // Stores the context from the latest call
    let timeoutId = null; // Stores the timer ID
    let lastExecTime = 0; // Timestamp of the last successful execution

    // Function to run the trailing edge call
    const runTrailing = () => {
        timeoutId = setTimeout(() => {
            // If there was a trailing call, execute it
            if (lastArgs) {
                func.apply(lastContext, lastArgs);
                lastExecTime = Date.now();
                lastArgs = null; // Clear arguments
                timeoutId = null; // Clear timer ID
            }
        }, time);
    };

    return function (...args) {
        lastContext = this;
        lastArgs = args;

        const now = Date.now();
        // Calculate the time remaining until the next allowed execution
        const remaining = time - (now - lastExecTime);

        // 1. Leading Edge: If the cooldown period is over, execute immediately
        if (remaining <= 0 || remaining > time) {
            
            // Clear any pending trailing call to avoid duplicate execution
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            
            func.apply(lastContext, lastArgs);
            lastExecTime = now; // Update the time of the last execution
            lastArgs = null; // Clear arguments
            
        } 
        // 2. Trailing Edge: If a cooldown is active, set a timer to run the function once 
        // the remaining time has elapsed, but only if a timer isn't already set.
        else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                // When the timer fires, execute the trailing call
                func.apply(lastContext, lastArgs);
                lastExecTime = Date.now();
                timeoutId = null;
                lastArgs = null;
            }, remaining);
        }
    };
}
```
