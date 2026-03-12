# React Hooks - [Built-in React Hooks](https://react.dev/reference/react/hooks)
Hooks let you use different React features from your components. You can either use the built-in Hooks or combine them to build your own.

## State Hooks
State lets a component “remember” information like user input. For example, a form component can use state to store the input value, while an image gallery component can use state to store the selected image index.
To add state to a component, use one of these Hooks:

* **useState**: declares a state variable that you can update directly.
* **useReducer**: declares a state variable with the update logic inside a reducer function.

```javascript
function ImageGallery() {
  const [index, setIndex] = useState(0);
  // ...
}
```

## Context Hooks
Context lets a component receive information from distant parents without passing it as props. For example, your app’s top-level component can pass the current UI theme to all components below, no matter how deep.

* **useContext**: reads and subscribes to a context.

```javascript
function Button() {
  const theme = useContext(ThemeContext);
  // ...
}
```

## Ref Hooks
Refs let a component hold some information that isn’t used for rendering, like a DOM node or a timeout ID. Unlike with state, updating a ref does not re-render your component. Refs are an “escape hatch” from the React paradigm. They are useful when you need to work with non-React systems, such as the built-in browser APIs.

* **useRef**: declares a ref. You can hold any value in it, but most often it’s used to hold a DOM node.
* **useImperativeHandle**: lets you customize the ref exposed by your component. This is rarely used.

```javascript
function Form() {
  const inputRef = useRef(null);
  // ...
}
```

## Effect Hooks
Effects let a component connect to and synchronize with external systems. This includes dealing with network, browser DOM, animations, widgets written using a different UI library, and other non-React code.

* **useEffect**: connects a component to an external system.

```javascript
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  // ...
}
```

Effects are an “escape hatch” from the React paradigm. Don’t use Effects to orchestrate the data flow of your application. If you’re not interacting with an external system, you might not need an Effect.
There are two rarely used variations of useEffect with differences in timing:

* **useLayoutEffect**: fires before the browser repaints the screen. You can measure layout here.
* **useInsertionEffect**: fires before React makes changes to the DOM. Libraries can insert dynamic CSS here.

## Performance Hooks
A common way to optimize re-rendering performance is to skip unnecessary work. For example, you can tell React to reuse a cached calculation or to skip a re-render if the data has not changed since the previous render.
To skip calculations and unnecessary re-rendering, use one of these Hooks:

* **useMemo**: lets you cache the result of an expensive calculation.
* **useCallback**: lets you cache a function definition before passing it down to an optimized component.

```javascript
function TodoList({ todos, tab, theme }) {
  const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
  // ...
}
```

Sometimes, you can’t skip re-rendering because the screen actually needs to update. In that case, you can improve performance by separating blocking updates that must be synchronous (like typing into an input) from non-blocking updates which don’t need to block the user interface (like updating a chart).
To prioritize rendering, use one of these Hooks:

* **useTransition**: lets you mark a state transition as non-blocking and allow other updates to interrupt it.
* **useDeferredValue**: lets you defer updating a non-critical part of the UI and let other parts update first.

## Other Hooks
These Hooks are mostly useful to library authors and aren’t commonly used in the application code.


### useId
`useId` is a React Hook introduced to **generate unique IDs** that are primarily used for accessibility attributes,. It ensures that IDs remain stable and unique even when a component is rendered multiple times on the same page.

**Key Notes on `useId`**

*   **Primary Purpose:** It is used to link HTML elements together for **accessibility**, such as connecting a label to an input or a description to a field,.
*   **Stability in SSR:** Unlike a simple incrementing counter, `useId` is designed to work with **Server-Side Rendering (SSR)**. It ensures that the ID generated on the server matches the ID generated during hydration on the client, preventing mismatches,.
*   **Top-Level Call:** As a Hook, it must be called at the **top level** of your component or your own custom Hooks,. It cannot be called inside loops or conditional statements.
*   **Unique String Generation:** It returns a **unique ID string** specific to that particular call within that component.
*   **Shared Prefixes:** If you have multiple independent React apps on one page, you can provide an `identifierPrefix` to `createRoot` to prevent ID collisions between the different applications.

**Usage Examples**

**1. Generating Unique IDs for Accessibility**
Hardcoding IDs in React can cause issues if a component is used more than once. `useId` provides a unique value for every instance.

```javascript
import { useId } from 'react';

function PasswordField() {
  const passwordHintId = useId();
  return (
    <>
      <label>
        Password:
        <input type="password" aria-describedby={passwordHintId} />
      </label>
      <p id={passwordHintId}>
        The password should contain at least 18 characters
      </p>
    </>
  );
}
```
In this example, even if `PasswordField` appears multiple times on the screen, the `passwordHintId` will be unique for each one, ensuring the `aria-describedby` attribute correctly points to the corresponding hint,.

**2. Generating IDs for Multiple Related Elements**
You can use a single `useId` call to create a **shared prefix** for several related elements in a single component.

```javascript
import { useId } from 'react';

export default function Form() {
  const id = useId();
  return (
    <form>
      <label htmlFor={id + '-firstName'}>First Name:</label>
      <input id={id + '-firstName'} type="text" />

      <label htmlFor={id + '-lastName'}>Last Name:</label>
      <input id={id + '-lastName'} type="text" />
    </form>
  );
}
```
This approach avoids calling `useId` multiple times for every single input field in a form.

**Important Pitfalls and Restrictions**
*   **Do Not Use for Keys:** You should **not** use `useId` to generate keys for items in a list,. Keys should always be generated from your actual data.
*   **Not for Cache Keys:** It should not be used to generate keys for caching purposes, as the ID may change during different render cycles.
*   **Server Consistency:** For `useId` to function correctly in server rendering, the **component tree must be identical** on both the server and the client.
*   **Async Limitations:** Currently, `useId` cannot be used in asynchronous Server Components.



### **useDebugValue**: lets you customize the label React DevTools displays for your custom Hook.
### **useSyncExternalStore**: lets a component subscribe to an external store.
### **useActionState**: allows you to manage state of actions.
