### Call

```JavaScript
Function.prototype.myCall = function(context, ...args) {
  context = context || window; // Default to global scope
  const fnSymbol = Symbol(); // Use a Symbol to avoid overwriting properties
  context[fnSymbol] = this; 
  
  const result = context[fnSymbol](...args);
  delete context[fnSymbol]; // Clean up
  return result;
};
```

### Apply

```javascript
Function.prototype.myApply = function(context, argsArray) {
  context = context || window;
  const fnSymbol = Symbol();
  context[fnSymbol] = this;
  
  const result = context[fnSymbol](...(argsArray || []));
  delete context[fnSymbol];
  return result;
};
```

### Bind

```JavaScript
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...nextArgs) {
    return fn.apply(context, [...args, ...nextArgs]);
  };
};
```
