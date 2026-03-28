# Splitwise System - Class Diagram & Architecture

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│              Console Interface (User Interaction)            │
├──────────────────────────────────────────────────────────────┤
│                  Service Layer (Business Logic)              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ UserService  GroupService  ExpenseService              │  │
│  │ SettlementService  PaymentService  CommentService      │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│             Repository Layer (Data Abstraction)              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ UserRepo  GroupRepo  GroupMemberRepo  ExpenseRepo      │  │
│  │ ExpenseSplitRepo  PaymentRepo  CommentRepo             │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│      InMemoryDatabase (Singleton - Central Coordinator)      │
├──────────────────────────────────────────────────────────────┤
│              Data Layer (Entity Models)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Model Classes

### **User**
```
┌──────────────────────────────┐
│          User                │
├──────────────────────────────┤
│ - userId: UUID               │
│ - name: string               │
│ - email: string              │
│ - phone: string              │
│ - profileImage: string       │
│ - createdAt: Date            │
├──────────────────────────────┤
│ + getBalance(): number       │
│ + getProfile(): object       │
└──────────────────────────────┘
```

### **Group**
```
┌──────────────────────────────┐
│         Group                │
├──────────────────────────────┤
│ - groupId: UUID              │
│ - groupName: string          │
│ - description: string        │
│ - createdBy: UUID            │
│ - createdAt: Date            │
│ - isActive: boolean          │
├──────────────────────────────┤
│ + getGroupDetails(): object  │
│ + getMemberCount(): number   │
│ + getGroupBalance(): number  │
└──────────────────────────────┘
```

### **GroupMember**
```
┌──────────────────────────────┐
│      GroupMember             │
├──────────────────────────────┤
│ - groupMemberId: UUID        │
│ - groupId: UUID              │
│ - userId: UUID               │
│ - role: UserRole             │
│ - joinedAt: Date             │
│ - isActive: boolean          │
├──────────────────────────────┤
│ + isAdmin(): boolean         │
│ + getRole(): string          │
└──────────────────────────────┘
```

### **Expense**
```
┌──────────────────────────────┐
│       Expense                │
├──────────────────────────────┤
│ - expenseId: UUID            │
│ - groupId: UUID              │
│ - paidBy: UUID               │
│ - amount: Decimal            │
│ - description: string        │
│ - splitType: SplitType       │
│ - category: string           │
│ - createdAt: Date            │
│ - isSettled: boolean         │
├──────────────────────────────┤
│ + updateDescription(): void  │
│ + settle(): void             │
│ + getTotalAmount(): number   │
└──────────────────────────────┘
```

### **ExpenseSplit**
```
┌──────────────────────────────┐
│      ExpenseSplit            │
├──────────────────────────────┤
│ - splitId: UUID              │
│ - expenseId: UUID            │
│ - userId: UUID               │
│ - amount: Decimal            │
│ - percentage: Decimal        │
│ - customAmount: Decimal      │
├──────────────────────────────┤
│ + getAmount(): Decimal       │
│ + validate(): boolean        │
└──────────────────────────────┘
```

### **Payment**
```
┌──────────────────────────────┐
│       Payment                │
├──────────────────────────────┤
│ - paymentId: UUID            │
│ - fromUserId: UUID           │
│ - toUserId: UUID             │
│ - amount: Decimal            │
│ - status: PaymentStatus      │
│ - method: string             │
│ - createdAt: Date            │
│ - completedAt: Date          │
├──────────────────────────────┤
│ + complete(): void           │
│ + isSettled(): boolean       │
└──────────────────────────────┘
```

### **Comment**
```
┌──────────────────────────────┐
│       Comment                │
├──────────────────────────────┤
│ - commentId: UUID            │
│ - expenseId: UUID            │
│ - userId: UUID               │
│ - text: string               │
│ - createdAt: Date            │
├──────────────────────────────┤
│ + getCommentDetails(): obj   │
└──────────────────────────────┘
```

### **TransactionHistory**
```
┌──────────────────────────────┐
│    TransactionHistory        │
├──────────────────────────────┤
│ - transactionId: UUID        │
│ - fromUserId: UUID           │
│ - toUserId: UUID             │
│ - amount: Decimal            │
│ - type: TransactionType      │
│ - expenseId: UUID            │
│ - paymentId: UUID            │
│ - createdAt: Date            │
├──────────────────────────────┤
│ + getTransactionDetails()    │
└──────────────────────────────┘
```

---

## Repository Classes

```
UserRepository
├── save(user): User
├── findById(userId): User
├── findByEmail(email): User
├── getAllUsers(): User[]

GroupRepository
├── save(group): Group
├── findById(groupId): Group
├── findByCreator(userId): Group[]
├── getAllGroups(): Group[]
├── update(group): Group
├── delete(groupId): void

GroupMemberRepository
├── save(member): GroupMember
├── findById(memberId): GroupMember
├── findByGroupAndUser(groupId, userId): GroupMember
├── getGroupMembers(groupId): GroupMember[]
├── getUserGroups(userId): GroupMember[]
├── delete(memberId): void

ExpenseRepository
├── save(expense): Expense
├── findById(expenseId): Expense
├── getGroupExpenses(groupId): Expense[]
├── getUserExpenses(userId): Expense[]
├── update(expense): Expense
├── getExpensesByStatus(status): Expense[]

ExpenseSplitRepository
├── save(split): ExpenseSplit
├── findById(splitId): ExpenseSplit
├── getExpenseSplits(expenseId): ExpenseSplit[]
├── getUserSplits(userId): ExpenseSplit[]
├── delete(splitId): void

PaymentRepository
├── save(payment): Payment
├── findById(paymentId): Payment
├── getPaymentsBetween(fromUserId, toUserId): Payment[]
├── getOutstandingPayments(userId): Payment[]
├── update(payment): Payment

CommentRepository
├── save(comment): Comment
├── findById(commentId): Comment
├── getExpenseComments(expenseId): Comment[]
├── delete(commentId): void

TransactionHistoryRepository
├── save(transaction): TransactionHistory
├── findById(transactionId): TransactionHistory
├── getUserTransactions(userId): TransactionHistory[]
├── getGroupTransactions(groupId): TransactionHistory[]
```

---

## Service Classes

### **UserService**
```
+ register(name, email, phone): User
+ getUserProfile(userId): User
+ updateProfile(userId, name, phone): User
+ getAllUsers(): User[]
+ getUserBalance(userId): Decimal
+ authenticate(email): User
```

**Responsibilities:**
- User account management and profile updates
- User authentication and validation
- Balance calculation for users

---

### **GroupService**
```
+ createGroup(name, description, creatorId): Group
+ addMemberToGroup(groupId, userId, role): GroupMember
+ removeMemberFromGroup(groupId, userId): void
+ getGroupMembers(groupId): GroupMember[]
+ getGroupDetails(groupId): Group
+ updateGroupInfo(groupId, name, description): Group
+ getGroupBalance(groupId): Map<String, Decimal>
+ getUsersInGroup(groupId): User[]
```

**Responsibilities:**
- Group creation and management
- Member addition/removal with role assignment
- Group balance calculations showing who owes whom

---

### **ExpenseService**
```
+ recordExpense(groupId, paidBy, amount, desc, splitType): Expense
+ getExpenseDetails(expenseId): Expense
+ updateExpense(expenseId, desc, amount): Expense
+ getGroupExpenses(groupId): Expense[]
+ getUserExpenses(userId): Expense[]
+ getExpensesForSettlement(userId, withUserId): Expense[]
+ calculateSplits(expense, splitType, participants): ExpenseSplit[]
```

**Responsibilities:**
- Recording expenses with flexible split methods
- Calculating how each participant shares the expense
- Retrieving expense history and details

---

### **SettlementService**
```
+ calculateBalances(groupId): Map<String, Decimal>
+ getPaymentsBetween(user1Id, user2Id): Payment[]
+ optimizeSettlements(groupId): Payment[]
+ getUserBalances(userId): Map<String, Decimal>
+ getMinimumPayments(groupId): Payment[]
+ settleDebts(userId, withUserId): void
```

**Responsibilities:**
- Calculate who owes whom in groups
- Optimize settlement to minimize number of transactions
- Identify minimum payments required to settle all debts
- Graph-based algorithm to group debts

---

### **PaymentService**
```
+ recordPayment(fromUserId, toUserId, amount): Payment
+ completePayment(paymentId): Payment
+ refundPayment(paymentId): void
+ getPaymentHistory(userId): Payment[]
+ getOutstandingPayments(userId): Payment[]
+ settlePayment(fromUserId, toUserId, amount): Payment
```

**Responsibilities:**
- Recording payment transactions
- Updating payment status
- Processing refunds
- Tracking payment history

---

### **CommentService**
```
+ addComment(expenseId, userId, text): Comment
+ getExpenseComments(expenseId): Comment[]
+ deleteComment(commentId): void
+ getCommentDetails(commentId): Comment
```

**Responsibilities:**
- Managing comments on expenses
- Retrieving comment history
- Enabling discussion around expenses

---

### **SetupService**
```
+ initializeSystem(): void
+ createSampleUsers(): void
+ createSampleGroups(): void
+ createSampleExpenses(): void
+ createSamplePayments(): void
```

**Responsibilities:**
- Loading sample data on startup
- Creating test users, groups, expenses
- Populating system with realistic scenarios

---

## Enum Definitions

```typescript
enum UserRole {
  ADMIN = "ADMIN",        // Can invite/remove members
  MEMBER = "MEMBER"       // Regular group member
}

enum SplitType {
  EQUAL = "EQUAL",        // Amount divided equally
  PROPORTIONAL = "PROPORTIONAL",  // By proportion values
  PERCENTAGE = "PERCENTAGE",      // By percentage
  EXACT = "EXACT"         // Individual exact amounts
}

enum PaymentStatus {
  PENDING = "PENDING",    // Not yet paid
  COMPLETED = "COMPLETED" // Successfully paid
}

enum TransactionType {
  EXPENSE = "EXPENSE",    // Expense split transaction
  PAYMENT = "PAYMENT"     // Settlement payment
}

enum ExpenseCategory {
  FOOD = "FOOD",
  TRAVEL = "TRAVEL",
  ENTERTAINMENT = "ENTERTAINMENT",
  UTILITIES = "UTILITIES",
  OTHER = "OTHER"
}
```

---

## Key Interaction Flows

### **Flow 1: Record Group Expense**
```
User logs in
  ↓
Select Group
  ↓
Create Expense (amount, description, participants)
  ↓
Select Split Method (EQUAL/PROPORTIONAL/PERCENTAGE/EXACT)
  ↓
System calculates splits for each participant
  ↓
ExpenseService.recordExpense() creates Expense + ExpenseSplit records
  ↓
User balances automatically updated
  ↓
Confirmation shown to user
```

### **Flow 2: Settlement Optimization**
```
User requests "Show Balances"
  ↓
SettlementService.calculateBalances(groupId)
  ↓
Builds debt graph (who owes whom)
  ↓
Applies settlement optimization algorithm:
  - Group debts to minimize transactions
  - Identify circular debts
  - Calculate minimum payments needed
  ↓
SettlementService.optimizeSettlements() returns Payment[]
  ↓
Display minimum transactions to settle all debts
```

### **Flow 3: Payment Settlement**
```
User selects "Settle Payment"
  ↓
Choose user to settle with
  ↓
System shows outstanding balance
  ↓
Record Payment (record payment transaction)
  ↓
PaymentService.recordPayment() creates Payment record
  ↓
TransactionHistory updated
  ↓
Balance recalculated
  ↓
Payment marked as COMPLETED
```

### **Flow 4: View Transaction History**
```
User selects "View History"
  ↓
Filter options: All/Individual/Group/Period
  ↓
Service retrieves TransactionHistory records
  ↓
Display with details:
  - From/To users
  - Amount
  - Type (EXPENSE/PAYMENT)
  - Date
  - Associated group/expense
```

---

## Design Patterns Used

### **1. Singleton Pattern**
- **InMemoryDatabase**: Single instance manages all repositories
- Ensures consistent data access across application

### **2. Repository Pattern**
- 7 repository classes abstract data access
- Service layer uses repositories instead of direct data access
- Easy to swap implementations (e.g., Database → REST API)

### **3. Factory Pattern**
- Service methods create domain objects
- UserService.register() creates User with validation
- ExpenseService.recordExpense() creates Expense + ExpenseSplits

### **4. Strategy Pattern**
- Multiple split calculation strategies (EQUAL, PROPORTIONAL, PERCENTAGE, EXACT)
- Payment settlement optimization strategies
- Pluggable algorithms for different business logic

### **5. Observer Pattern**
- Expense creation triggers balance updates
- Payment completion triggers debt recalculation
- Comments creation notifies relevant parties

### **6. State Pattern**
- Payment status: PENDING → COMPLETED
- Transaction type: EXPENSE vs PAYMENT
- Expense settlement flag indicates resolved debts

### **7. Graph Algorithm Pattern**
- Settlement optimization uses graph algorithms
- Identifies minimum payments to settle all debts
- Handles circular debts intelligently

---

## Data Consistency & Validation

### **Balance Consistency**
- Balances calculated on-demand from Expense + ExpenseSplit records
- No denormalized balance column (calculated not stored)
- Always accurate reflection of current state

### **Split Validation**
- EQUAL: amount/participants calculated automatically
- PROPORTIONAL: proportions sum verified
- PERCENTAGE: percentages must equal 100%
- EXACT: individual amounts must sum to total

### **User Validation**
- Email format validated (RFC 5322)
- Phone: 10-digit numeric
- Name: non-empty string

### **Payment Validation**
- Cannot create payment more than outstanding balance
- From/To users must be different
- Amount must be positive

---

## Key Algorithmic Implementations

### **Settlement Optimization Algorithm**
```
Input: List of balances (user owes/is owed)
Output: Minimum list of payments to settle all debts

1. Create two lists: debtors (owe money) and creditors (owed money)
2. While both lists not empty:
   - Take person with max debt and max credit
   - Transfer min(debt, credit) between them
   - Remove settled persons from lists
3. Return list of payments
```

Result: Minimizes number of transactions needed

### **Balance Calculation**
```
For each user:
  1. Get all expenses where user is payer → Add to balance (they paid for others)
  2. Get all expense splits for user → Subtract from balance (they owe share)
  3. Get all payments sent by user → Add to balance (they paid debt)
  4. Get all payments received by user → Subtract from balance (collected payment)
  
Final balance = sum of above
```

---

## System Capabilities

✅ **Multi-user profile management** - Register, login, manage profiles  
✅ **Group creation & membership** - Create groups, invite members, assign roles  
✅ **Flexible expense recording** - Support 4 split types  
✅ **Automatic calculations** - System calculates all splits automatically  
✅ **Real-time balances** - Always know who owes whom  
✅ **Settlement optimization** - Minimize payments needed to settle all debts  
✅ **transaction history** - Complete audit trail of all transactions  
✅ **Comments & collaboration** - Discuss expenses with group members  
✅ **Multi-group support** - Users can be in multiple groups simultaneously  
✅ **Role-based permissions** - Admins can manage groups, members manage own expenses

