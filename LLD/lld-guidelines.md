# LLD Guidelines & Best Practices

**Last Updated**: March 2026  
**Purpose**: Comprehensive guide for designing and implementing Low-Level Design (LLD) systems following SOLID principles and design patterns

---

## Table of Contents

1. [SOLID Principles](#solid-principles)
2. [Design Patterns](#design-patterns)
3. [Project Structure](#project-structure)
4. [Code Organization](#code-organization)
5. [Naming Conventions](#naming-conventions)
6. [Class Design](#class-design)
7. [Repository Pattern](#repository-pattern)
8. [Service Layer Pattern](#service-layer-pattern)
9. [Error Handling](#error-handling)
10. [Dependency Injection](#dependency-injection)
11. [Testing Strategy](#testing-strategy)
12. [Documentation Standards](#documentation-standards)
13. [Code Review Checklist](#code-review-checklist)

---

## SOLID Principles

### 1. Single Responsibility Principle (SRP)

**Definition**: A class should have only one reason to change. Each class should have a single, well-defined responsibility.

**Application in LLD**:
- **Entity Classes**: Represent domain objects (User, Transaction, Wallet)
  - Responsibility: Hold data and domain logic only
  - Example: `User` class manages user profile, not authentication logic

- **Repository Classes**: Handle data access
  - Responsibility: CRUD operations and data retrieval only
  - Do NOT include business logic or validation

- **Service Classes**: Implement business logic
  - Responsibility: Orchestrate entities and repositories
  - Do NOT handle data access directly

- **Utility Classes**: Provide helper functions
  - Responsibility: Stateless operations (validation, formatting, conversion)
  - Do NOT mix multiple unrelated utilities

**Bad Example**:
```typescript
class User {
  userId: UUID;
  name: string;
  
  // ❌ VIOLATION: Multiple responsibilities
  public save(): void { /* database logic */ }
  public sendEmail(): void { /* email logic */ }
  public validateRole(): boolean { /* authentication */ }
  public calculateTaxes(): number { /* tax logic */ }
}
```

**Good Example**:
```typescript
// Domain Logic Only
class User {
  userId: UUID;
  name: string;
  isVerified: boolean;
  
  public updateProfile(name: string): void {
    this.name = name;
  }
}

// Data Access
class UserRepository implements IRepository<User> {
  public save(user: User): void { /* database */ }
  public findById(id: UUID): User { /* query */ }
}

// Business Logic
class UserService {
  constructor(private userRepository: UserRepository) {}
  
  public registerUser(name: string, email: string): User {
    const user = new User(name, email);
    this.userRepository.save(user);
    return user;
  }
}
```

**Checklist**:
- ✅ Each class has ONE primary responsibility
- ✅ Class name clearly describes its responsibility
- ✅ Methods serve the primary responsibility
- ✅ No mixing of data access, business logic, and presentation

---

### 2. Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension but closed for modification.

**Application in LLD**:
- Use abstract classes and interfaces for extensibility
- Implement new features by extending, not modifying existing code
- Use strategy pattern for varying algorithms
- Use factory pattern for object creation

**Bad Example**:
```typescript
// ❌ VIOLATION: Must modify class for each new payment type
class PaymentProcessor {
  public process(type: string, amount: number): void {
    if (type === 'CREDIT_CARD') { /* process credit */ }
    else if (type === 'DEBIT_CARD') { /* process debit */ }
    else if (type === 'UPI') { /* process UPI */ }
    else if (type === 'WALLET') { /* process wallet */ }
    // Adding new payment type requires modification ❌
  }
}
```

**Good Example**:
```typescript
// ✅ SOLUTION: Extend with new implementations
interface PaymentStrategy {
  process(amount: number): boolean;
}

class CreditCardPayment implements PaymentStrategy {
  public process(amount: number): boolean { /* implementation */ }
}

class UPIPayment implements PaymentStrategy {
  public process(amount: number): boolean { /* implementation */ }
}

// Adding new payment type only requires new class, no modification
class WalletPayment implements PaymentStrategy {
  public process(amount: number): boolean { /* implementation */ }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}
  
  public process(amount: number): boolean {
    return this.strategy.process(amount);
  }
}
```

**Checklist**:
- ✅ Use interfaces/abstract classes for variation points
- ✅ Employ design patterns (Strategy, Factory, Template Method)
- ✅ New features added via extension, not modification
- ✅ Polymorphism used for runtime behavior changes

---

### 3. Liskov Substitution Principle (LSP)

**Definition**: Objects of derived classes should be substitutable for objects of base classes without breaking the application.

**Application in LLD**:
- All implementations of an interface must honor the contract
- Child classes should not weaken preconditions or strengthen postconditions
- Override methods must be compatible with parent methods

**Bad Example**:
```typescript
// ❌ VIOLATION: Rectangle implementation breaks square behavior
class Rectangle {
  protected width: number;
  protected height: number;
  
  public setWidth(w: number): void { this.width = w; }
  public setHeight(h: number): void { this.height = h; }
  public getArea(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  // ❌ VIOLATION: Sets both width and height, not substitutable
  public setWidth(w: number): void {
    this.width = w;
    this.height = w; // Unexpected behavior for Rectangle client
  }
  
  public setHeight(h: number): void {
    this.width = h;
    this.height = h;
  }
}

// This breaks:
let shape: Rectangle = new Square();
shape.setWidth(5);
shape.setHeight(10);
console.log(shape.getArea()); // Expected 50, got 100 ❌
```

**Good Example**:
```typescript
// ✅ SOLUTION: Proper hierarchy
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  public getArea(): number { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  public getArea(): number { return this.side * this.side; }
}

// Both are substitutable via Shape interface
let shapes: Shape[] = [
  new Rectangle(5, 10),  // Area = 50
  new Square(5)          // Area = 25
];
```

**Checklist**:
- ✅ Implementations fully honor interface contracts
- ✅ Can substitute derived classes for base classes
- ✅ No unexpected behavior in overridden methods
- ✅ Method signatures remain compatible

---

### 4. Interface Segregation Principle (ISP)

**Definition**: Clients should not depend on interfaces they don't use. Prefer many specific interfaces over one general-purpose interface.

**Application in LLD**:
- Create small, focused interfaces
- Classes implement ONLY the interfaces they need
- Avoid "fat" interfaces with methods some implementations don't need

**Bad Example**:
```typescript
// ❌ VIOLATION: Fat interface
interface PaymentService {
  processPayment(amount: number): void;
  refundPayment(amount: number): void;
  reconcileAccounts(): void;
  generateReport(): void;
  auditLog(event: string): void;
  notifyMerchant(message: string): void;
}

// ❌ Wallet implementation forced to implement all methods
class WalletPaymentService implements PaymentService {
  public processPayment(amount: number): void { /* ... */ }
  public refundPayment(amount: number): void { /* ... */ }
  public reconcileAccounts(): void { /* not needed */ }
  public generateReport(): void { /* not needed */ }
  public auditLog(event: string): void { /* not needed */ }
  public notifyMerchant(message: string): void { /* not needed */ }
}
```

**Good Example**:
```typescript
// ✅ SOLUTION: Segregated interfaces
interface PaymentProcessor {
  processPayment(amount: number): void;
  refundPayment(amount: number): void;
}

interface Reconcilable {
  reconcile(): void;
}

interface Reportable {
  generateReport(): string;
}

interface Auditable {
  log(event: string): void;
}

interface Notifiable {
  notify(message: string): void;
}

// Wallet only implements what it needs
class WalletPaymentService implements PaymentProcessor, Auditable {
  public processPayment(amount: number): void { /* ... */ }
  public refundPayment(amount: number): void { /* ... */ }
  public log(event: string): void { /* ... */ }
}

// Merchant service uses additional interfaces
class MerchantPaymentService 
  implements PaymentProcessor, Notifiable, Reconcilable {
  public processPayment(amount: number): void { /* ... */ }
  public refundPayment(amount: number): void { /* ... */ }
  public notify(message: string): void { /* ... */ }
  public reconcile(): void { /* ... */ }
}
```

**Checklist**:
- ✅ Interfaces are small and focused (1-3 methods)
- ✅ No unused method implementations
- ✅ Classes implement ONLY required interfaces
- ✅ Related methods grouped logically

---

### 5. Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions. Depend on interfaces, not concrete implementations.

**Application in LLD**:
- Inject dependencies through constructor
- Depend on interfaces/abstract classes
- Use factories for object creation
- Enable loose coupling and testability

**Bad Example**:
```typescript
// ❌ VIOLATION: Direct dependency on concrete class
class UserService {
  private userRepository: UserRepository; // Direct dependency
  
  constructor() {
    // Tightly coupled, hard to test
    this.userRepository = new UserRepository();
  }
  
  public registerUser(name: string): User {
    return this.userRepository.save(new User(name));
  }
}

// Cannot test without actual database ❌
const service = new UserService();
```

**Good Example**:
```typescript
// ✅ SOLUTION: Depend on interface
interface IRepository<T> {
  save(item: T): void;
  findById(id: UUID): T | null;
}

class UserService {
  constructor(private userRepository: IRepository<User>) {}
  
  public registerUser(name: string): User {
    const user = new User(name);
    this.userRepository.save(user);
    return user;
  }
}

// Easy to test with mock
class MockUserRepository implements IRepository<User> {
  public save(user: User): void { /* mock */ }
  public findById(id: UUID): User | null { return null; }
}

// In tests:
const mockRepo = new MockUserRepository();
const service = new UserService(mockRepo);
service.registerUser("John"); // ✅ No database needed
```

**Checklist**:
- ✅ Dependencies injected via constructor
- ✅ Services depend on interfaces, not concrete classes
- ✅ Repository pattern properly implemented
- ✅ Mock implementations easily created for testing

---

## Design Patterns

### 🔴 MANDATORY: Explicit Design Pattern Implementation

**Requirement**: For any eligible design pattern identified in a system, you MUST create explicit, dedicated classes and/or interfaces rather than relying on implicit implementations.

**Rationale**:
- **Clarity**: Explicit implementations make design patterns immediately obvious to readers
- **Maintainability**: Named pattern classes document intent
- **Extensibility**: Clear contracts make it easier to add new implementations
- **Collaboration**: Team members can easily understand and modify pattern implementations
- **Testing**: Explicit classes are easier to mock and unit test

**Implementation Rules**:

1. **If you identify a pattern is needed** → Create dedicated interface/class for it
2. **When using Strategy Pattern** → Create explicit `*Strategy` interfaces and concrete implementations
3. **When using Factory Pattern** → Create dedicated `*Factory` classes with static creation methods
4. **When using Builder Pattern** → Create explicit `*Builder` classes
5. **When using Repository Pattern** → Create explicit `*Repository` classes implementing `IRepository<T>`
6. **Folder Structure**: Organize patterns in dedicated folders:
   ```
   src/
   ├── patterns/
   │   ├── strategies/        # Strategy pattern implementations
   │   │   ├── XyzStrategy.ts (interface)
   │   │   ├── ConcreteStrategyA.ts
   │   │   └── ConcreteStrategyB.ts
   │   ├── factories/         # Factory pattern implementations
   │   │   ├── XyzFactory.ts
   │   │   └── index.ts
   │   └── index.ts
   ```

**Example: LinkedIn System**
```typescript
// ✅ Good: Explicit Strategy Pattern
// patterns/strategies/PostStrategy.ts
export interface PostStrategy {
  validatePost(content: string): boolean;
  getDefaultVisibility(): string;
}

// patterns/strategies/ArticlePostStrategy.ts
export class ArticlePostStrategy implements PostStrategy {
  validatePost(content: string): boolean {
    return content.trim().length >= 100;
  }
  getDefaultVisibility(): string {
    return "PUBLIC";
  }
}

// ✅ Good: Explicit Factory Pattern
// patterns/factories/PostFactory.ts
export class PostFactory {
  static createPost(userId: UUID, content: string, strategy: PostStrategy): Post {
    if (!strategy.validatePost(content)) throw new Error("Invalid");
    return new Post(userId, content, strategy.getDefaultVisibility());
  }
}
```

**Anti-Pattern (❌ Don't Do This)**:
```typescript
// ❌ Bad: Implicit pattern hidden in service
class PostService {
  createPost(userId: UUID, content: string, postType: string): Post {
    // Strategy pattern logic hidden here
    if (postType === 'ARTICLE') {
      if (content.length < 100) throw new Error("...");
      return new Post(userId, content, 'PUBLIC');
    } else if (postType === 'ACHIEVEMENT') {
      // More scattered logic...
    }
  }
}
```

**Checklist**:
- ✅ Identified patterns have dedicated files/classes
- ✅ Pattern interfaces/classes are clearly named
- ✅ Each pattern has a `patterns/` folder
- ✅ Pattern implementations are testable in isolation
- ✅ Public API exports patterns for reusability
- ✅ Documentation explains when/how to use each pattern

---

### Creational Patterns

#### 1. Factory Pattern

**Use Case**: Create objects without specifying exact classes

**Application in LLD**:
```typescript
// TransactionFactory.ts
class TransactionFactory {
  static createTransaction(
    type: TransactionType,
    from: User,
    to: User | Merchant,
    amount: number
  ): Transaction {
    const transaction = new Transaction(
      UUID.generate(),
      from.userId,
      type,
      amount
    );
    
    if (type === TransactionType.SEND) {
      transaction.setReceiver(to as User);
    } else if (type === TransactionType.PAYMENT) {
      transaction.setMerchant(to as Merchant);
    }
    
    return transaction;
  }
}

// Usage
const txn = TransactionFactory.createTransaction(
  TransactionType.SEND,
  sender,
  receiver,
  1000
);
```

#### 2. Singleton Pattern

**Use Case**: Ensure only one instance of a class exists

**Application in LLD**:
```typescript
class TransactionIdGenerator {
  private static instance: TransactionIdGenerator;
  private counter: number = 0;
  
  private constructor() {}
  
  public static getInstance(): TransactionIdGenerator {
    if (!this.instance) {
      this.instance = new TransactionIdGenerator();
    }
    return this.instance;
  }
  
  public generateId(): string {
    return `TXN-${Date.now()}-${++this.counter}`;
  }
}

// Usage
const generator1 = TransactionIdGenerator.getInstance();
const generator2 = TransactionIdGenerator.getInstance();
console.log(generator1 === generator2); // true ✅
```

#### 3. Builder Pattern

**Use Case**: Construct complex objects step-by-step

**Application in LLD**:
```typescript
class UserBuilder {
  private name: string = '';
  private email: string = '';
  private phone: string = '';
  private isVerified: boolean = false;
  
  public withName(name: string): UserBuilder {
    this.name = name;
    return this;
  }
  
  public withEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }
  
  public withPhone(phone: string): UserBuilder {
    this.phone = phone;
    return this;
  }
  
  public verified(verified: boolean): UserBuilder {
    this.isVerified = verified;
    return this;
  }
  
  public build(): User {
    if (!this.name || !this.email) {
      throw new Error('Name and Email are required');
    }
    return new User(this.name, this.email, this.phone, this.isVerified);
  }
}

// Usage
const user = new UserBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .withPhone('9876543210')
  .verified(true)
  .build();
```

---

### Structural Patterns

#### 1. Repository Pattern

**Use Case**: Abstract data access logic, enable easy switching between implementations

**Implementation**:
```typescript
// IRepository.ts - Interface
interface IRepository<T> {
  save(item: T): void;
  findById(id: UUID): T | null;
  findAll(): T[];
  update(item: T): void;
  delete(id: UUID): void;
}

// UserRepository.ts - Implementation
class UserRepository implements IRepository<User> {
  private users: Map<UUID, User> = new Map();
  
  public save(user: User): void {
    this.users.set(user.userId, user);
  }
  
  public findById(id: UUID): User | null {
    return this.users.get(id) || null;
  }
  
  public findAll(): User[] {
    return Array.from(this.users.values());
  }
  
  public update(user: User): void {
    if (this.users.has(user.userId)) {
      this.users.set(user.userId, user);
    }
  }
  
  public delete(id: UUID): void {
    this.users.delete(id);
  }
  
  // Specialized queries
  public findByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }
  
  public findByPhone(phone: string): User | null {
    return Array.from(this.users.values()).find(u => u.phone === phone) || null;
  }
}
```

#### 2. Decorator Pattern

**Use Case**: Dynamically add functionality to objects

**Application in LLD**:
```typescript
interface Transaction {
  getAmount(): number;
  getDescription(): string;
}

class BaseTransaction implements Transaction {
  constructor(private amount: number) {}
  
  public getAmount(): number { return this.amount; }
  public getDescription(): string { return 'Basic Transaction'; }
}

class CommissionDecorator implements Transaction {
  constructor(
    private transaction: Transaction,
    private commissionRate: number
  ) {}
  
  public getAmount(): number {
    const commission = this.transaction.getAmount() * (this.commissionRate / 100);
    return this.transaction.getAmount() + commission;
  }
  
  public getDescription(): string {
    return this.transaction.getDescription() + ' [Commission Applied]';
  }
}

// Usage
let txn: Transaction = new BaseTransaction(1000);
txn = new CommissionDecorator(txn, 2.5); // 2.5% commission
console.log(txn.getAmount()); // 1025
```

---

### Behavioral Patterns

#### 1. Strategy Pattern

**Use Case**: Encapsulate algorithms that can vary independently

**Application in LLD**:
```typescript
interface PaymentStrategy {
  validate(user: User, amount: number): boolean;
  process(transaction: Transaction): boolean;
  rollback(transaction: Transaction): void;
}

class UPIPaymentStrategy implements PaymentStrategy {
  public validate(user: User, amount: number): boolean {
    return user.wallet.getBalance() >= amount && user.isVerified;
  }
  
  public process(transaction: Transaction): boolean {
    // UPI-specific processing
    return true;
  }
  
  public rollback(transaction: Transaction): void {
    // UPI-specific rollback
  }
}

class MerchantPaymentStrategy implements PaymentStrategy {
  public validate(user: User, amount: number): boolean {
    return user.wallet.getBalance() >= amount;
  }
  
  public process(transaction: Transaction): boolean {
    // Merchant-specific processing
    return true;
  }
  
  public rollback(transaction: Transaction): void {
    // Merchant-specific rollback
  }
}

class TransactionProcessor {
  constructor(private strategy: PaymentStrategy) {}
  
  public executeTransaction(transaction: Transaction): boolean {
    const user = transaction.getFromUser();
    const amount = transaction.getAmount();
    
    if (!this.strategy.validate(user, amount)) {
      throw new Error('Validation failed');
    }
    
    try {
      return this.strategy.process(transaction);
    } catch (error) {
      this.strategy.rollback(transaction);
      throw error;
    }
  }
}
```

#### 2. Observer Pattern

**Use Case**: Notify multiple objects about state changes

**Application in LLD**:
```typescript
interface TransactionObserver {
  onTransactionCompleted(transaction: Transaction): void;
  onTransactionFailed(transaction: Transaction, reason: string): void;
}

class TransactionNotificationService implements TransactionObserver {
  public onTransactionCompleted(transaction: Transaction): void {
    // Send notification
    console.log(`Transaction ${transaction.id} completed`);
  }
  
  public onTransactionFailed(transaction: Transaction, reason: string): void {
    console.log(`Transaction ${transaction.id} failed: ${reason}`);
  }
}

class TransactionAuditService implements TransactionObserver {
  public onTransactionCompleted(transaction: Transaction): void {
    // Log to audit trail
    console.log(`Audit: ${transaction.id} completed by ${transaction.fromUserId}`);
  }
  
  public onTransactionFailed(transaction: Transaction, reason: string): void {
    console.log(`Audit: ${transaction.id} failed - ${reason}`);
  }
}

class Transaction {
  private observers: TransactionObserver[] = [];
  
  public attach(observer: TransactionObserver): void {
    this.observers.push(observer);
  }
  
  public detach(observer: TransactionObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) this.observers.splice(index, 1);
  }
  
  public markCompleted(): void {
    this.observers.forEach(o => o.onTransactionCompleted(this));
  }
  
  public markFailed(reason: string): void {
    this.observers.forEach(o => o.onTransactionFailed(this, reason));
  }
}

// Usage
const txn = new Transaction();
txn.attach(new TransactionNotificationService());
txn.attach(new TransactionAuditService());
txn.markCompleted(); // Notifies all observers ✅
```

#### 3. State Pattern

**Use Case**: Encapsulate state-dependent behavior

**Application in LLD**:
```typescript
interface TransactionState {
  validate(transaction: Transaction): boolean;
  execute(transaction: Transaction): void;
  complete(transaction: Transaction): void;
  reverse(transaction: Transaction): void;
}

class PendingTransactionState implements TransactionState {
  public validate(transaction: Transaction): boolean {
    return true;
  }
  
  public execute(transaction: Transaction): void {
    console.log('Executing transaction...');
    transaction.setState(new CompletedTransactionState());
  }
  
  public complete(): void {
    throw new Error('Already pending');
  }
  
  public reverse(transaction: Transaction): void {
    transaction.setState(new ReversedTransactionState());
  }
}

class CompletedTransactionState implements TransactionState {
  public validate(transaction: Transaction): boolean {
    return false;
  }
  
  public execute(transaction: Transaction): void {
    throw new Error('Cannot execute completed transaction');
  }
  
  public complete(): void {
    throw new Error('Already completed');
  }
  
  public reverse(transaction: Transaction): void {
    if (transaction.canBeReversed()) {
      transaction.setState(new ReversedTransactionState());
    }
  }
}

class Transaction {
  private state: TransactionState = new PendingTransactionState();
  
  public setState(state: TransactionState): void {
    this.state = state;
  }
  
  public execute(): void {
    this.state.execute(this);
  }
  
  public reverse(): void {
    this.state.reverse(this);
  }
}
```

---

## Project Structure

### Standard Folder Organization

```
project-name/
├── src/
│   ├── enums/                        # All enumeration types
│   │   ├── TransactionType.ts
│   │   ├── TransactionStatus.ts
│   │   ├── PaymentMethod.ts
│   │   └── index.ts                  # Barrel export
│   │
│   ├── models/                       # Domain entities (entities only)
│   │   ├── User.ts
│   │   ├── Wallet.ts
│   │   ├── Transaction.ts
│   │   └── index.ts                  # Barrel export
│   │
│   ├── repositories/                 # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── WalletRepository.ts
│   │   ├── TransactionRepository.ts
│   │   └── index.ts                  # Barrel export
│   │
│   ├── services/                     # Business logic services
│   │   ├── UserService.ts
│   │   ├── WalletService.ts
│   │   ├── TransactionService.ts
│   │   └── index.ts                  # Barrel export
│   │
│   ├── utils/                        # Utilities and helpers
│   │   ├── Validators.ts             # Validation functions
│   │   ├── Errors.ts                 # Custom error classes
│   │   ├── IRepository.ts            # Repository interface
│   │   ├── Helpers.ts                # Helper utilities
│   │   └── index.ts                  # Barrel export
│   │
│   ├── console/                      # Console/Driver code
│   │   └── ConsoleInterface.ts       # Demo/example usage
│   │
│   ├── MainService.ts                # Main facade/orchestrator
│   ├── index.ts                      # Public API exports
│   └── tests.ts                      # Unit tests
│
├── dist/                             # Compiled JavaScript
├── schema.md                         # Database schema
├── class-diagram.md                  # Class relationships diagram
├── readme.md                         # Project README
├── package.json
├── tsconfig.json
└── .gitignore
```

**Rules**:
- ✅ Each layer (enums, models, repositories, services, utils) in separate folder
- ✅ Each class in its own file (except index.ts barrel exports)
- ✅ console/ folder for example/driver code
- ✅ Main service as facade at src/ root
- ✅ index.ts for public API exports

---

## Code Organization

### Imports Organization

**Order of imports** (top to bottom):
1. External dependencies (third-party libraries)
2. Enums from project
3. Models/Entities from project
4. Repositories from project
5. Services from project
6. Utilities from project

```typescript
// ✅ CORRECT
import { UUID } from 'uuid';        // External
import { TransactionType } from '../enums';
import { User, Transaction } from '../models';
import { UserRepository } from '../repositories';
import { WalletService } from '../services';
import { validateAmount, ValidationError } from '../utils';

// ❌ WRONG: Mixed order
import { WalletService } from '../services';
import { UUID } from 'uuid';
import { User } from '../models';
```

### Barrel Exports (index.ts)

Each folder should have an index.ts file for clean imports:

```typescript
// enums/index.ts
export { TransactionType } from './TransactionType';
export { TransactionStatus } from './TransactionStatus';
export { PaymentMethod } from './PaymentMethod';

// In services, use:
import { TransactionType, TransactionStatus } from '../enums';
// Instead of:
import { TransactionType } from '../enums/TransactionType';
```

### Circular Dependency Prevention

**Rule**: Repositories should NOT use Services

```typescript
// ❌ WRONG: Circular dependency risk
class UserRepository {
  constructor(private userService: UserService) {} // Avoid
}

// ✅ CORRECT: Repositories are lowest level
class UserRepository {
  // Only depends on models and interfaces
}

// ✅ Services can use Repositories
class UserService {
  constructor(private userRepository: UserRepository) {}
}

// ✅ Controller/Facade uses Services
class MainService {
  constructor(private userService: UserService) {}
}
```

---

## Naming Conventions

### Class Names

```typescript
// ✅ Entities - Singular noun
class User { }
class Transaction { }
class Wallet { }

// ✅ Repositories - Singular entity + Repository
class UserRepository { }
class TransactionRepository { }
class WalletRepository { }

// ✅ Services - Singular entity + Service
class UserService { }
class TransactionService { }
class WalletService { }

// ✅ Interfaces - I prefix or -able suffix
interface IRepository<T> { }
interface Payable { }
interface Reversible { }

// ✅ Enums - Singular, descriptive
enum TransactionType { }
enum TransactionStatus { }
enum PaymentMethod { }

// ✅ Utilities - Descriptive, often plural
class Validators { }
class Errors { }
class Helpers { }

// ✅ Custom Errors - Error suffix
class ValidationError extends Error { }
class InsufficientBalanceError extends Error { }
class TransactionError extends Error { }
```

### Method Names

```typescript
// ✅ Getters - get prefix
public getBalance(): number { }
public getUser(id: UUID): User { }
public getTransactionHistory(): Transaction[] { }

// ✅ Setters - set prefix
public setBalance(amount: number): void { }
public setStatus(status: TransactionStatus): void { }

// ✅ Checkers - is/can/has prefix
public isVerified(): boolean { }
public canTransaction(amount: number): boolean { }
public hasAccount(): boolean { }

// ✅ Actions - verb + noun
public sendMoney(to: User, amount: number): void { }
public processTransaction(txn: Transaction): void { }
public reverseTransaction(txnId: UUID): void { }

// ✅ Creators - create prefix
public createTransaction(...args): Transaction { }
public createUser(...args): User { }

// ✅ Finders - find prefix
public findById(id: UUID): Entity | null { }
public findAll(): Entity[] { }
public findByEmail(email: string): User | null { }
```

### Variable Names

```typescript
// ✅ Use descriptive names
const transactionAmount: number = 1000;
const isUserVerified: boolean = true;
const walletBalance: Decimal = new Decimal(5000);

// ❌ Avoid single letters (except loop counters)
const a: number = 1000;           // ❌
const x: boolean = true;          // ❌
for (let i = 0; i < 10; i++) {}   // ✅ OK for loops
```

---

## Class Design

### Entity/Model Classes

**Responsibilities**:
- Hold domain data
- Implement domain logic (business rules)
- Provide getters/setters for properties
- NO database access
- NO external calls
- NO business orchestration

```typescript
// ✅ CORRECT: Pure domain logic
class User {
  private userId: UUID;
  private name: string;
  private email: string;
  private isVerified: boolean;
  
  constructor(name: string, email: string) {
    this.userId = UUID.generate();
    this.name = name;
    this.email = email;
    this.isVerified = false;
  }
  
  // Domain logic
  public updateProfile(newName: string, newEmail: string): void {
    if (newName.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }
    this.name = newName;
    this.email = newEmail;
  }
  
  public verify(): void {
    this.isVerified = true;
  }
  
  // Getters
  public getId(): UUID { return this.userId; }
  public getName(): string { return this.name; }
  public getEmail(): string { return this.email; }
  public isKYCVerified(): boolean { return this.isVerified; }
}
```

### Repository Classes

**Responsibilities**:
- CRUD operations
- Data retrieval queries
- Database abstraction
- NO business logic
- NO orchestration

```typescript
// ✅ CORRECT: Pure data access
class UserRepository implements IRepository<User> {
  private users: Map<UUID, User> = new Map();
  
  public save(user: User): void {
    this.users.set(user.getId(), user);
  }
  
  public findById(id: UUID): User | null {
    return this.users.get(id) || null;
  }
  
  public findAll(): User[] {
    return Array.from(this.users.values());
  }
  
  public update(user: User): void {
    if (this.users.has(user.getId())) {
      this.users.set(user.getId(), user);
    }
  }
  
  public delete(id: UUID): void {
    this.users.delete(id);
  }
  
  // Specialized queries
  public findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.getEmail() === email) return user;
    }
    return null;
  }
}
```

### Service Classes

**Responsibilities**:
- Business logic orchestration
- Coordinate repositories
- Implement use cases
- Handle transactions
- NO database access (through repos only)
- NO presentation logic

```typescript
// ✅ CORRECT: Business logic orchestration
class UserService {
  constructor(
    private userRepository: IRepository<User>,
    private walletRepository: IRepository<Wallet>
  ) {}
  
  public registerUser(name: string, email: string, phone: string): User {
    // Validate inputs
    if (!name || !email) {
      throw new ValidationError('Name and Email required');
    }
    
    // Check if user exists
    const existing = this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Create user
    const user = new User(name, email, phone);
    this.userRepository.save(user);
    
    // Create wallet
    const wallet = new Wallet(user.getId());
    this.walletRepository.save(wallet);
    
    return user;
  }
  
  public verifyUser(userId: UUID): void {
    const user = this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.verify();
    this.userRepository.update(user);
  }
}
```

### Access Modifiers

```typescript
class Example {
  // ✅ Properties should be private
  private internalState: string;
  private cache: Map<string, any>;
  
  // ✅ Getters/setters are public
  public getValue(): string {
    return this.internalState;
  }
  
  public setValue(value: string): void {
    this.internalState = value;
  }
  
  // ✅ Public methods are the API
  public performAction(): void {
    this.doInternalWork();
  }
  
  // ✅ Private methods for internal logic
  private doInternalWork(): void {
    // internal logic
  }
  
  // ✅ Protected for inheritance
  protected validateInput(input: string): boolean {
    return input.trim().length > 0;
  }
}
```

---

## Repository Pattern

### Generic Repository Interface

```typescript
// IRepository.ts
interface IRepository<T> {
  save(item: T): void;          // Create or Update
  findById(id: UUID): T | null; // Read by ID
  findAll(): T[];               // Read all
  update(item: T): void;        // Update
  delete(id: UUID): void;       // Delete
}
```

### Specialized Queries

```typescript
class UserRepository implements IRepository<User> {
  // ... standard CRUD methods ...
  
  // Specialized query methods
  public findByEmail(email: string): User | null {
    // Implementation
  }
  
  public findByPhone(phone: string): User | null {
    // Implementation
  }
  
  public findByUPI(upiId: string): User | null {
    // Implementation
  }
  
  public findVerifiedUsers(): User[] {
    // Implementation
  }
  
  public findByStatus(status: string): User[] {
    // Implementation
  }
}
```

### Repository Implementation

```typescript
// In-memory implementation (for development)
class UserRepository implements IRepository<User> {
  private users: Map<UUID, User> = new Map();
  
  public save(user: User): void {
    this.users.set(user.getId(), user);
  }
  
  public findById(id: UUID): User | null {
    return this.users.get(id) || null;
  }
  
  public findAll(): User[] {
    return Array.from(this.users.values());
  }
  
  public update(user: User): void {
    if (!this.users.has(user.getId())) {
      throw new Error('User not found');
    }
    this.users.set(user.getId(), user);
  }
  
  public delete(id: UUID): void {
    this.users.delete(id);
  }
}

// Can later be replaced with database implementation
class UserRepositoryDB implements IRepository<User> {
  constructor(private database: Database) {}
  
  public save(user: User): void {
    this.database.insert('users', user);
  }
  
  public findById(id: UUID): User | null {
    return this.database.query('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  // ... other methods ...
}
```

---

## Service Layer Pattern

### Service Structure

```typescript
class TransactionService {
  constructor(
    private transactionRepository: IRepository<Transaction>,
    private walletRepository: IRepository<Wallet>,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {}
  
  // Public API
  public sendMoney(
    fromUserId: UUID,
    toUserId: UUID,
    amount: number
  ): Transaction {
    return this.executeTransaction(fromUserId, toUserId, amount);
  }
  
  public getTransactionHistory(userId: UUID): Transaction[] {
    return this.transactionRepository.findByUserId(userId);
  }
  
  // Private implementation
  private executeTransaction(
    fromUserId: UUID,
    toUserId: UUID,
    amount: number
  ): Transaction {
    // Validate
    this.validateTransaction(fromUserId, toUserId, amount);
    
    // Create transaction
    const transaction = new Transaction(fromUserId, toUserId, amount);
    
    // Update wallets
    this.walletService.deductBalance(fromUserId, amount);
    this.walletService.addBalance(toUserId, amount);
    
    // Save transaction
    this.transactionRepository.save(transaction);
    
    // Notify
    this.notificationService.notifyTransaction(transaction);
    
    return transaction;
  }
  
  private validateTransaction(
    fromUserId: UUID,
    toUserId: UUID,
    amount: number
  ): void {
    if (fromUserId === toUserId) {
      throw new ValidationError('Cannot send to yourself');
    }
    
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    
    if (amount > 100000) {
      throw new ValidationError('Amount exceeds limit');
    }
  }
}
```

### Service Composition

```typescript
class MainService {
  private userService: UserService;
  private walletService: WalletService;
  private transactionService: TransactionService;
  private merchantService: MerchantService;
  
  constructor(
    userRepository: IRepository<User>,
    walletRepository: IRepository<Wallet>,
    transactionRepository: IRepository<Transaction>,
    merchantRepository: IRepository<Merchant>
  ) {
    this.userService = new UserService(userRepository);
    this.walletService = new WalletService(walletRepository);
    this.transactionService = new TransactionService(
      transactionRepository,
      walletRepository,
      this.walletService
    );
    this.merchantService = new MerchantService(merchantRepository);
  }
  
  // Public facade methods
  public registerUser(name: string, email: string): User {
    return this.userService.registerUser(name, email);
  }
  
  public sendMoney(from: UUID, to: UUID, amount: number): Transaction {
    return this.transactionService.sendMoney(from, to, amount);
  }
  
  public generateMerchantQR(merchantId: UUID): string {
    return this.merchantService.generateQRCode(merchantId);
  }
}
```

---

## Error Handling

### Custom Error Classes

```typescript
// errors/Errors.ts
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

class TransactionError extends Error {
  constructor(message: string, public readonly transactionId: UUID) {
    super(message);
    this.name = 'TransactionError';
  }
}

class NotFoundError extends Error {
  constructor(entity: string, id: UUID) {
    super(`${entity} not found with ID: ${id}`);
    this.name = 'NotFoundError';
  }
}
```

### Error Handling in Services

```typescript
class UserService {
  public registerUser(name: string, email: string): User {
    try {
      // Validate inputs
      if (!name || !email) {
        throw new ValidationError('Name and Email are required');
      }
      
      // Check existence
      const existing = this.userRepository.findByEmail(email);
      if (existing) {
        throw new ValidationError('User already exists');
      }
      
      // Create and save
      const user = new User(name, email);
      this.userRepository.save(user);
      
      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        // Handle validation error
        throw error;
      }
      // Handle unexpected errors
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }
}
```

---

## Dependency Injection

### Constructor Injection Pattern

```typescript
// ✅ CORRECT: Services depend on interfaces
class TransactionService {
  constructor(
    private transactionRepository: IRepository<Transaction>,
    private walletRepository: IRepository<Wallet>,
    private notificationService: NotificationService
  ) {
    // All dependencies injected
  }
}

// Initialize with implementations
const transactionRepository = new TransactionRepository();
const walletRepository = new WalletRepository();
const notificationService = new NotificationService();

const transactionService = new TransactionService(
  transactionRepository,
  walletRepository,
  notificationService
);
```

### Service Locator (discouraged)

```typescript
// ❌ AVOID: Service locator pattern
class ServiceLocator {
  private static services: Map<string, any> = new Map();
  
  public static register(name: string, service: any): void {
    this.services.set(name, service);
  }
  
  public static get(name: string): any {
    return this.services.get(name);
  }
}

// Problematic usage
class TransactionService {
  private walletService = ServiceLocator.get('WalletService'); // Hidden dependency ❌
}
```

---

## Testing Strategy

### Unit Testing Structure

```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: IRepository<User>;
  let mockWalletRepository: IRepository<Wallet>;
  
  beforeEach(() => {
    // Mock dependencies
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    mockWalletRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    // Inject mocks
    userService = new UserService(mockUserRepository, mockWalletRepository);
  });
  
  test('should register user successfully', () => {
    // Arrange
    const name = 'John Doe';
    const email = 'john@example.com';
    
    // Act
    const user = userService.registerUser(name, email);
    
    // Assert
    expect(user.getName()).toBe(name);
    expect(user.getEmail()).toBe(email);
    expect(mockUserRepository.save).toHaveBeenCalledWith(user);
  });
  
  test('should throw error if user already exists', () => {
    // Arrange
    const email = 'john@example.com';
    const existingUser = new User('John', email);
    (mockUserRepository.findByEmail as jest.Mock).mockReturnValue(existingUser);
    
    // Act & Assert
    expect(() => {
      userService.registerUser('Jane', email);
    }).toThrow(ValidationError);
  });
});
```

### Repository Testing

```typescript
describe('UserRepository', () => {
  let repository: UserRepository;
  let user: User;
  
  beforeEach(() => {
    repository = new UserRepository();
    user = new User('John', 'john@example.com');
  });
  
  test('should save and retrieve user', () => {
    // Save
    repository.save(user);
    
    // Retrieve
    const retrieved = repository.findById(user.getId());
    
    // Assert
    expect(retrieved).toEqual(user);
  });
  
  test('should return null for non-existent user', () => {
    const result = repository.findById(UUID.generate());
    expect(result).toBeNull();
  });
});
```

---

## Documentation Standards

### Code Comments

```typescript
// ❌ AVOID: Obvious comments
const amount = 1000; // Set amount to 1000

// ✅ GOOD: Explain WHY, not WHAT
const amount = 1000; // RBI mandates minimum ₹1000 for NEFT transfers

// ❌ AVOID: Complex logic without comment
if (balance >= amount && !isBlocked && isVerified && daysActive > 3) {
  // What is this checking?
}

// ✅ GOOD: Explain business rule
if (this.canTransaction(amount)) { // Validates all transaction pre-conditions
  processTransaction();
}

// ✅ GOOD: Document complex algorithm
/**
 * Calculate transaction fee using tiered pricing
 * 0-100K: 0.5%
 * 100K-500K: 0.3%
 * 500K+: 0.1%
 */
private calculateFee(amount: number): number {
  if (amount <= 100000) return amount * 0.005;
  if (amount <= 500000) return amount * 0.003;
  return amount * 0.001;
}
```

### Class Documentation

```typescript
/**
 * Manages user account and profile information
 * 
 * Responsibilities:
 * - User registration and profile management
 * - KYC verification tracking
 * - Bank account linking
 * 
 * @example
 * const user = new User('John', 'john@example.com');
 * user.verify();
 * const isVerified = user.isKYCVerified();
 */
class User {
  // ...
}

/**
 * Handles fund transfer between users and merchants
 * 
 * Supports:
 * - Peer-to-peer (P2P) transfers
 * - Merchant payments with commission
 * - Transaction reversal (within 24 hours)
 * 
 * @throws ValidationError if inputs are invalid
 * @throws InsufficientBalanceError if balance insufficient
 */
class TransactionService {
  // ...
}
```

### README Documentation

Include:
- Project overview
- Features list
- System architecture diagram
- Project structure
- Setup instructions
- Usage examples
- Key classes and responsibilities
- Database schema
- Deployment steps

---

## Code Review Checklist

### Design Review

- [ ] **SOLID Principles**
  - [ ] Single Responsibility: Each class has one reason to change
  - [ ] Open/Closed: Can extend without modifying existing code
  - [ ] Liskov Substitution: Derived classes are substitutable
  - [ ] Interface Segregation: Interfaces are focused
  - [ ] Dependency Inversion: Depend on abstractions, not concretions

- [ ] **Design Patterns**
  - [ ] Repository pattern properly implemented
  - [ ] Service layer separates business logic
  - [ ] No circular dependencies
  - [ ] Dependency injection used consistently

- [ ] **Architecture**
  - [ ] Proper layering (enums, models, repositories, services)
  - [ ] No business logic in models
  - [ ] No data access in services
  - [ ] Facades properly designed

### Code Quality

- [ ] **Naming**
  - [ ] Class names describe their responsibility
  - [ ] Method names are action verbs or property accessors
  - [ ] Variable names are descriptive
  - [ ] No abbreviations except standard ones (id, userId, etc.)

- [ ] **Structure**
  - [ ] Classes are focused and not too large (< 300 lines)
  - [ ] Methods are small and do one thing (< 50 lines)
  - [ ] No code duplication
  - [ ] Proper use of access modifiers (private, public, protected)

- [ ] **Error Handling**
  - [ ] Custom error classes for specific errors
  - [ ] Proper error propagation
  - [ ] No generic "throws Error"
  - [ ] Error messages are descriptive

### Testing

- [ ] Units tests exist for services and repositories
- [ ] Tests use dependency injection (mocks/stubs)
- [ ] Happy path and edge cases tested
- [ ] Error cases tested
- [ ] > 70% code coverage

### Documentation

- [ ] Classes have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] Public methods documented
- [ ] README is updated
- [ ] Architecture diagram is current

### Performance & Security

- [ ] No N+1 queries in repositories
- [ ] Efficient searching and filtering
- [ ] Input validation on all entries
- [ ] No sensitive data in logs
- [ ] Transaction handling proper

---

## Best Practices Summary

### DO's ✅

1. **Use Interfaces** - Define contracts for all major abstractions
2. **Dependency Injection** - Pass dependencies via constructor
3. **Small Classes** - Keep classes focused on single responsibility
4. **Small Methods** - Keep methods under 50 lines
5. **Meaningful Names** - Use clear, descriptive names
6. **Private by Default** - Start with private, expose only what needed
7. **Composition** - Prefer composition over inheritance
8. **Immutability** - Make objects immutable where possible
9. **Validations** - Validate inputs at boundaries
10. **Error Handling** - Use custom error types

### DON'Ts ❌

1. **God Classes** - Classes with too many responsibilities
2. **God Methods** - Methods doing multiple things
3. **Direct Instantiation** - Don't new up dependencies
4. **Circular Dependencies** - Avoid A→B→A patterns
5. **Mixing Concerns** - Don't mix data access with business logic
6. **Magic Numbers** - Use named constants
7. **Generic Error Types** - Don't throw generic Error
8. **Null Checks Everywhere** - Use Option/Maybe pattern or null objects
9. **Public Properties** - Use getters/setters
10. **Large Parameters** - Use objects instead of many parameters

---

## Continuous Improvement

This guideline document should be:
- **Reviewed quarterly** for relevance and updates
- **Updated** as new patterns are discovered
- **Referenced** in code reviews
- **Used** for onboarding new team members
- **Extended** with project-specific guidelines

---

## Quick Reference

| Aspect | Rule |
|--------|------|
| **Folder Structure** | enums → models → repositories → services → utils |
| **File Location** | One class per file (except interfaces/enums variants) |
| **Class Names** | PascalCase, descriptive (UserRepository, TransactionService) |
| **Method Names** | camelCase, verb or accessor (sendMoney, getBalance) |
| **Properties** | private, accessed via public getters/setters |
| **Dependencies** | Injected via constructor, depend on interfaces |
| **Error Handling** | Custom error classes, not generic Error |
| **Comments** | Explain WHY, not WHAT; use JSDoc for public APIs |
| **Testing** | Unit tests for all public methods, use dependency injection |
| **Imports** | External → Enums → Models → Repositories → Services → Utils |

---

