### Actions: Simplified Form Handling
*   **Definition:** "Actions" are functions that use **asynchronous transitions**. 
*   **Automatic Management:** They automatically handle data submission, pending states, and sequential updates.
*   **Key Concept:** Any function using `async/await` or a Promise during a form submission is considered an Action.

**Example:**
```javascript
// React 19 Action handles async transitions automatically
async function handleLogin(formData) {
  const result = await api.login(formData); 
}

<form action={handleLogin}> 
  <input name="email" />
  <button type="submit">Login</button>
</form>
```

### Enhanced Action Hooks
React 19 introduces several hooks to manage the lifecycle of an Action:

*   **`useTransition`:** Returns `isPending` to track background work and `startTransition` to wrap updates. It prevents the UI from freezing during heavy tasks.
*   **`useActionState`:** Manages the action function, the **pending state**, and **error reporting** all in one hook.
*   **`useFormStatus`:** Allows **child components** to access the status (e.g., `pending`, `data`) of their parent `<form>`.
*   **`useOptimistic`:** Instantly updates the UI with the expected result while the server is still processing. If the request fails, it **automatically reverts** the UI,.

**Example (`useActionState`):**
```javascript
const [error, submitAction, isPending] = useActionState(async (prevState, formData) => {
  const res = await save(formData);
  return res.error || null; // Captured in 'error'
}, null);

return (
  <form action={submitAction}>
    {error && <p>{error}</p>}
    <button disabled={isPending}>Submit</button>
  </form>
);
```

### The New `use` API
*   **Usage:** A versatile API used to read **Promises** or **Context** directly in the render path,.
*   **Conditional Support:** Unlike traditional hooks, `use` can be called inside **conditional statements** (like `if`).
*   **Suspense Integration:** When reading a Promise, it "suspends" the component, showing a fallback (like a loader) until the data resolves.

**Example:**
```javascript
function ThemeButton() {
  if (useTheme) {
    const theme = use(ThemeContext); // Valid in React 19
    return <button style={{ color: theme.color }}>Themed</button>;
  }
  return <button>Standard</button>;
}
```

### Ref and Context API Improvements
*   **Ref as a Prop:** `forwardRef` is now **deprecated**. You can pass `ref` as a standard prop to any component,.
*   **Ref Cleanup:** You can now return a **cleanup function** from a ref callback to handle logic when a component unmounts.
*   **Simplified Context:** You no longer need `<Context.Provider>`. You can use the Context component itself as the provider,.

**Example:**
```javascript
// No forwardRef needed!
function MyInput({ ref, placeholder }) {
  return <input ref={ref} placeholder={placeholder} />;
}

// Simplified Context
<ThemeContext value="dark"> {children} </ThemeContext>
```

### Document Metadata and Asset Support
*   **Metadata Hoisting:** You can place `<title>`, `<meta>`, and `<link>` tags anywhere in your component tree. React 19 will automatically "hoist" them to the document `<head>`,.
*   **Asset Deduplication:** React ensures that stylesheets and async scripts are only loaded **once**, even if the component is rendered multiple times.

### Server-Side Features
*   **Server Components (RSC):** Components rendered on the server to speed up initial page loads.
*   **Server Actions:** Allows client components to call functions that execute directly on the server using the `"use server"` directive.
*   **SSG APIs:** New APIs like `prerender` and `prerenderToNodeStream` help generate HTML at build time for better SEO.

### Miscellaneous Improvements
*   **`useDeferredValue`:** Now supports an **initial value** for the first render.
*   **Custom Elements:** Full support for Web Components (Custom Elements) without previous errors or warnings.
*   **Better Error Reporting:** Deduplicated console errors and clearer hydration mismatch messages,.
*   **Resource Preloading:** New functions like `preload` and `preinit` allow developers to load fonts or scripts early to improve performance.
