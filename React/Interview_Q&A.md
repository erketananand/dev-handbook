### 1. Why React components must return only one parent element in JSX

**Core Concept: React Components as JavaScript Functions**
*   **Fundamental Rule:** React components are ultimately just **JavaScript functions**. 
*   **Function Limitation:** In standard JavaScript, a function can only return **one value or one object** at a time. It cannot return multiple independent objects simultaneously.

**The Technical Reason: JSX Elements are Objects**
*   **JSX as Objects:** Behind the scenes, HTML-like elements in JSX (such as `<h1>` or `<div>`) are treated as **JavaScript objects**.
*   **The Syntax Error:** When you try to return two separate elements (e.g., two `<h1>` tags), you are essentially asking a JavaScript function to return two separate objects, which leads to a syntax error: *"JSX expressions must have one parent element"*.

**Examples and Proofs**

**1. JavaScript Function Object Limitation**
If you attempt to return two objects in a plain JavaScript function, it will fail or behave unexpectedly:
```javascript
function userData() {
  return (
    { name: "Anil" } // First object
    { city: "Delhi" } // Second object (Causes Error)
  );
}
```
In the example above, the code will result in an error because a function cannot return two objects this way.

**2. The Effect of Using a Comma**
If you use a comma between two objects in a JavaScript return statement, the language follows a specific logic: it ignores the first object and **returns only the last one**.
*   **In JavaScript:**
    ```javascript
    return { name: "Anil" }, { city: "Delhi" }; 
    // Output: { city: "Delhi" } (The first object is overridden)
    ```
*   **In JSX:**
    If you separate two JSX elements with a comma, the error might disappear, but **only the second element will be rendered** on the screen. The first element (e.g., "Hi") will be lost, and only the second (e.g., "Hello") will be visible.

**Summary of the Rule**
*   **Why one parent?** Because a function can only return one "thing".
*   **The Solution:** To return multiple elements, you must wrap them in a **single parent element** (like a `<div>` or a Fragment). This way, the function technically returns only **one** object (the parent) which contains all the children elements.

### 2. How do you implement a timer in React with proper cleanup?

I'd use the **`useEffect` hook** to manage the timer's lifecycle. `useEffect` is designed for side effects, and managing timers is a classic example. The most critical part is the **cleanup function** returned by the effect, which prevents memory leaks and stale state issues.

**Why Cleanup Matters:**

Without a cleanup function, the `setInterval` call continues to run even after the component that created it is unmounted from the DOM. This leads to two major problems:

1. **Memory Leaks:** The timer function is still active in memory, holding a reference to the unmounted component's state, preventing it from being garbage-collected.
2. **Stale Closures / "Gorilla Effect":** Each time the `useEffect` runs, a new timer is created, but the old ones aren't cleared. This causes multiple timers to run simultaneously, all trying to update the same state, leading to unpredictable and buggy behavior. The "gorilla effect" is when you think you have one timer, but you actually have an army of them.

**Example with Cleanup:**

```javascript
import React, { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 1. Set up the timer.
    const timer = setInterval(() => {
      // 2. The function inside setInterval "closes over" the state.
      // We use the functional update form (s => s + 1) to avoid
      // closure issues where the timer might be using a stale 'seconds' value.
      setSeconds(s => s + 1);
    }, 1000);

    // 3. Return the cleanup function.
    // This runs automatically when the component unmounts or
    // before the effect re-runs due to dependency changes.
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this effect runs only once on mount.

  // Helper function to format the time
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return <h2>Elapsed: {formatTime(seconds)}</h2>;
}

```

**Advanced Patterns:**

For a more complex timer that might need to be paused or reset, I'd use **`useRef`** to store the timer ID. This allows me to access and clear the timer from different parts of the component without it being part of the state or a dependency, which helps avoid unnecessary re-renders.

### 3. How does React update the DOM efficiently?

When a component's state or props change, React doesn't immediately update the browser's Document Object Model (DOM). Instead, it follows a highly efficient, multi-step process to ensure the UI stays in sync with the data with minimal overhead.

**1. State Change: The Trigger**

The entire update process begins with a **state change** within a component. This happens when you call a state updater function like `setState` (in class components) or a state hook function like `setCount` (in functional components). React detects this change and marks the component as "dirty," signaling that it needs to be re-rendered.

**2. The Virtual DOM**

React creates an in-memory representation of the UI called the **Virtual DOM (VDOM)**. This is a lightweight JavaScript object tree that mirrors the structure of the real DOM. When a component's state changes, React doesn't modify the real DOM; it first creates a **new VDOM tree** for that component and its children. This new VDOM tree reflects what the UI *should* look like with the updated state.

**3. The Diffing & Batching Algorithm**

This is where the magic happens. React's **diffing algorithm** efficiently compares the new VDOM tree with the old one. It follows a set of smart rules (heuristics) to find the minimum number of changes required. For example:

  * If the element type changes (e.g., a `<div>` becomes a `<span>`), React assumes the entire component and its children are different and replaces the whole subtree.
  * For lists, React uses the **`key` prop** to identify which items have been added, removed, or moved. Without keys, it would have to re-create the entire list, which is much slower.

Once it has the full list of necessary changes—the "diff"—React doesn't apply them one by one. It uses **batching** to group multiple state updates and their resulting diffs into a single, comprehensive list of changes. This prevents multiple, expensive DOM manipulations.

**4. Reconciliation: The Final Step**

Finally, after the diffing and batching are complete, React enters the **reconciliation** phase. This is the only time React touches the real browser DOM. It takes the single, batched list of changes from the diffing process and applies them, updating only the specific elements that need to be changed. This single, targeted update to the real DOM is what makes React so fast and efficient.

### 4. Difference between State and Props in React?

At a high level, **state is internal and mutable**, while **props are external and immutable**.

* **State:** A component's state is an object that holds data that may change over time and is managed **within the component itself**. When state changes, the component re-renders. State is the source of truth for the component and its children.
* **Props (Properties):** Props are a mechanism for passing data **from a parent component to a child component**. They are read-only and cannot be changed by the child component. The child receives them and uses them to configure its rendering and behavior.

**Example:**

In below example, the `ParentComponent` maintains a `count` in its state. It then passes this `count` as a `value` prop to the `ChildComponent`. The `ChildComponent` receives and displays this value, but cannot change it. The `ParentComponent` changes the value via a button click.

```javascript
import React, { useState } from 'react';

// This is the child component. It receives a 'value' as a prop.
function ChildComponent({ value }) {
  // It can only read the prop, not change it.
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Child Component</h3>
      <p>Received Value from Parent: **{value}**</p>
      {/* ❌ This would cause an error! You cannot change props directly. */}
      {/* value = value + 1; */}
    </div>
  );
}

// This is the parent component. It manages its own state.
function ParentComponent() {
  // `count` is the state, managed locally.
  // `setCount` is the function used to update the state.
  const [count, setCount] = useState(0);

  // This function updates the state when the button is clicked.
  const incrementCount = () => {
    setCount(count + 1);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', borderRadius: '12px' }}>
      <h1>Parent Component</h1>
      <p>Current State (Count): **{count}**</p>
      <button onClick={incrementCount}>
        Increment Count
      </button>

      <hr style={{ margin: '20px 0' }} />

      {/* The parent passes its state to the child as a prop. */}
      <ChildComponent value={count} />
    </div>
  );
}

export default ParentComponent;

```

**State Update Explained:**

In the `ParentComponent`, **`count`** is a piece of data that the component **owns and manages**. It's the component's internal state.

* **Initialization:** We use the `useState(0)` hook to create this state. The value `0` is its initial value.
* **Mutability:** Unlike a regular variable, you **must** use the provided state update function, **`setCount`**, to change the value of `count`.
* **Re-rendering:** When you call `setCount(count + 1)`, React knows that the state has changed. It then re-renders the `ParentComponent` and all its children. This is the official way to tell React to update the UI.

This makes state **mutable** (it can change) and **local** (it belongs to a specific component).

**Props Read-Only Explained:**

In the `ChildComponent`, **`value`** is a **prop**. It's not owned by this component; it's passed down from its parent.

* **Read-only:** A key rule in React is that **props are read-only**. The `ChildComponent` can use the `value` to display information, but it cannot directly change it. Trying to do something like `value = value + 1` would result in an error.
* **Data Flow:** Props establish a one-way data flow in React, often called "unidirectional data flow." Data flows from parent to child, and the child cannot send data back up to the parent through props.

This makes props **immutable** (they cannot change) and **external** (they come from outside the component).

**Key Differences:**

| Feature | State | Props |
| --- | --- | --- |
| **Origin** | Internal to a component. | Passed from a parent component. |
| **Mutability** | Mutable. Can be updated using `setState` or a state hook. | Immutable. A child component cannot change its props. |
| **Use Case** | Managing data that changes over time (e.g., form input). | Configuring child components (e.g., text for a button). |

**Problem: Props Drilling**

A common issue in larger applications is **"props drilling,"** where props must be passed down through multiple layers of components to reach a deeply nested child. This makes the code harder to read and maintain.  To solve this, developers use context management solutions like the **React Context API** or a state management library like **Redux**, which allows components to access data without it having to be explicitly passed down as props.

### 5. What is memoization in React, and how do `useMemo`, `useCallback`, and `React.memo` differ?

**Memoization** is an optimization technique that caches the result of a function call. In React, it's used to prevent unnecessary re-renders and re-computations.

* **`useMemo` (memoizes a value):**
  * **Purpose:** It caches the result of an expensive calculation. `useMemo` only re-runs the calculation if one of the values in its dependency array has changed.
  * **When to use:** When you have a complex transformation or computation that takes time, and you don't want to re-run it on every render.
  * **Example:** Calculating a large dataset or a complex filtered list.


* **`useCallback` (memoizes a function):**
  * **Purpose:** It returns a memoized version of a callback function. This is critical for preventing unnecessary re-renders of child components that use `React.memo`, as function identity changes on every render.
  * **When to use:** When passing a callback to an optimized child component (using `React.memo`) or when a function is a dependency in a `useEffect` hook.
  * **Example:** An `onClick` handler passed to a button in a memoized component.


* **`React.memo` (memoizes a component):**
  * **Purpose:** It's a higher-order component (HOC) that wraps a functional component to prevent it from re-rendering if its props have not changed. By default, it performs a **shallow comparison** of the props.
  * **When to use:** When a component is "pure" (given the same props and state, it renders the same output) and re-rendering is expensive.
  * **Example:** A complex graph or table that doesn't need to update if its data hasn't changed.



**Example Combined:**

```javascript
import React, { useState, useMemo, useCallback } from "react";

// This component will only re-render if its `count` prop changes or its `onClick` function reference changes.
const Child = React.memo(({ count, onClick }) => {
  console.log("Child rendered");
  return (
    <div>
      <p>Count is: {count}</p>
      <button onClick={onClick}>Increment</button>
    </div>
  );
});

function App() {
  const [count, setCount] = useState(0);
  const [someOtherState, setSomeOtherState] = useState(0);

  // useMemo caches the result of the squared value.
  const squaredCount = useMemo(() => {
    console.log("Expensive calculation running...");
    return count * count;
  }, [count]); // Only re-calculate if 'count' changes.

  // useCallback memoizes the function reference.
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty dependency array because setCount is stable.

  return (
    <div>
      <p>Squared Value: {squaredCount}</p>
      {/* The child component only re-renders when `count` or the `handleIncrement`
          function reference changes. Since we used useCallback, the function
          reference is stable, so the child only re-renders when `count` updates. */}
      <Child count={count} onClick={handleIncrement} />

      {/* This button will trigger a parent re-render, but the Child component will not. */}
      <button onClick={() => setSomeOtherState(s => s + 1)}>
        Toggle Parent Render
      </button>
    </div>
  );
}

```

`useMemo` and `React.memo` are optimization tools that can harm performance when used incorrectly or excessively. They introduce **overhead** that may outweigh the benefits of memoization.

**Overhead of Memoization**
Both `useMemo` and `React.memo` work by storing data in memory. This caching has a cost. React must:

* **Store the values:** The previous computation result (`useMemo`) or the previous props (`React.memo`) need to be held in memory. This increases memory usage.
* **Perform a comparison:** Before re-rendering, React must shallow-compare the new dependencies (`useMemo`) or props (`React.memo`) with their cached versions. This comparison is a small computation in itself. If the computation you're trying to optimize is trivial (e.g., `a + b`), the cost of the comparison may be greater than the cost of simply re-calculating the value or re-rendering the component.

**Scenarios where performance can degrade**
* **Shallow vs. Deep Comparison:** `React.memo` performs a shallow comparison of props. If props are complex objects or arrays that are frequently recreated with new references (even if their contents are the same), the shallow comparison will always return `false`, causing an unnecessary re-render while still incurring the overhead of the comparison. In such cases, the optimization fails entirely.
* **Unstable Dependencies:** When using `useMemo` or `useCallback`, if one of the dependencies is an object or function that is recreated on every render, the memoization will be ineffective. The hook will always see a "new" dependency and re-run the computation or return a new function, rendering the optimization useless while adding the comparison overhead.
* **Premature Optimization:** The most common mistake is applying `useMemo` or `React.memo` to every component and value without first identifying a performance bottleneck. This leads to what's known as "premature optimization." The added overhead of memoization across many components can accumulate, actually slowing down the application rather than speeding it up. It's best to profile your application first with tools like the React DevTools Profiler to pinpoint slow components before applying memoization.

### 6. What are custom hooks and why use them?

**Custom hooks are regular JavaScript functions that start with the word `use` and can call other hooks**. Their primary purpose is to abstract and encapsulate reusable logic from components. This allows you to share stateful logic without sharing the UI.

**Why use them?**

* **DRY Principle (Don't Repeat Yourself):** Instead of duplicating the same `useEffect` and `useState` logic across multiple components, you can extract it into a single, reusable hook.
* **Logic Separation:** They help keep components clean and focused on their presentational responsibilities. The "how" of data fetching, form validation, or a timer is handled inside the hook, while the component just uses the resulting data.
* **Readability and Maintainability:** Custom hooks make your code easier to read. A developer can see `const { data, loading, error } = useFetch(url);` and immediately understand what's happening without needing to read the entire component body.
* **Testability:** Because the logic is separated from the UI, custom hooks are easier to unit test in isolation.

**Example 1: A `useTimer` Hook**

The provided `useTimer` example is a perfect illustration of encapsulation. Any component that needs a timer can now simply call `const seconds = useTimer();` and get the functionality without worrying about `setInterval` or cleanup.

**Example 2: A `useFetch` Hook**

This is a more complex example that showcases the true power of custom hooks. It encapsulates the full lifecycle of a data-fetching operation.

```javascript
import { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController is a modern way to clean up fetch requests
    const abortController = new AbortController();
    const signal = abortController.signal;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // The cleanup function for the effect
    return () => {
      // Abort the fetch request if the component unmounts
      abortController.abort();
    };
  }, [url]); // Effect re-runs only if the URL changes

  // Return the state for the component to use
  return { data, loading, error };
}

```

**Usage:**

```javascript
function UserProfile({ userId }) {
  // Now, the component is only concerned with rendering the UI based on the state.
  const { data: user, loading, error } = useFetch(`https://api.example.com/users/${userId}`);

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}

```

### 7. What is difference between custom hooks and React hooks?

The key difference is that **React hooks are built-in functions** provided by the React library, while **custom hooks are functions you create yourself** to reuse logic.

**React Hooks:**

React provides a set of core, built-in hooks that handle fundamental behaviors within a component's lifecycle. You can think of them as the building blocks for managing state, side effects, and context.

**When to Use React Hooks:**

  * **`useState`:** To add a state variable to your functional component.
  * **`useEffect`:** To perform side effects, such as data fetching, subscriptions, or manually manipulating the DOM.
  * **`useContext`:** To subscribe to a React Context, allowing you to access data without prop drilling.
  * **`useReducer`:** To manage more complex state logic with a reducer function, similar to Redux.
  * **`useMemo` & `useCallback`:** To optimize performance by memoizing values and functions, respectively.
  * **`useRef`:** To hold a mutable value that persists across renders without causing a re-render when updated.

**Custom Hooks:**

A custom hook is a JavaScript function whose name starts with `use`. It's a powerful pattern for **extracting and reusing stateful logic** from one or more components. The real magic is that a custom hook can call other built-in React hooks.

**When to Use Custom Hooks:**

  * **To share logic between components:** If you find yourself writing the same `useState`, `useEffect`, or other hook logic in multiple components, you can extract it into a custom hook. For example, a `useFetch` hook to handle all your data fetching logic.
  * **To make your components cleaner:** A complex component can have many lines of logic for data fetching, form validation, or animation. A custom hook allows you to move this logic out of the component, making the component itself easier to read and understand. The component's job becomes simply rendering the UI based on the state provided by the hook.
  * **To improve testability:** By isolating logic in a custom hook, you can more easily write unit tests for that specific functionality without needing to test the entire component's rendering.

In short, you **use React hooks** to build the functionality of a single component, and you **create custom hooks** to reuse that logic across your entire application.

### 8. What is Concurrent React, and how does it differ from synchronous rendering?

In older versions (React 17 and below), rendering was **synchronous and uninterruptible**. Once React started rendering an update, nothing could stop it until it finished. If a large list was rendering, the main thread would "freeze," making the input fields or buttons unresponsive.

**Concurrent React** makes rendering **interruptible**. React can now prepare multiple versions of the UI in the background. If a user types into an input while a heavy list is rendering, React can "pause" the list render, handle the input click (high priority), and then resume the list render.

### 9. What is the purpose of `useTransition`?

`useTransition` allows you to mark certain state updates as **non-urgent** (transitions). Urgent updates (like typing in an input) happen immediately, while transitions happen in the background without blocking the UI.

**Code Example:**

```javascript
import { useState, useTransition } from 'react';

function SearchList({ items }) {
  const [isPending, startTransition] = useTransition();
  const [filterTerm, setFilterTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  const handleChange = (e) => {
    // 1. Urgent update: Update the input field immediately
    setFilterTerm(e.target.value);

    // 2. Non-urgent update: Wrap heavy filtering logic in a transition
    startTransition(() => {
      const filtered = items.filter(item => item.includes(e.target.value));
      setFilteredItems(filtered);
    });
  };

  return (
    <div>
      <input value={filterTerm} onChange={handleChange} />
      {isPending && <p>Loading heavy list...</p>}
      <ul>
        {filteredItems.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

```

### 10. `useDeferredValue` vs. Debouncing/Throttling

  * **Debouncing:** Waits for a fixed delay (e.g., 300ms) before executing. If the device is fast, the user waits unnecessarily. If the device is slow, 300ms might not be enough.
  * **useDeferredValue:** It doesn't use a fixed timer. It tells React: "Try to update this value as soon as the main thread is free." On fast devices, the update is nearly instant. On slow devices, it lags gracefully without freezing the UI.

### 11. Automatic Batching (React 18+)

**Batching** is when React groups multiple state updates into a single re-render for better performance.

  * **Before React 18:** React only batched updates inside React event handlers (like `onClick`). Updates inside `promises`, `setTimeout`, or native event listeners were **not** batched (causing multiple renders).
  * **React 18+:** All updates are automatically batched regardless of where they originate.

**Code Comparison:**

```javascript
// In React 18, this only causes ONE re-render
fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
});

// To opt-out (Rarely needed):
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(c => c + 1); // Triggers immediate render
});

```

### 12. React Server Components (RSC) vs. Client Components

* **Server Components (`.js` by default in frameworks like Next.js):** Render exclusively on the server. They **never** send JavaScript to the client. They can be `async` and fetch data directly from a database.
* **Client Components (`'use client'`):** The traditional React components we know. They have state, effects, and event listeners.

**Key Benefit:** RSCs significantly reduce the **Bundle Size** because the logic used to fetch and format the data stays on the server.

### 13. React Actions & Form Handling (React 19+)

React 19 introduced "Actions" to handle transitions and data mutations automatically, especially in forms. It automatically handles the "Pending" state for you.

**Code Example:**

```javascript
// React 19 Action Example
function UpdateName() {
  async function updateAction(formData) {
    const name = formData.get("name");
    await updateNameInDB(name); // Async logic
  }

  return (
    // 'action' is a new prop that handles the async lifecycle
    <form action={updateAction}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  );
}

```

### 14. The `use` Hook (React 19+)

The `use` hook is a unique new API that can be called **conditionally** or inside loops (unlike other hooks). It is used to read the value of a Promise or a Context.

**Code Example:**

```javascript
import { use } from 'react';

function Message({ messagePromise }) {
  // use() will "suspend" the component until the promise resolves
  const message = use(messagePromise); 
  return <p>{message}</p>;
}

```

### 15. `useOptimistic` (React 19+)

This hook allows you to show a "final" state to the user immediately while an async request is still flying in the background. If the request fails, React automatically reverts the UI to the old state.

### 16. `useId` for Accessibility

Using `Math.random()` for IDs in React causes "hydration mismatches" (the server generates one number, the client generates another). `useId` generates a stable, unique ID that is consistent across server and client.

### 17. The Role of `<Suspense>`

Initially, Suspense was only for `React.lazy` (code splitting). Now, it is the primary way to handle **Data Fetching**. It allows you to define a "Loading UI" declaratively.
**Streaming SSR:** With Suspense, the server can start sending the HTML for the "Navbar" and "Sidebar" immediately and "stream" the "Content" later once the data is ready.

### 18. React Compiler (React Forget)

This is the most anticipated feature. Currently, we manually optimize with `useMemo` and `useCallback`. This adds "mental overhead."
The **React Compiler** is a build-time tool that automatically detects which values need to be memoized. In the future, you won't need to write `useMemo` or `useCallback` anymore; React will do it for you automatically.


### 19. Why React component names must start with an uppercase letter:

**1. The Fundamental Rule**
*   **Case Sensitivity:** In React, when you define a component, the **first letter of its name must be capitalized** (e.g., `<User />` instead of `<user />`).
*   **The Error:** If you use a lowercase letter for a component name, React will not recognize it as a component. Instead, it will treat it as a standard HTML tag, leading to an error because the browser does not recognize tags like `<user>`.

**2. The Technical Reason: Role of Babel**
*   **JSX vs. Pure JavaScript:** The code written in React is **JSX** (JavaScript XML), which is not pure JavaScript that a browser can understand directly.
*   **Babel as a Transcompiler:** React uses a tool called **Babel** to convert JSX code into standard HTML and JavaScript.
*   **Babel’s Logic:**
    *   If Babel sees a tag starting with a **lowercase letter**, it assumes it is a **normal HTML element** (like `<div>`, `<h1>`, or `<span>`).
    *   If Babel sees a tag starting with an **uppercase letter**, it recognizes it as a **React component** and processes it accordingly.

**3. Examples and Proofs**

**Correct Usage (Uppercase)**
```javascript
// Component name starts with 'U'
function User() {
  return <h1>Anil Sidhu</h1>;
}

// Usage
<User /> 
```
*   **Result:** Babel recognizes this as a component, and the output "Anil Sidhu" is displayed correctly.

**Incorrect Usage (Lowercase)**
```javascript
// Component name starts with 'u'
function user() {
  return <h1>Anil Sidhu</h1>;
}

// Usage
<user />
```
*   **Result:** This triggers an error. Babel treats `<user />` as a standard HTML tag. Since there is no such built-in HTML tag, the browser fails to recognize it.

**4. Component Name vs. File Name**
*   **Internal Consistency:** Even if the **file name** is lowercase (e.g., `user.js`), the **component name** inside the file and the way it is imported/used must still start with an **uppercase letter** to function correctly as a React component.
*   **Common Interview Question:** A frequent question is whether a lowercase file name will cause an error if the component name itself is uppercase. While React primarily cares about the component name starting with a capital letter, keeping file names uppercase is a common best practice.


### 20 Differences between a **React Component** and a **JavaScript Function**:

**1. The Core Difference: Naming Convention**
*   **React Component:** In React, if a function's name starts with a **capital letter** (e.g., `Color`), it is treated as a component.
*   **JavaScript Function:** If the first letter of the name is **lowercase** (e.g., `color`), it is treated as a standard JavaScript function.

**2. Difference in Usage (Syntax)**
*   **Component Usage:** Components are invoked using **HTML-like syntax** with angle brackets, such as `<Color />`.
*   **Function Usage:** Normal functions are called using the traditional JavaScript way with **round brackets**, such as `color()`.

**3. The Role of the Babel Compiler**
*   **Identification:** The **Babel compiler** specifically looks for the capitalization of the first letter to decide how to process the code.
*   **JSX Processing:** When the first letter is capital, Babel recognizes that it can contain **JSX code** and compiles it accordingly.
*   **Features:** Capitalized components allow for the use of **States, Props, and HTML-like tags** within the JSX, which are then treated and compiled by React.
*   **Standard Treatment:** If the name is lowercase, Babel treats it as a **normal function** and does not apply the specialized JSX compilation.

**4. Comparative Examples**

**A. React Component Example**
```javascript
// The first letter 'C' is capital
function Color() {
  return <h1>This is a React Component</h1>;
}

// Usage in JSX
<Color />
```
*   **Result:** React treats this as a UI building block, processing its internal states and props.

**B. Normal Function Example**
```javascript
// The first letter 'c' is lowercase
function color() {
  return "This is a normal function";
}

// Usage in JavaScript/React
color();
```
*   **Result:** This is executed as a standard logic function without the specialized features of a React component.

**Summary Table**

| Feature | React Component | JavaScript Function |
| :--- | :--- | :--- |
| **First Letter** | **Capitalized** (e.g., `User`) | **Lowercase** (e.g., `user`) |
| **Call Syntax** | `<User />` | `user()` |
| **Babel Treatment** | Compiles as JSX/Component | Compiles as a normal function |
| **Key Features** | Can use States, Props, and JSX | Standard JS logic |


### 21. Why does React require the use of the `className` property instead of the standard `class` attribute for adding CSS styles?

React uses `className` because the keyword **`class` is already reserved in JavaScript** for defining Object-Oriented Programming (OOP) classes. To avoid a naming conflict with these internal JavaScript structures, React adopted `className` for CSS styling. During the compilation process, **JSX recognizes that `className` refers to a CSS class** and automatically converts it back to the standard `class` attribute in the final HTML code rendered by the browser.

**Example:**

```javascript
// The correct way to apply a CSS class in a React component
function Header() {
  return (
    <h1 className="main-title">Hello World</h1>
  );
}

// In standard JavaScript, the keyword 'class' is reserved for this:
class User {
  constructor(name) {
    this.name = name;
  }
}
```
