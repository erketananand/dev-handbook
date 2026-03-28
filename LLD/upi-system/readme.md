# UPI System - Low Level Design

A comprehensive TypeScript implementation of a **Unified Payments Interface (UPI)** system demonstrating real-world payment processing architecture with peer-to-peer transfers, merchant payments, and transaction management.

## Features

### Core Functionality
- ✅ **Peer-to-Peer Transfers**: Send money via UPI ID or phone number
- ✅ **Money Requests**: Request payment from other users with expiration
- ✅ **Merchant Payments**: Pay businesses using UPI with commission handling
- ✅ **QR Code Payments**: Generate static/dynamic QR codes for merchants
- ✅ **Transaction Reversal**: Reverse completed transactions within 24 hours
- ✅ **Transaction History**: Track all transactions with detailed history
- ✅ **Wallet Management**: Balance tracking with daily/monthly limits
- ✅ **Bank Account Linking**: Link multiple bank accounts
- ✅ **KYC Verification**: User identity verification before transactions
- ✅ **Notifications**: Transaction and security alerts
- ✅ **Transaction Receipts**: Generate and store payment proofs
- ✅ **Security Logging**: Audit trail for all security events

### Advanced Features
- **Limit Management**: Enforce daily and monthly spending caps
- **Merchant Commission**: Automatic commission deduction on merchant payments
- **Payment Methods**: Support UPI ID, Phone, and Account number
- **Transaction Status**: Track PENDING → COMPLETED/FAILED/REVERSED
- **Fraud Detection**: Security logs for suspicious activities
- **Multi-wallet Support**: Independent wallets per user
- **Request Expiration**: Auto-expire money requests after set duration

## System Architecture

### Entity Model
```
User (1) ────────── (1) Wallet
User (1) ────────── (N) BankAccount
User (1) ────────── (N) Transaction
User (1) ────────── (1) Merchant (ownerUserId)
Merchant (1) ────────── (N) MerchantPayment
Transaction (1) ──── (1) TransactionReceipt
```

### Service Layer
- **UPIService**: Main facade coordinating all operations
- **UserService**: User registration, KYC, bank account management
- **WalletService**: Balance and limit management
- **TransactionService**: Transaction lifecycle and state management
- **MerchantService**: Merchant registration and QR code handling
- **NotificationService**: Alert delivery and tracking

### Repository Pattern
- In-memory storage for local development
- Easy migration to database implementations (SQL, NoSQL)
- CRUD operations with filtering and search capabilities

## Project Structure

```
upi-system/
├── src/
│   ├── enums/                        # Enumeration types
│   │   ├── TransactionType.ts
│   │   ├── TransactionStatus.ts
│   │   ├── PaymentMethod.ts
│   │   ├── RequestStatus.ts
│   │   ├── NotificationType.ts
│   │   ├── EventStatus.ts
│   │   └── index.ts
│   │
│   ├── models/                       # Domain entities
│   │   ├── User.ts
│   │   ├── BankAccount.ts
│   │   ├── Wallet.ts
│   │   ├── Transaction.ts
│   │   ├── RequestMoney.ts
│   │   ├── Merchant.ts
│   │   ├── MerchantPayment.ts
│   │   ├── TransactionReceipt.ts
│   │   ├── Notification.ts
│   │   ├── SecurityLog.ts
│   │   └── index.ts
│   │
│   ├── repositories/                 # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── WalletRepository.ts
│   │   ├── TransactionRepository.ts
│   │   ├── BankAccountRepository.ts
│   │   ├── RequestMoneyRepository.ts
│   │   ├── MerchantRepository.ts
│   │   ├── MerchantPaymentRepository.ts
│   │   ├── NotificationRepository.ts
│   │   ├── SecurityLogRepository.ts
│   │   ├── TransactionReceiptRepository.ts
│   │   └── index.ts
│   │
│   ├── services/                     # Business logic services
│   │   ├── WalletService.ts
│   │   ├── NotificationService.ts
│   │   ├── TransactionService.ts
│   │   ├── UserService.ts
│   │   ├── MerchantService.ts
│   │   └── index.ts
│   │
│   ├── utils/                        # Utilities and helpers
│   │   ├── Errors.ts                 # Custom error classes
│   │   ├── Validators.ts             # Validation functions
│   │   ├── IRepository.ts            # Repository interface
│   │   └── index.ts
│   │
│   ├── console/                      # Console/Driver code
│   │   └── examples.ts               # Usage examples and workflows
│   │
│   ├── UPIService.ts                 # Main UPI service facade
│   ├── index.ts                      # Public API exports
│   └── tests.ts                      # Unit tests
│
├── dist/                             # Compiled JavaScript output
├── schema.md                         # Database design
├── class-diagram.md                  # Class relationships
├── package.json
├── tsconfig.json
└── README.md
```

## Key Classes

### Entities
- **User**: Account holder with profile and verification status
- **Wallet**: Balance and transaction limit tracking
- **Transaction**: Fund transfer records with status tracking
- **RequestMoney**: Payment request with expiration
- **Merchant**: Business account for receiving payments
- **MerchantPayment**: QR code entry for payments
- **BankAccount**: Linked bank account details
- **Notification**: Transaction and security alerts
- **TransactionReceipt**: Payment proof and receipt
- **SecurityLog**: Audit trail for security events

### Services
- **UPIService**: Orchestrates all UPI operations
- **UserService**: Manages user accounts and profiles
- **WalletService**: Handles balance and limits
- **TransactionService**: Manages transaction lifecycle
- **MerchantService**: Manages merchants and QR codes
- **NotificationService**: Sends and tracks notifications

### Repositories
- **UserRepository**: User data access
- **WalletRepository**: Wallet data access
- **TransactionRepository**: Transaction data access
- **BankAccountRepository**: Bank account data access
- **MerchantRepository**: Merchant data access
- **MerchantPaymentRepository**: QR code data access
- **NotificationRepository**: Notification data access
- **SecurityLogRepository**: Security audit log access
- **TransactionReceiptRepository**: Receipt data access

## Enumerations

```typescript
enum TransactionType {
  SEND,     // P2P transfer
  RECEIVE,  // P2P receipt
  PAYMENT   // Merchant payment
}

enum TransactionStatus {
  PENDING,    // Awaiting processing
  COMPLETED,  // Successfully processed
  FAILED,     // Processing failed
  REVERSED    // Transaction reversed
}

enum PaymentMethod {
  UPI_ID,     // Recipient identified by UPI ID
  PHONE,      // Recipient identified by phone
  ACCOUNT     // Recipient identified by bank account
}

enum RequestStatus {
  PENDING,    // Awaiting approval
  PAID,       // Request paid
  CANCELLED,  // Request cancelled
  EXPIRED     // Request expired
}

enum NotificationType {
  TRANSACTION,  // Transaction update
  REQUEST,      // Money request
  SECURITY      // Security event
}
```

## Usage Examples

### 1. User Registration
```typescript
const user = await upiService.registerUser(
  "John Doe",
  "john@example.com",
  "9876543210",
  "john@hdfc"
);
```

### 2. KYC Verification
```typescript
await upiService.verifyKYC(user.userId);
```

### 3. Add Money
```typescript
await upiService.addMoneyToWallet(user.userId, 10000);
```

### 4. Send Money to User
```typescript
const transaction = await upiService.sendMoney(
  sender.userId,
  "john@hdfc",        // Recipient UPI ID
  500,                // Amount
  "Party payment"     // Description
);
```

### 5. Send Money to Phone
```typescript
const transaction = await upiService.sendMoney(
  sender.userId,
  "9876543210",       // Recipient phone
  500
);
```

### 6. Request Money
```typescript
const request = await upiService.requestMoney(
  requester.userId,
  requester2.userId,
  1000,               // Amount
  "Rent split",
  7                   // Expires in 7 days
);
```

### 7. Approve Money Request
```typescript
const transaction = await upiService.approveMoneyRequest(request.requestId);
```

### 8. Register Merchant
```typescript
const merchant = await upiService.registerMerchant(
  ownerUser.userId,
  "Coffee House",
  "coffeehouse@paytm",
  "F&B",              // Category
  1.5                 // Commission %
);
```

### 9. Pay Merchant
```typescript
const transaction = await upiService.payMerchant(
  buyer.userId,
  "coffeehouse@paytm",
  200,
  "Coffee order"
);
```

### 10. Generate QR Code
```typescript
const qrCode = await upiService.generateQRCode(
  merchant.merchantId,
  "Coffee House - Standard",
  100  // Fixed amount (null for dynamic)
);
```

### 11. Scan & Pay with QR
```typescript
const transaction = await upiService.scanQRCode(
  qrCode,
  buyer.userId,
  100
);
```

### 12. Get Transaction History
```typescript
const transactions = await upiService.getTransactionHistory(user.userId);
transactions.forEach(tx => {
  console.log(`${tx.type}: ₹${tx.amount} - ${tx.status}`);
});
```

### 13. Get Balance
```typescript
const balance = await upiService.getBalance(user.userId);
console.log(`Balance: ₹${balance}`);
```

### 14. Get Notifications
```typescript
const notifications = await upiService.getNotifications(user.userId);
notifications.forEach(n => {
  console.log(`[${n.type}] ${n.title}: ${n.message}`);
});
```

### 15. Reverse Transaction
```typescript
const reversed = await upiService.reverseTransaction(transaction.transactionId);
```

### 16. Get Transaction with Receipt
```typescript
const { transaction, receipt } = await upiService.getTransactionWithReceipt(txId);
```

## Transaction Flow

### Successful P2P Transfer
1. **Validation**: Check sender verification, balance, limits
2. **Create**: Create transaction in PENDING state
3. **Deduct**: Deduct amount from sender's wallet
4. **Credit**: Add amount to receiver's wallet
5. **Complete**: Mark transaction as COMPLETED
6. **Receipt**: Generate transaction receipt
7. **Notify**: Send notifications to both parties

### Failed Transaction Recovery
1. If any step fails, mark transaction as FAILED
2. Reverse any deductions made
3. Notify sender of failure reason
4. Log security event

### Transaction Reversal (within 24 hours)
1. Check transaction is COMPLETED
2. Verify reversal window (< 24 hours)
3. Reverse wallet amounts
4. Mark transaction as REVERSED
5. Notify both parties
6. Log reversal event

## Validation Rules

1. **Amount Validation**
   - Must be positive (> 0)
   - Minimum: ₹1
   - Maximum: Daily limit (default ₹100,000)

2. **User Validation**
   - Must be registered
   - Must be KYC verified for transactions
   - Cannot send to own account

3. **Recipient Validation**
   - Must be registered and verified
   - Can use UPI ID, phone number, or account
   - Must exist in system

4. **Wallet Validation**
   - Sufficient balance required
   - Daily spent + amount ≤ daily limit
   - Monthly spent + amount ≤ monthly limit

5. **Transaction Validation**
   - Sender and receiver must be verified
   - Cannot reverse after 24 hours
   - Cannot reverse non-completed transactions

6. **Merchant Validation**
   - Owner must be KYC verified
   - Merchant UPI must be unique
   - Merchant must be active for payments

7. **Request Validation**
   - Must not be expired
   - Must be in PENDING status to approve
   - Amount and parties must match

## Error Handling

- **ValidationError**: Invalid input or business rule violation
- **InsufficientBalanceError**: Sender lacks sufficient balance
- **TransactionError**: Transaction processing failed
- **Standard Error**: Entity not found or other issues

## Key Design Patterns

### 1. Repository Pattern
- Abstraction for data access
- Easy to swap storage implementations
- In-memory storage for testing, DB for production

### 2. Service Layer Pattern
- Encapsulates business logic
- Clear separation of concerns
- Transaction management and validation

### 3. Facade Pattern
- UPIService provides simple interface
- Hides complexity of multiple services
- Easy to test and extend

### 4. Entity Pattern
- Domain-driven design
- Rich entities with validation
- Immutable IDs and timestamps

### 5. Notification Pattern
- Observer-like notification system
- Decoupled from transaction logic
- Supports multiple notification types

## Scalability Considerations

1. **Database**: Replace in-memory storage with SQL (PostgreSQL) or NoSQL (MongoDB)
2. **Caching**: Add Redis for frequently accessed data (user, merchant, wallet)
3. **Event Queue**: Use Kafka/RabbitMQ for async notifications
4. **Rate Limiting**: Add per-user transaction rate limits
5. **Sharding**: Shard data by userId for horizontal scaling
6. **Settlement**: Async settlement process for merchant payments
7. **Audit**: Move security logs to separate audit database
8. **Reconciliation**: Daily reconciliation job for transaction integrity

## Security Considerations

1. **OTP Verification**: Add OTP for high-value transactions
2. **Device Trust**: Track and verify trusted devices
3. **Fraud Detection**: Implement ML-based fraud detection
4. **Rate Limiting**: Prevent brute force and abuse
5. **Encryption**: Encrypt sensitive data at rest and in transit
6. **Access Control**: Role-based access control (Admin, Merchant, User)
7. **Audit Logging**: Comprehensive audit trail
8. **PCI Compliance**: Follow payment card security standards

## Testing

```typescript
// Unit tests for entities
describe("Wallet", () => {
  it("should deduct balance", () => {
    const wallet = new Wallet(userId);
    wallet.addBalance(1000);
    wallet.deductBalance(200);
    expect(wallet.getBalance()).toBe(800);
  });
});

// Integration tests for services
describe("UPIService", () => {
  it("should send money between users", async () => {
    const tx = await upiService.sendMoney(sender, recipient, 500);
    expect(tx.status).toBe(TransactionStatus.COMPLETED);
  });
});
```

## Performance Metrics

- **Transaction Completion**: < 1 second (in-memory)
- **Query Response**: < 50ms with proper indexing
- **Concurrent Users**: Scales to 10K+ with proper infrastructure
- **Throughput**: 1000+ transactions/second with horizontal scaling

## Future Enhancements

- [ ] International payments / Currency conversion
- [ ] Recurring payments / Subscriptions
- [ ] Group payments / Bill splitting
- [ ] Loyalty rewards / Cashback integration
- [ ] API rate limiting and throttling
- [ ] Advanced fraud detection
- [ ] Mobile app with biometric authentication
- [ ] Scheduled bill payments
- [ ] Investment/Savings features
- [ ] NEFT/RTGS integration for settlement
- [ ] API gateway for third-party integrations
- [ ] Admin dashboard and analytics

## Setup & Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc

# Run example
node dist/example.js

# Run tests
npm test
```

## TypeScript Configuration

See `tsconfig.json` for compiler settings:
- ES2020 target syntax
- Strict null checks enabled
- Source maps enabled
- Module resolution strategy

## References

- **UPI Specification**: https://www.npci.org.in/
- **Payment System Design**: Design discussion in class-diagram.md
- **Database Schema**: Normalized design in schema.md
- **Class Relationships**: Visual representation in class-diagram.md

## License

Educational - LLD Teaching Material

## Author

Designed for Low Level Design course - demonstrates real-world system design patterns and practices.

---

**Note**: This is a simplified implementation for educational purposes. Production systems require additional security, compliance, scalability, and operational features.

### Requirements