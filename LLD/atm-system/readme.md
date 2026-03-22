# ATM System - Complete Implementation

## Overview

This is a complete **Low Level Design (LLD)** implementation of an **ATM Management System** built using **TypeScript**. The system demonstrates various design patterns and clean architecture principles.

## Requirements
- User can enquire about balance and mini-statement
- User can withdraw balance
- User can deposit balance
- User can update pin
- ATM manage cash dispense and deposit to track the current state of cash in the ATM
- ATM does user authentication via it's card & pin

## Key Design Patterns Used

1. **Singleton**: InMemoryDatabase (single instance for all data)
2. **Repository Pattern**: Abstraction for data access layer
3. **Factory Pattern**: Transaction creation
4. **State Pattern**: Card and Account state management
5. **Strategy Pattern**: Different validation strategies
6. **Observer Pattern**: Transaction notifications

## Project Structure

```
src/
├── console/
│   └── ConsoleInterface.ts          # Main entry point
├── database/
│   └── InMemoryDatabase.ts          # Singleton database
├── enums/
│   └── index.ts                     # All enumerations
├── models/
│   ├── Account.ts                   # Bank account
│   ├── Card.ts                      # ATM card
│   ├── ATM.ts                       # ATM machine
│   ├── CashDispenser.ts             # Cash dispensing logic
│   ├── Session.ts                   # User session
│   ├── Transaction.ts               # Abstract transaction
│   ├── WithdrawalTransaction.ts     # Withdrawal implementation
│   └── DepositTransaction.ts        # Deposit implementation
├── repositories/
│   ├── CardRepository.ts            # Card data access
│   ├── AccountRepository.ts         # Account data access
│   ├── TransactionRepository.ts     # Transaction data access
│   └── ATMRepository.ts             # ATM data access
├── services/
│   ├── BankingService.ts            # Business logic
│   ├── ATMService.ts                # ATM workflows
│   └── SetupService.ts              # System initialization
└── utils/
    ├── IdGenerator.ts               # UUID generation
    ├── EncryptionUtil.ts            # PIN encryption
    └── ValidationUtil.ts            # Input validation
```

## Core Entities
- **ATM:** Main class for ATM operations; interacts with `BankingService` and `CashDispenser`.
- **Card:** Represents an ATM card with card number and PIN. Card will have accountId to know this card belongs to which account.
- **Account:** Represents a bank account with account number and balance; supports debit and credit operations.
- **Transaction (abstract):** Base class for transactions; extended by `WithdrawalTransaction` and `DepositTransaction`.
- **WithdrawalTransaction / DepositTransaction:** Concrete transaction types for withdrawal and deposit.
- **BankingService:** Manages bank accounts and processes transactions; uses thread-safe data structures.
- **CashDispenser:** Manages the ATM's cash inventory and handles dispensing.
- **Session:** Tracks user login session and ATM usage
- **Repository Classes:** Abstract data access layer (CardRepository, AccountRepository, TransactionRepository, ATMRepository)

## Key Features

### 1. Authentication
- Card number and PIN validation
- Failed attempt tracking
- Automatic card blocking after 3 failures
- 24-hour block timeout

### 2. Withdrawal Operations
- Balance validation
- ATM cash availability check
- Denomination-based cash dispensing
- Transaction logging

### 3. Deposit Operations
- Amount validation
- Account credit
- ATM cash loading
- Transaction logging

### 4. Balance Enquiry
- Real-time balance display
- Account information

### 5. Mini Statement
- Last 5 transactions display
- Transaction details (type, amount, status, timestamp)

### 6. PIN Management
- Secure PIN storage (AES-256 encryption)
- PIN change with old PIN verification
- PIN validation (4-6 digits)

## Sample Test Data

### Accounts
```
Account 1: ACC0123456789 | Balance: ₹50,000 | Status: ACTIVE
Account 2: ACC0987654321 | Balance: ₹100,000 | Status: ACTIVE
Account 3: ACC0555555555 | Balance: ₹75,000 | Status: ACTIVE
```

### Cards
```
Card 1: 4532XXXXXXXXXXXX | PIN: 1234 | Account: ACC0123456789
Card 2: 4532XXXXXXXXXXXX | PIN: 5678 | Account: ACC0987654321
Card 3: 4532XXXXXXXXXXXX | PIN: 9012 | Account: ACC0555555555
```

### ATM
```
ATM ID: ATM000001
Location: 123 Main Street, Downtown
Cash Balance: ₹350,000
  - ₹2000 notes: 100 (₹200,000)
  - ₹500 notes: 200 (₹100,000)
  - ₹100 notes: 500 (₹50,000)
```

## Installation & Running

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the application
npm start

# For development with ts-node
npm run dev
```

## Testing the System

### Test Scenario 1: Successful Withdrawal
1. Insert card with number from sample data
2. Enter PIN: `1234`
3. Select "Withdraw Cash"
4. Enter amount: `5000`
5. Check balance to confirm deduction

### Test Scenario 2: Failed PIN Entry
1. Insert card
2. Enter wrong PIN 3 times
3. Observe card blocking message
4. Try again (should show blocked status)

### Test Scenario 3: Mini Statement
1. Login successfully
2. Perform some transactions
3. Select "Mini Statement"
4. View transaction history

### Test Scenario 4: Deposit & Withdrawal
1. Deposit ₹10,000
2. Verify balance increase
3. Withdraw ₹5,000
4. Verify balance decrease
5. Check mini statement with both transactions

### Test Scenario 5: PIN Change
1. Login successfully
2. Select "Change PIN"
3. Enter old PIN: `1234`
4. Enter new PIN: `4321`
5. Confirm: `4321`
6. Logout and login with new PIN

## Validation Rules

- **PIN Format**: 4-6 digits
- **Amount Validation**: Must be multiple of ₹100
- **Max Withdrawal per Transaction**: ₹20,000
- **Max Deposit per Transaction**: ₹100,000
- **Card Expiry**: Checked during authentication
- **Failed Login Attempts**: 3 strikes → 24-hour block
- **Account Status**: Must be ACTIVE
- **Card Status**: Must be ACTIVE and not expired

## Security Features

- **PIN Encryption**: Uses AES-256-CBC encryption
- **Card Masking**: Last 4 digits displayed only
- **Session Management**: Active session tracking
- **Failed Attempt Monitoring**: Automatic blocking
- **Transaction Logging**: All operations recorded
- **Account Freezing**: Support for account suspension

## Database Schema

The system uses an in-memory database with the following tables:
- `Accounts`: User account information
- `Cards`: Card and PIN details
- `Transactions`: Transaction history
- `ATMs`: ATM machine details
- `Sessions`: User session logs

See `schema.md` for detailed schema documentation.

## Class Diagram

See `class-diagram.md` for detailed UML class diagram showing relationships between all classes, methods, and enumerations.

## Code Quality

- ✓ Strict TypeScript typing
- ✓ Clear separation of concerns
- ✓ SOLID principles
- ✓ Comprehensive error handling
- ✓ Meaningful naming conventions
- ✓ Well-structured file organization
- ✓ Scalable architecture

## Files Generated

- `schema.md` - Database schema design
- `class-diagram.md` - UML class diagram and architecture
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore file
- `src/` - All TypeScript source code with models, services, repositories, utils

## License

MIT