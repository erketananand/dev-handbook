### Functional Constructor Prototype Inheritance:
```javascript
function Vehicle(type) {
  this.type = type;
}

Vehicle.prototype.start = function () {
  return this.type + " started";
};

function Car(type, brand) {
  Vehicle.call(this, type); // Parent.call(this, ...) equivalent to super()
  this.brand = brand;
}

Car.prototype = Object.create(Vehicle.prototype); // Object.create() used for prototype chaining
Car.prototype.constructor = Car; // Reset constructor

Car.prototype.drive = function () {
  return this.brand + " is driving";
};

const car1 = new Car("Car", "BMW");
// car1 → Car.prototype → Vehicle.prototype → Object.prototype → null
console.log(car1.start()); // Car started
console.log(car1.drive()); // BMW is driving
```

### ES6 Inheritance:
```javascript
class Vehicle {
  constructor(type) {
    this.type = type;
  }

  start() {
    return this.type + " started";
  }
}

class Car extends Vehicle {
  constructor(type, brand) {
    super(type); // calls Vehicle constructor
    this.brand = brand;
  }

  drive() {
    return this.brand + " is driving";
  }
}

const car1 = new Car("Car", "BMW");

console.log(car1.start()); // Car started
console.log(car1.drive()); // BMW is driving
```
