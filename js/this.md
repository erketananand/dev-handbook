1. incase of your nodejs -> GEC-> this will be -> {} and in case of web browser this will be window
2. when fn is called directly without an obj -> this will be determined -> global object
3. when a method call is done on a obj -> this will be determined-> that object
4. this with arrow --> arrow function doen't have it's own this context -> it takes from outer lexical scope (if immediate outer sccope is also arrow then it will go one more step outer to get the context of this)
