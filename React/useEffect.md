### **Q1: What is the `useEffect` hook and when should it be used?**
*   **Answer:** `useEffect` is a React Hook that allows you to **synchronize a component with an external system**. 
*   **Usage:** You should use it when you need to "step outside React" to handle things not controlled by React, such as:
    *   Connecting to a chat server or network.
    *   Managing browser APIs like timers (`setInterval`) or event subscriptions (`window.addEventListener`).
    *   Controlling third-party widgets like maps or video players.
    *   Fetching data manually (though framework-specific methods are often preferred).
*   **Example:** 
    ```javascript
    useEffect(() => {
      const connection = createConnection(serverUrl, roomId);
      connection.connect(); // Setup: connects to external system
      return () => connection.disconnect(); // Cleanup: disconnects
    }, [serverUrl, roomId]); // Runs when these change
    ```

### **Q2: Can we use multiple `useEffect` hooks in a single component?**
*   **Answer:** **Yes**, you can use multiple `useEffect` hooks in one component. 
*   **Reasoning:** This is often necessary because different Effects may need to run based on different dependencies. Using multiple hooks allows you to separate independent logic into its own lifecycle.
*   **Example:**
    ```javascript
    useEffect(() => { /* Runs on every render */ });
    useEffect(() => { /* Runs once on mount */ }, []);
    useEffect(() => { /* Runs when 'count' changes */ }, [count]);
    ```

### **Q3: What are the different ways to use the dependency array (second parameter)?**
*   **Answer:** There are three main scenarios for the dependency parameter:
    1.  **No Dependency Array:** If omitted, the Effect runs after **every single render** and state update.
    2.  **Empty Array (`[]`):** The Effect runs **only once**, specifically when the component initially mounts.
    3.  **Array with Specific Variables (`[dep1, dep2]`):** The Effect runs initially and then **only when the specified reactive values (props or state) change**.

### **Q4: What is the "cleanup" function and why is it important?**
*   **Answer:** The cleanup function is an optional function returned by the Effect. 
*   **Purpose:** It is used to "undo" or stop whatever the setup function started, such as clearing a timer or unsubscribing from a service.
*   **Execution Timing:** React runs the cleanup function:
    *   Before running the setup function again during a re-render (with the old values).
    *   One final time when the component is removed from the DOM (unmounts).

### **Q5: Why does `useEffect` run twice during development?**
*   **Answer:** When **Strict Mode** is on, React intentionally runs an extra setup+cleanup cycle during the first mount. 
*   **Purpose:** This is a "stress-test" to ensure your cleanup logic correctly "mirrors" your setup logic. If this causes issues, it usually means your cleanup function is missing necessary logic to stop the previous Effect.

### **Q6: What are "reactive dependencies" and what happens if they are omitted?**
*   **Answer:** Reactive values include **props, state, and any variables or functions** declared directly inside the component body. 
*   **Rules:** You cannot "choose" to omit a reactive value used inside the Effect; it must be listed in the dependency array.
*   **Risk:** If the dependencies do not match the code (e.g., by suppressing a linter), there is a high risk of introducing bugs because the Effect will use "stale" values from a previous render.

### **Q7: What are the pitfalls of fetching data directly inside `useEffect`?**
*   **Answer:** While common, fetching data in an Effect has several downsides:
    *   **No Server-Side Support:** Effects only run on the client, meaning the initial HTML will only show a loading state.
    *   **Network Waterfalls:** If parent and child components both fetch in Effects, they may load sequentially rather than in parallel.
    *   **Caching Issues:** It does not automatically handle caching or preloading, potentially leading to redundant network requests if a component remounts.
*   **Recommendation:** Use framework-built-in mechanisms or client-side caches like **TanStack Query** or **SWR**.

### **Q8: What happens if you update a state directly inside the component body without any condition or event?**
*   **Answer:** If you update a state (e.g., `setCounter(counter + 1)`) directly in the component body, it will cause an **infinite loop**.
*   **The Error:** You will see an error in the console such as **"Too many re-renders"**.
*   **Reason:** Every time you update the state, React triggers a re-render of the component. Since the update function is sitting directly in the code path without a trigger (like a button click) or a condition, it runs immediately during the render, updates the state again, triggers another render, and continues indefinitely.
*   **Example:**
    ```javascript
    function MyComponent() {
      const [counter, setCounter] = useState(0);
      
      // INCORRECT: Direct update without event/condition
      setCounter(counter + 1); 
      
      return <div>{counter}</div>;
    }
    ```

### **Q9: What happens if you update a state inside `useEffect` without a dependency array?**
*   **Answer:** This will also result in an **infinite loop** and a "Maximum update depth exceeded" error.
*   **Reason:** A `useEffect` hook without a dependency array (the second argument) runs after **every single render**. When the code inside `useEffect` updates the state, the component re-renders. Because the component re-rendered, the `useEffect` runs again, updates the state again, and the cycle repeats forever.
*   **Example:**
    ```javascript
    useEffect(() => {
      // INCORRECT: Will run on every render and trigger a new render
      setCounter(counter + 1); 
    }); 
    ```

### **Q10: How should state updates be correctly implemented to avoid these loops?**
*   **Answer:** You must ensure that state updates are tied to a specific **event** or governed by a **condition**.
*   **Solutions:**
    *   **Events:** Only call the update function inside an event handler, such as an `onClick` function.
    *   **Conditions:** Use an `if` statement to check a specific condition before updating the state.
    *   **Dependency Arrays:** When using `useEffect`, always provide a dependency array to specify exactly when the effect (and the state update) should run.
*   **Example of correct `useEffect` usage:**
    ```javascript
    // This will only run once when the component mounts, preventing a loop
    useEffect(() => {
      setCounter(counter + 1);
    }, []); 
    ```

### **Q11: Can we write a cleanup function for all three types of `useEffect`. When that cleanup function executes?**

Think of the cleanup function not just as "unmount code," but as **"undo code"** for the previous effect.

**No Dependency Array**

   * `useEffect(() => { ... })`
   * **When the Effect runs:** After every single render.
   * **When the Cleanup runs:**
      1.  Right before the effect runs again (which is before every re-render).
      2.  When the component finally unmounts.
   * **Use Case:** This is rare, but useful if you are manually tracking something that changes on every render and you need to reset a value before the next calculation.
   
      ```javascript
      useEffect(() => {
        console.log("Effect: I run every time.");
        
        return () => {
          console.log("Cleanup: I run before every re-render and at unmount.");
        };
      });
      
      ```

**Empty Dependency Array**

   * `useEffect(() => { ... }, [])`
   * **When the Effect runs:** Once, immediately after the initial mount.
   * **When the Cleanup runs:** **Only once**, when the component unmounts.
   * **Use Case:** This is the most common "unmount code" scenario. Use this for global event listeners (window resize), starting a timer, or opening a WebSocket connection that should last the entire life of the component.
   
      ```javascript
      useEffect(() => {
        const timer = setInterval(() => console.log("Tick"), 1000);
        
        return () => {
          // This is strictly 'unmount' logic here
          clearInterval(timer);
        };
      }, []);
      
      ```

**With Dependencies**

   * `useEffect(() => { ... }, [userId])`
   * **When the Effect runs:** On mount, and every time `userId` changes.
   * **When the Cleanup runs:**
      1.  Whenever `userId` changes (it cleans up the *previous* version of the effect before starting the new one).
      2.  When the component unmounts.
   * **Use Case:** Subscribing to data for a specific ID. If the ID changes, you must "undo" the subscription for the old ID before subscribing to the new one to prevent memory leaks.
   
      ```javascript
      useEffect(() => {
        ChatAPI.subscribeToFriend(userId);
        
        return () => {
          // Cleans up the previous subscription before userId changes
          ChatAPI.unsubscribeFromFriend(userId);
        };
      }, [userId]);
      
      ```

  **Comparison Summary**

   | Dependency Array | Effect Execution | Cleanup Execution |
   | --- | --- | --- |
   | **None** `( )` | Every render. | Before every re-render + Unmount. |
   | **Empty** `([ ])` | Once (Mount). | Once (Unmount). |
   | **Variables** `([dep])` | Mount + when `dep` changes. | Before `dep` changes + Unmount. |


### **Q12: Why does the cleanup run before the update, and not just at unmount?**
It prevents 'Stale Closures' and accumulation of side effects. If we only cleaned up at unmount, and the `userId` changed 10 times, we would have 10 active subscriptions running simultaneously. Cleaning up before each update ensures only one side effect is active at a time.

### **Q13: Can normal variable passed into the dependency array of useEffect? What all possible value can be passed to useEffect dependency array?**

Technically, yes you can pass a normal variable into the dependency array. React won't throw an error. However, it usually won't behave the way you expect, and it's a very common source of bugs in interviews.

Here is the breakdown of why this is a "trap" and what you can actually pass.

**1. Using a Normal Variable (Inside vs. Outside)**

Whether a normal variable works as a dependency depends entirely on where it is defined.

* **Scenario A: Variable Defined Inside the Component**
   
   This is the most dangerous one. Because functional components are just functions, **every variable inside the function is recreated on every render.**
   
   ```javascript
   function MyComponent() {
     const [count, setCount] = useState(0);
     const normalVar = "I am recreated every time"; // New memory reference every render
   
     useEffect(() => {
       console.log("Effect ran!");
     }, [normalVar]); // ❌ This will run on EVERY render, even if the string is the same
     
     return <button onClick={() => setCount(count + 1)}>Re-render</button>;
   }
   
   ```
   
   **The Problem:** React uses **Shallow Comparison** (`Object.is`) for dependencies. If the variable is an object, array, or function defined inside the component, its "reference" changes every time the component runs. The effect thinks the dependency is "new" and runs again.

* **Scenario B: Variable Defined Outside the Component**

   If the variable is outside, its reference is stable (it doesn't change when the component re-renders).
   
   ```javascript
   const globalVar = { status: 'active' }; // Defined once globally
   
   function MyComponent() {
     useEffect(() => {
       console.log("Only runs once (on mount)");
     }, [globalVar]); // ✅ Reference never changes
   }
   
   ```
   
   **The Problem:** If you manually update `globalVar.status = 'inactive'`, **the effect will NOT run.** Why? Because changing a normal variable does not trigger a React re-render. React only "checks" the dependency array when a render is already happening (usually triggered by State or Props).


**2. What can be passed as a Dependency?**

You can pass any JavaScript value, but for the effect to be useful, the value should be something React "tracks."

* **The "Safe" List:**

   * **State:** Values from `useState` or `useReducer`.
   * **Props:** Any values passed from a parent.
   * **Context:** Values retrieved via `useContext`.
   * **Memoized Values:** Results of `useMemo` or `useCallback`.
   * **Derived Data:** Variables calculated from props or state (e.g., `const isEven = count % 2 === 0;`).

* **The "Caution" List (Objects & Arrays):**

   If you pass an object or array, you must ensure it has **Referential Equality**.
   
   * `[] === []` is **false**.
   * `{} === {}` is **false**.
   
   If you pass a literal `[1, 2, 3]` as a dependency, the effect will run every render because the "new" array is not the "old" array in memory.

**3. Can I use `useRef` in the dependency array?**

* Technically yes, but it won't work.
* A ref's `.current` property is mutable, but changing it **does not trigger a re-render.** Since React only checks the dependency array during a render, it will never see that the ref changed until *something else* (like a state update) forces the component to re-render.


**Summary Table for the useEffect dependency array**

   | Type of Value | Triggers Effect Re-run? | Reliability |
   | --- | --- | --- |
   | **State / Props** | Yes | **High** (React's core purpose). |
   | **Local Variable** | Every render (if ref-type) | **Low** (Causes infinite loops/extra renders). |
   | **Global Variable** | No (unless state triggers render) | **Low** (React doesn't track it). |
   | **useRef.current** | No | **Zero** (React ignores ref changes). |
   | **useMemo value** | Only when its own deps change | **High** (Optimized). |

