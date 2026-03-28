# UPI System - Database Schema Design

This document describes the database schema for the modular UPI system implementation. The schema design is independent of the code organization and serves as the foundation for the data persistence layer across all repositories (`src/repositories/`).

## Database Tables

### 1. **User**
Stores user account and profile information.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| userId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for user |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | User's 10-digit phone number |
| upiId | VARCHAR(100) | UNIQUE, NOT NULL | UPI identifier (e.g., user@bank) |
| createdAt | TIMESTAMP | NOT NULL | Account creation timestamp |
| isVerified | BOOLEAN | DEFAULT false | KYC/Email verification status |

**Indexes**: email (unique), phone (unique), upi_id (unique)

---

### 2. **BankAccount**
Represents linked bank accounts for UPI transactions.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| accountId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| accountNumber | VARCHAR(20) | NOT NULL | Bank account number (masked in display) |
| ifscCode | VARCHAR(11) | NOT NULL | IFSC code of bank branch |
| bankName | VARCHAR(100) | NOT NULL | Name of the bank |
| accountHolder | VARCHAR(255) | NOT NULL | Account holder's name |
| isActive | BOOLEAN | DEFAULT true | Status of the linked account |
| createdAt | TIMESTAMP | NOT NULL | When account was linked |

**Indexes**: user_id, account_number

---

### 3. **Wallet**
Manages user wallet balance and transaction limits.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| walletId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| balance | DECIMAL(12,2) | DEFAULT 0 | Current wallet balance |
| dailyLimit | DECIMAL(12,2) | DEFAULT 100000 | Daily transaction limit |
| monthlyLimit | DECIMAL(12,2) | DEFAULT 1000000 | Monthly transaction limit |
| dailySpent | DECIMAL(12,2) | DEFAULT 0 | Amount spent today |
| monthlySpent | DECIMAL(12,2) | DEFAULT 0 | Amount spent this month |
| lastUpdated | TIMESTAMP | NOT NULL | Last balance update |

**Indexes**: user_id

---

### 4. **Transaction**
Records all UPI transactions.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| transactionId | UUID | PRIMARY KEY, NOT NULL | Unique transaction identifier |
| fromUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | Sender user ID |
| toUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | Receiver user ID (NULL for merchant) |
| merchantId | UUID | FOREIGN KEY (Merchant.merchantId), DEFAULT NULL | Merchant ID if payment to merchant |
| amount | DECIMAL(12,2) | NOT NULL | Transaction amount |
| description | VARCHAR(500) | DEFAULT NULL | Transaction description/note |
| transactionType | ENUM(SEND, RECEIVE, PAYMENT) | NOT NULL | Type of transaction |
| status | ENUM(PENDING, COMPLETED, FAILED, REVERSED) | DEFAULT PENDING | Transaction status |
| paymentMethod | ENUM(UPI_ID, PHONE, ACCOUNT) | NOT NULL | How payment identifier was provided |
| transactionTime | TIMESTAMP | NOT NULL | When transaction was initiated |
| completedTime | TIMESTAMP | DEFAULT NULL | When transaction was completed |
| referenceNumber | VARCHAR(50) | UNIQUE | Bank reference number for settlement |

**Indexes**: from_user_id, to_user_id, merchant_id, status, transaction_time

---

### 5. **RequestMoney**
Tracks money request (request for payment).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| requestId | UUID | PRIMARY KEY, NOT NULL | Unique request identifier |
| fromUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | User requesting money |
| toUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | User being requested |
| amount | DECIMAL(12,2) | NOT NULL | Amount requested |
| description | VARCHAR(500) | DEFAULT NULL | Reason for request |
| status | ENUM(PENDING, PAID, CANCELLED, EXPIRED) | DEFAULT PENDING | Request status |
| createdAt | TIMESTAMP | NOT NULL | When request was created |
| expiresAt | TIMESTAMP | NOT NULL | When request expires |
| paidAt | TIMESTAMP | DEFAULT NULL | When request was paid |
| transactionId | UUID | FOREIGN KEY (Transaction.transactionId), DEFAULT NULL | Reference to payment transaction |

**Indexes**: from_user_id, to_user_id, status, created_at

---

### 6. **Merchant**
Manages merchant/business accounts for receiving payments.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| merchantId | UUID | PRIMARY KEY, NOT NULL | Unique merchant identifier |
| merchantName | VARCHAR(255) | NOT NULL | Business/merchant name |
| merchantUpiId | VARCHAR(100) | UNIQUE, NOT NULL | UPI ID for merchant (e.g., business@upi) |
| ownerUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | Owner user reference |
| category | VARCHAR(100) | NOT NULL | Merchant category (Retail, Food, etc.) |
| commissionRate | DECIMAL(5,2) | DEFAULT 0 | Commission percentage charged |
| totalReceived | DECIMAL(12,2) | DEFAULT 0 | Total amount received |
| transactionCount | INT | DEFAULT 0 | Number of transactions |
| isActive | BOOLEAN | DEFAULT true | Merchant status |
| createdAt | TIMESTAMP | NOT NULL | When merchant was registered |

**Indexes**: merchant_upi_id, owner_user_id, category

---

### 7. **MerchantPayment**
Details for QR-based or subscription payments to merchants.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| paymentId | UUID | PRIMARY KEY, NOT NULL | Unique payment record ID |
| merchantId | UUID | FOREIGN KEY (Merchant.merchantId), NOT NULL | Reference to merchant |
| qrCode | VARCHAR(500) | UNIQUE | QR code data for merchant payments |
| amount | DECIMAL(12,2) | DEFAULT NULL | Fixed amount or NULL for dynamic |
| description | VARCHAR(200) | NOT NULL | Payment description (e.g., "Monthly subscription") |
| isActive | BOOLEAN | DEFAULT true | Status of QR code |
| createdAt | TIMESTAMP | NOT NULL | When QR was created |

**Indexes**: merchant_id, qr_code

---

### 8. **Notification**
Audit trail and notification records.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| notificationId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Recipient user |
| type | ENUM(TRANSACTION, REQUEST, SECURITY) | NOT NULL | Notification type |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| transactionId | UUID | FOREIGN KEY (Transaction.transactionId), DEFAULT NULL | Related transaction |
| isRead | BOOLEAN | DEFAULT false | Read status |
| createdAt | TIMESTAMP | NOT NULL | When notification was created |

**Indexes**: user_id, type, created_at

---

### 9. **SecurityLog**
Tracks security-related events and login attempts.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| logId | UUID | PRIMARY KEY, NOT NULL | Unique log identifier |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User involved |
| event | VARCHAR(100) | NOT NULL | Security event type |
| deviceInfo | VARCHAR(500) | NOT NULL | Device/location information |
| ipAddress | VARCHAR(45) | NOT NULL | IP address of access |
| status | ENUM(SUCCESS, FAILED) | NOT NULL | Event status |
| createdAt | TIMESTAMP | NOT NULL | When event occurred |

**Indexes**: user_id, event, created_at

---

### 10. **TransactionReceipt**
Stores transaction receipts for proof of payment.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| receiptId | UUID | PRIMARY KEY, NOT NULL | Unique receipt identifier |
| transactionId | UUID | FOREIGN KEY (Transaction.transactionId), NOT NULL | Reference to transaction |
| receiptData | TEXT | NOT NULL | Full receipt details (JSON) |
| createdAt | TIMESTAMP | NOT NULL | When receipt was generated |

**Indexes**: transaction_id

---

## Entity Relationships

```
User (1) ──────── (N) BankAccount
User (1) ──────── (1) Wallet
User (1) ──────── (N) Transaction (fromUserId/toUserId)
User (1) ──────── (N) RequestMoney
User (1) ──────── (1) Merchant (ownerUserId)
User (1) ──────── (N) SecurityLog
User (1) ──────── (N) Notification

Merchant (1) ──────── (N) MerchantPayment
Merchant (1) ──────── (N) Transaction (toMerchant)

Transaction (1) ──────── (1) TransactionReceipt
Transaction (1) ──────── (1) RequestMoney (payment)

RequestMoney (1) ──────── (N) RequestMoney (previous status)
```

---

## Key Constraints & Rules

1. **UPI Uniqueness**: UPI IDs must be unique across system
2. **Account Verification**: Must complete KYC before transactions
3. **Daily Limits**: Cannot exceed daily/monthly transaction limits
4. **Minimum Amount**: Transactions must be >= ₹1
5. **Maximum Amount**: Single transaction capped at daily limit
6. **Self-Payment Prevention**: Cannot send money to own account
7. **Refund Policy**: Reversals only within 24 hours of transaction
8. **Merchant Settlement**: Commissions deducted automatically
9. **Phone/Email Verification**: Required before enabling transactions
10. **Transaction Atomicity**: All-or-nothing - either succeeds completely or fails

---

## Indexing Strategy

- **Primary Indexes**: All PRIMARY KEY columns
- **Foreign Key Indexes**: All FOREIGN KEY columns for JOIN performance
- **Composite Indexes**: (user_id, transaction_time) for user transaction history
- **Search Indexes**: upi_id, phone, email for fast lookups
- **Status Indexes**: status, created_at for filtering active/pending transactions
- **Performance**: Typical query response <50ms with proper indexes

