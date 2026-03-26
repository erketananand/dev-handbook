# Splitwise System - Database Schema Design

## Database Tables

### 1. **User**
Stores user account information and profile details.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| userId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for user |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (login) |
| phone | VARCHAR(20) | UNIQUE | User's 10-digit phone number |
| profileImage | VARCHAR(500) | DEFAULT NULL | Profile picture URL |
| createdAt | TIMESTAMP | NOT NULL | Account creation timestamp |

**Indexes**: user_email (unique), created_at

---

### 2. **Group**
Represents a group for shared expenses (e.g., "Friends Trip", "Roommates").

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| groupId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for group |
| groupName | VARCHAR(255) | NOT NULL | Name of the group |
| description | TEXT | DEFAULT NULL | Group description/purpose |
| createdBy | UUID | FOREIGN KEY (User.userId), NOT NULL | User who created the group |
| createdAt | TIMESTAMP | NOT NULL | Group creation timestamp |
| isActive | BOOLEAN | DEFAULT true | Soft delete flag |

**Indexes**: created_by, created_at

---

### 3. **GroupMember**
Tracks membership of users in groups with roles.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| groupMemberId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| groupId | UUID | FOREIGN KEY (Group.groupId), NOT NULL | Reference to group |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | Reference to user |
| role | ENUM(ADMIN, MEMBER) | DEFAULT MEMBER | Member's role in group |
| joinedAt | TIMESTAMP | NOT NULL | When user joined group |
| isActive | BOOLEAN | DEFAULT true | Soft delete flag |

**Indexes**: group_id, user_id, (group_id, user_id) unique constraint

---

### 4. **Expense**
Records individual expense transactions within groups or one-to-one.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| expenseId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for expense |
| groupId | UUID | FOREIGN KEY (Group.groupId), NOT NULL | Reference to group (NULL for one-to-one) |
| paidBy | UUID | FOREIGN KEY (User.userId), NOT NULL | User who paid the amount |
| amount | DECIMAL(10,2) | NOT NULL | Total expense amount |
| description | VARCHAR(500) | NOT NULL | Expense description |
| splitType | ENUM(EQUAL, PROPORTIONAL, PERCENTAGE, EXACT) | NOT NULL | How expense is split |
| category | VARCHAR(100) | DEFAULT 'Other' | Expense category |
| createdAt | TIMESTAMP | NOT NULL | When expense was created |
| updatedAt | TIMESTAMP | DEFAULT NULL | When expense was last updated |
| isSettled | BOOLEAN | DEFAULT false | Flag if expense is settled |

**Indexes**: group_id, paid_by, created_at, created_by

---

### 5. **ExpenseSplit**
Details how an expense is distributed among participants.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| splitId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for split record |
| expenseId | UUID | FOREIGN KEY (Expense.expenseId), NOT NULL | Reference to expense |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User receiving this split |
| amount | DECIMAL(10,2) | NOT NULL | Amount owed by/to this user |
| percentage | DECIMAL(5,2) | DEFAULT NULL | Percentage of expense (for % split) |
| customAmount | DECIMAL(10,2) | DEFAULT NULL | Exact custom amount (for exact split) |

**Indexes**: expense_id, user_id

---

### 6. **Payment**
Records settlement transactions between users.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| paymentId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for payment |
| fromUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | User making payment |
| toUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | User receiving payment |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| status | ENUM(PENDING, COMPLETED) | DEFAULT PENDING | Payment status |
| method | VARCHAR(50) | DEFAULT 'CASH' | Payment method |
| createdAt | TIMESTAMP | NOT NULL | When payment was recorded |
| completedAt | TIMESTAMP | DEFAULT NULL | When payment was completed |

**Indexes**: from_user_id, to_user_id, created_at, status

---

### 7. **Comment**
Stores comments on expenses for discussion.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| commentId | UUID | PRIMARY KEY, NOT NULL | Unique identifier for comment |
| expenseId | UUID | FOREIGN KEY (Expense.expenseId), NOT NULL | Reference to expense |
| userId | UUID | FOREIGN KEY (User.userId), NOT NULL | User who commented |
| text | TEXT | NOT NULL | Comment text |
| createdAt | TIMESTAMP | NOT NULL | When comment was posted |

**Indexes**: expense_id, user_id, created_at

---

### 8. **Transaction History**
Tracks all financial transactions for audit trail.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| transactionId | UUID | PRIMARY KEY, NOT NULL | Unique identifier |
| fromUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | Sender of money |
| toUserId | UUID | FOREIGN KEY (User.userId), NOT NULL | Receiver of money |
| expenseId | UUID | FOREIGN KEY (Expense.expenseId), DEFAULT NULL | Reference expense |
| paymentId | UUID | FOREIGN KEY (Payment.paymentId), DEFAULT NULL | Reference payment |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| type | ENUM(EXPENSE, PAYMENT) | NOT NULL | Transaction type |
| createdAt | TIMESTAMP | NOT NULL | When transaction occurred |

**Indexes**: from_user_id, to_user_id, created_at, type

---

## Entity Relationships

```
User (1) ──────── (N) GroupMember ──────── (1) Group
User (1) ──────── (N) Expense (paidBy)
User (1) ──────── (N) ExpenseSplit
User (1) ──────── (N) Payment (fromUserId/toUserId)
User (1) ──────── (N) Comment
Group (1) ──────── (N) Expense
Group (1) ──────── (N) GroupMember
Expense (1) ──────── (N) ExpenseSplit
Expense (1) ──────── (N) Comment
Payment (1) ──────── (?) TransactionHistory
```

---

## Key Constraints & Rules

1. **User Uniqueness**: Email and phone must be unique across all users
2. **Group Membership**: One user can be member of multiple groups; duplicate memberships not allowed
3. **Expense Participants**: All users in an expense split must be members of the group
4. **Split Validation**: 
   - EQUAL: amount divided equally among all participants
   - PROPORTIONAL: amount split by proportion values
   - PERCENTAGE: percentages must sum to 100%
   - EXACT: amounts must equal total expense amount
5. **Settlement**: Payments reduce outstanding balances; cannot create payment more than outstanding balance
6. **Soft Delete**: Groups and GroupMembers marked inactive instead of hard delete to preserve history

---

## Indexing Strategy

- **Primary Indexes**: All PRIMARY KEY and UNIQUE columns indexed
- **Foreign Key Indexes**: All FOREIGN KEY columns indexed for JOIN performance
- **Composite Indexes**: (groupId, userId) for fast member lookups
- **Search Indexes**: email, created_at for common query patterns
- **Performance**: Typical query response <100ms with proper indexes

