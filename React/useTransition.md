---

## useTransition

The `useTransition` hook lets you defer updating the state within a component. Use it when you want to keep the interface responsive while transitioning to a new state.

### Example

```jsx
import { useTransition } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button onClick={() => {
        startTransition(() => {
          /* update state here */
        });
      }}>
        {isPending ? 'Loading...' : 'Click me'}
      </button>
    </div>
  );
}
```

### Notes
- `useTransition` returns two values: `isPending`, which is a boolean indicating if the transition is ongoing, and `startTransition`, a function to wrap the state updates that should be deferred.
- It can help keep your app responsive when rendering large updates or changes.