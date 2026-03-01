## https://github.com/sudheerj/reactjs-interview-questions

### 1. What is React Fiber and how does it differ from the old reconciliation algorithm?

- React Fiber is a complete rewrite of React’s core rendering engine introduced around React 16. Its main job is to **break rendering work into small chunks** and **prioritize tasks** based on urgency, which allows smoother rendering — especially in large apps.
- In older versions of React, the rendering process was synchronous and blocking. So if the UI update was heavy, the browser could freeze.
- But Fiber makes rendering **interruptible** — React can pause work, do something more urgent like handling user input, then come back and continue where it left off.

👉 In short: Fiber brings **asynchronous rendering, prioritization, and better user experience**.

### 2. How does React determine when to re-render a component?

React re-renders a component when:
- Its **state or props change**
- Its **parent component re-renders**, unless it’s memoized

But here’s the twist: React doesn’t do **deep comparisons** by default. So even if an object or array looks “the same”, if the reference changes, React treats it as different.

That’s why techniques like:
- React.memo()
- useMemo()
- useCallback() are important in performance tuning — they help you avoid unnecessary renders when data hasn’t really changed.

🧠 Bonus: The **key prop** also plays a role in determining if elements inside a list need to be re-rendered or
not.

### 3. What are concurrent features in React and how do they help?

Concurrent features — introduced in React 18 — allow React to prepare multiple versions of the UI at the same time.

Let’s say a user is typing a search query and you’re fetching filtered results. Without concurrency, the UI could feel laggy. But with concurrent rendering, React can **keep the UI responsive** while preparing the new result list **in the background**.

📦 Features like `startTransition`, `useDeferredValue`, and automatic batching allow this.
So, concurrent features are like giving React **multitasking superpowers** — it can prioritize urgent updates like user input over non-urgent tasks like data fetching.

### 4. Explain React's batching behavior and what changed in React 18.

Batching means React **groups multiple state updates into one render** to improve performance.

Before React 18, batching only worked **inside React event handlers**. If you updated state inside a `setTimeout` or `fetch().then()`, those updates triggered multiple renders.
React 18 introduced **automatic batching** — so now, even updates inside promises, `setTimeout`, or native events are batched by default.

This means **fewer renders**, better performance, and more predictable behavior across async code.

### 5. What is the difference between useMemo and useCallback, and when not to use them?

- `useMemo` is used to memoize **values**
- `useCallback` is used to memoize **functions**
They both prevent re-creation on every render, but people often **overuse them**.
Here’s the deal: if the memoization is more expensive than recalculating the value, you're actually hurting performance. Only use them if:
  - The value/function is heavy to compute
  - It causes unnecessary re-renders in children
Think of them as performance tools, not default habits.

### 6. How does Suspense work, and what are some real use cases beyond lazy loading?

`React.Suspense` lets you “wait” for something (like a lazy-loaded component, or data fetching when used with libraries like React Query, Relay, or SWR).

You wrap content like:

```jsx
<Suspense fallback={<Loading />}>
  <MyComponent />
</Suspense>
```

While the content is loading, React shows the `fallback`. Once ready, React renders the actual UI.

Beyond lazy loading, Suspense is useful for:
- **Streaming SSR** (e.g., in Next.js / React SSR setups)
- **Coordinating parallel data loading**
- **Smoother transitions** to reduce layout shifts and jank

👉 In short: Suspense improves UX around loading by letting you control *what* renders while async work is in progress.

### 7. What is `useImperativeHandle` and when should you use it?

`useImperativeHandle` is used with `forwardRef` to expose **custom instance methods** from a child component to its parent—without exposing the full DOM node/ref.

Example use case: a custom `Input` component that exposes only a `focus()` method.

🛡 Why it’s useful:
- Keeps **encapsulation**
- Gives the parent **controlled access** (instead of full DOM access)

Use it when you truly need imperative control from a parent (it’s niche, but powerful).

### 8. How do you optimize large lists in React?

Rendering thousands of DOM nodes can make the UI slow or unresponsive.

Common approaches:
- Use **windowing/virtualization** libraries like `react-window` or `react-virtualized`
- Render only the **visible items** (plus a small buffer)
- Use stable and correct **`key` props**
- Combine with memoization like **`React.memo`** to prevent re-rendering unchanged rows

👉 Think “render what the user can see”, not the entire dataset.

### 9. How does `useRef` differ from `useState`?

- `useState` stores values that **trigger a re-render** when updated.
- `useRef` stores a mutable value that **does not trigger a re-render** when changed.

Use `useRef` for:
- DOM references (`ref={myRef}`)
- storing timers/interval IDs
- storing previous values
- avoiding re-renders for mutable values

So:
- `useState` = React updates UI when it changes  
- `useRef` = React doesn’t re-render when it changes

### 10. How does React handle hydration in SSR, and what problems can arise?

**Hydration** is the process where React attaches event listeners and makes server-rendered HTML interactive on the client.

If server-rendered HTML doesn’t match what the client renders, you can get **hydration mismatch** warnings (and broken UI in some cases).

Common causes:
- Rendering random values like `Math.random()` during render
- Using `window`, `document`, or `localStorage` during server render
- Different conditional rendering on server vs client
- Missing/incorrect Suspense boundaries in streaming setups

👉 Hydration issues can be subtle—always test SSR flows carefully.

### 11. What is the difference between controlled and uncontrolled components?

```jsx
// **Controlled components**: form values are driven by React state.
<input value={name} onChange={(e) => setName(e.target.value)} />

// **Uncontrolled components**: form values are managed by the DOM itself (often accessed via refs).
<input defaultValue="John" ref={inputRef} />
```

When to use what:
- Controlled: complex validation, dynamic behavior, React-driven forms
- Uncontrolled: simple forms or integrating with non-React code

### 12. What are custom hooks and why should you use them?

Custom hooks let you extract and reuse stateful logic across components.

Example:

```jsx
function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch auth status
  }, []);

  return user;
}
```

Benefits:
- Keeps code **DRY**
- Improves **readability**
- Makes logic **reusable** across components

### 13. What’s the difference between `useEffect` and `useLayoutEffect`?

- `useEffect` runs **after paint** (non-blocking)
- `useLayoutEffect` runs **before paint** (blocking)

Use `useLayoutEffect` when you must read/write layout before the browser paints (e.g., measuring DOM size to avoid flicker):

```jsx
useLayoutEffect(() => {
  const height = ref.current.offsetHeight;
}, []);
```

### 14. What are React portals and when to use them?

Portals let you render children into a DOM node **outside** the parent component’s DOM hierarchy.

```jsx
ReactDOM.createPortal(<Modal />, document.getElementById("modal-root"))
```

Common use cases:
- Modals
- Tooltips
- Popovers

Even though the DOM node is elsewhere, React event bubbling still works through the React tree.

### 15. What is the `key` prop in React and why is it important?

Keys help React identify which list items have changed, been added, or removed.

Prefer stable IDs:

```jsx
items.map((item) => <li key={item.id}>{item.name}</li>)
```

Avoid using array indexes as keys when lists can change order or items can be inserted/removed.

Improper keys can cause:
- bugs in stateful list items
- unnecessary re-renders / poor performance

### 16. How does React handle state updates — synchronously or asynchronously?

React schedules and batches state updates, so state changes may not be immediately reflected after calling a setter.

```jsx
setCount(count + 1);
console.log(count); // might log the old value
```

When the next state depends on the previous state, use a functional update:

```jsx
setCount((prev) => prev + 1);
```

### 17. What is reconciliation in React?

Reconciliation is React’s process of comparing the previous Virtual DOM tree with the next one to determine what changed and update the real DOM efficiently.

It:
- diffs trees to minimize DOM operations
- relies heavily on `key` props in lists
- became interruptible and smarter with **Fiber**

### 18. Explain lazy loading in React.

Lazy loading delays loading a component until it’s needed:

```jsx
const LazyComp = React.lazy(() => import("./HeavyComponent"));
```

Use it with Suspense:

```jsx
<Suspense fallback={<Loading />}>
  <LazyComp />
</Suspense>
```

Benefit: reduces initial bundle size and improves initial load performance.

### 19. What are React Server Components (RSC)?

React Server Components allow components to render on the server without shipping their JavaScript to the client.

They can:
- fetch data on the server
- send a lightweight result to the browser (not full client JS)
- work with Suspense for streaming UX

They’re still evolving, but they’re promising for performance and bundle-size reduction.

### 20. What are render props and how do they compare to hooks?

Render props are a pattern where a component receives a function that returns UI:

```jsx
<DataFetcher render={(data) => <UI data={data} />} />
```

Hooks are generally preferred today because they’re usually cleaner and easier to compose, but render props are still valid (especially in older codebases).
