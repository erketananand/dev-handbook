# ATM System - Class Diagram

## ARCHITECTURE OVERVIEW

The system uses a **layered service architecture** with clear separation of concerns:

```
ConsoleInterface (UI)
    ↓
Services: ATMService | AccountService | CardService | TransactionService
    ↓
Repositories: CardRepository | AccountRepository | TransactionRepository | ATMRepository
    ↓
InMemoryDatabase (Singleton) — stores Maps + secondary indexes
```

---

## DESIGN PATTERNS USED

1. **Singleton**: InMemoryDatabase, CardService
2. **Repository**: Data access layer abstraction
3. **Factory**: Transaction creation (WithdrawalTransaction, DepositTransaction)
4. **Strategy**: Different validation strategies
5. **State**: Card state management (ACTIVE, BLOCKED)
6. **Observer**: Transaction notifications

---

## CORE CLASSES

### 1. Account
**Attributes:**
- id: string (UUID)
- accountNumber: string (unique)
- balance: number
- accountStatus: AccountStatus (enum)
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(accountNumber: string, balance: number, id?: string)
- debit(amount: number): boolean
- credit(amount: number): void
- getBalance(): number
- isValid(): boolean
- lock(): void
- unlock(): void

**Responsibilities:**
- Manage bank account balance and status
- Enforce debit/credit operations with validation

---

### 2. Card
**Attributes:**
- id: string (UUID)
- cardNumber: string (unique, masked)
- accountId: string
- pin: string (hashed)
- cardStatus: CardStatus (enum: ACTIVE, BLOCKED, EXPIRED)
- expiryDate: Date
- failedAttempts: number
- blockedUntil: Date | null
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(cardNumber: string, accountId: string, pin: string, expiryDate: Date, id?: string)
- validatePin(inputPin: string): boolean
- block(): void
- unblock(): void
- isValid(): boolean
- isExpired(): boolean
- isBlocked(): boolean
- incrementFailedAttempts(): void
- resetFailedAttempts(): void
- getDisplayInfo(): string

**Responsibilities:**
- Store card credentials and manage card lifecycle
- Handle PIN validation and failed attempt tracking
- Enforce card security (expiry, blocking)

---

### 3. ATM
**Attributes:**
- id: string (UUID)
- atmId: string (unique, physical identifier)
- location: string
- status: ATMStatus (enum: OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE)
- cashBalance: number
- maxCash: number
- cashInventory: Map<number, number> (denomination → quantity)
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(atmId: string, location: string, maxCash: number, id?: string)
- dispenseCash(amount: number): boolean
- depositCash(amount: number): void
- addDenomination(denomination: number, quantity: number): void
- getCashBalance(): number
- isOperational(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Manage ATM physical state and cash inventory
- Handle cash dispensing and deposits
- Track denomination-wise cash availability

---

### 4. CashDispenser
**Attributes:**
- atm: ATM

**Methods:**
- constructor(atm: ATM)
- dispenseCash(amount: number): boolean
- depositCash(amount: number): void
- canDispense(amount: number): boolean
- getCashBalance(): number

**Responsibilities:**
- Manage cash dispensing logic
- Validate cash availability before disbursement

---

### 5. Transaction (Abstract Base Class)
**Attributes:**
- id: string (UUID)
- cardId: string
- accountId: string
- amount: number
- balanceAfter: number
- status: TransactionStatus (enum: SUCCESS, FAILED, CANCELLED)
- atmId: string
- createdAt: Date

**Methods:**
- constructor(cardId: string, accountId: string, amount: number, atmId: string, id?: string)
- execute(account: Account, cashDispenser: CashDispenser): boolean (abstract)
- canExecute(account: Account, cashDispenser: CashDispenser): boolean (abstract)
- rollback(): void
- getDescription(): string (abstract)

**Responsibilities:**
- Define common transaction interface
- Track transaction state and ensure atomicity

---

### 6. WithdrawalTransaction (extends Transaction)
**Methods:**
- constructor(cardId: string, accountId: string, amount: number, atmId: string, id?: string)
- execute(account: Account, cashDispenser: CashDispenser): boolean
- canExecute(account: Account, cashDispenser: CashDispenser): boolean
- getDescription(): string

**Responsibilities:**
- Handle withdrawal operations
- Validate sufficient balance and cash availability
- Debit account and dispense cash

---

### 7. DepositTransaction (extends Transaction)
**Methods:**
- constructor(cardId: string, accountId: string, amount: number, atmId: string, id?: string)
- execute(account: Account): boolean
- canExecute(account: Account): boolean
- getDescription(): string

**Responsibilities:**
- Handle deposit operations
- Credit account with deposited amount

---

### 8. Session
**Attributes:**
- id: string (UUID)
- card: Card
- account: Account
- atm: ATM
- loginTime: Date
- logoutTime: Date | null
- sessionStatus: SessionStatus (enum: ACTIVE, CLOSED, TIMEOUT)

**Methods:**
- constructor(card: Card, account: Account, atm: ATM, id?: string)
- close(): void
- isActive(): boolean
- getDuration(): number

**Responsibilities:**
- Track user session lifecycle

---

### 9. BankingService
**Attributes:**
- cardRepository: CardRepository
- accountRepository: AccountRepository
- transactionRepository: TransactionRepository
- atmRepository: ATMRepository

**Methods:**
- authenticateCard(cardNumber: string, pin: string, atmId: string): Account | null
- withdrawal(account: Account, amount: number, atmId: string): Transaction
- deposit(account: Account, amount: number, atmId: string): Transaction
- getBalance(account: Account): number
- getMiniStatement(account: Account, limit: number): Transaction[]
- changePin(card: Card, oldPin: string, newPin: string): boolean
- validateTransaction(transaction: Transaction, account: Account, atm: ATM): boolean

**Responsibilities:**
- Orchestrate business logic and workflows
- Coordinate between Card, Account, and Transaction entities

---

### 10. ATMService
**Attributes:**
- atmRepository: ATMRepository
- bankingService: BankingService

**Methods:**
- displayMainMenu(): void
- displayTransactionMenu(): void
- handleWithdrawal(session: Session): void
- handleDeposit(session: Session): void
- handleBalanceEnquiry(session: Session): void
- handleMiniStatement(session: Session): void
- handlePinChange(session: Session): void
- logout(session: Session): void

**Responsibilities:**
- Manage ATM UI/UX workflow and menu navigation

---

## REPOSITORY CLASSES

### CardRepository
**Methods:**
- save(card: Card): void
- findById(id: string): Card | undefined
- findByCardNumber(cardNumber: string): Card | undefined
- findByAccountId(accountId: string): Card[]
- update(card: Card): void
- delete(id: string): void

---

### AccountRepository
**Methods:**
- save(account: Account): void
- findById(id: string): Account | undefined
- findByAccountNumber(accountNumber: string): Account | undefined
- update(account: Account): void
- delete(id: string): void

---

### TransactionRepository
**Methods:**
- save(transaction: Transaction): void
- findById(id: string): Transaction | undefined
- findByAccountId(accountId: string, limit: number): Transaction[]
- findByAccountIdAndType(accountId: string, type: string, limit: number): Transaction[]

---

### ATMRepository
**Methods:**
- save(atm: ATM): void
- findById(id: string): ATM | undefined
- findByatmId(atmId: string): ATM | undefined
- update(atm: ATM): void

---

## ENUMS

```typescript
enum AccountStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED'
}

enum CardStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED'
}

enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

enum TransactionType {
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  PIN_CHANGE = 'PIN_CHANGE'
}

enum ATMStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  TIMEOUT = 'TIMEOUT'
}
```

---

## KEY INTERACTIONS

1. **Authentication Flow**:
   - User inserts card
   - System validates card (not blocked, not expired)
   - System validates PIN
   - Create session if successful

2. **Withdrawal Flow**:
   - User enters amount
   - System validates: sufficient balance, cash available
   - DebitAccount
   - DispenseCash
   - Record transaction

3. **Deposit Flow**:
   - User enters amount
   - System validates amount
   - Credit account
   - Record transaction

4. **PIN Change Flow**:
   - Validateold PIN
   - Validate new PIN strength
   - Update card PIN
   - Record transaction

5. **Balance Enquiry**:
   - Display account balance
   - Show mini statement (last 5 transactions)
