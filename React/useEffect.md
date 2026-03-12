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
