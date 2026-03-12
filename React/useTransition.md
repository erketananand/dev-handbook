### **Q1: What is the `useTransition` hook and what does it return?**
*   **Answer:** `useTransition` is a React Hook that allows you to **render a part of the UI in the background** without blocking the main user interface. 
*   **Returns:** It returns an array with exactly two items:
    1.  **`isPending`:** A boolean flag that indicates whether a transition is currently in progress.
    2.  **`startTransition`:** A function that allows you to mark specific state updates as "Transitions".
*   **Example:**
    ```javascript
    const [isPending, startTransition] = useTransition();
    ```

### **Q2: What is the primary benefit of using Transitions?**
*   **Answer:** The main benefit is that **Transition updates are non-blocking and interruptible**. 
*   **Responsiveness:** If a transition is in the middle of a heavy re-render (like updating a complex chart) and the user performs a more urgent action (like typing in an input), React will **interrupt the transition render** to handle the user input immediately.
*   **User Feedback:** It allows you to provide immediate feedback (like a loader or a disabled button) while a slow background task completes.

### **Q3: How do you implement a "Pending" state or loader using `useTransition`?**
*   **Answer:** You can use the `isPending` boolean to conditionally render UI elements like loading spinners or to disable buttons during an execution.
*   **Example:**
    ```javascript
    function TabButton({ action, children }) {
      const [isPending, startTransition] = useTransition();

      if (isPending) {
        return <span>Loading...</span>; // Show loader while pending
      }

      return (
        <button onClick={() => {
          startTransition(() => {
            action(); // State update happens here
          });
        }}>
          {children}
        </button>
      );
    }
    ```

### **Q4: How should asynchronous code be handled inside `startTransition`?**
*   **Answer:** While you can use `await` inside the function passed to `startTransition` (called an "Action"), there is a current limitation: **state updates after an `await` must be wrapped in another `startTransition`** to remain marked as transitions.
*   **Example:**
    ```javascript
    startTransition(async () => {
      const data = await fetchData(); // Async call
      startTransition(() => {
        setData(data); // Must wrap the update after await
      });
    });
    ```

### **Q5: What are the common pitfalls and restrictions of `useTransition`?**
*   **Answer:** 
    *   **Text Inputs:** You **cannot** use a Transition to control a state variable for a text input because inputs must update synchronously.
    *   **Placement:** Like all Hooks, it can only be called at the **top level** of a component or a custom Hook.
    *   **Immediate Execution:** The function passed to `startTransition` executes **immediately**; React just uses that execution time to track which state updates should be treated as low-priority transitions.
    *   **Sync Requirement:** The function you pass to `startTransition` must itself be synchronous (even if it contains `async/await` logic inside).

### **Q6: How does `useTransition` improve the experience with Suspense?**
*   **Answer:** It helps **prevent unwanted loading indicators**. For example, when switching tabs, if the new tab's content is not yet loaded, a Transition will "wait" long enough to avoid hiding already revealed content (like the tab container) to show a spinner, resulting in a less jarring user experience.