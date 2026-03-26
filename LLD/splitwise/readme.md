# Splitwise System

## 1. System Overview

The Splitwise System is a comprehensive low-level design implementation of an expense-sharing platform. It enables users to efficiently manage shared expenses, track balances, and settle debts with intelligent optimization algorithms. Users can create groups, record expenses with multiple split methods, and automatically calculate who owes whom without manual tracking.

**Key Purpose**: Provide a scalable platform for managing shared expenses with real-time balance tracking, optimized settlement suggestions, and flexible expense-splitting methods. The system minimizes the number of transactions needed to settle all debts using graph-based algorithms.

**Why This System**: Expense-sharing systems must handle complex debt relationships across multiple groups, optimize settlements to minimize transactions, and support various split methods. This implementation demonstrates advanced algorithms (settlement optimization), multi-level data relationships (users, groups, expenses, splits), and financial accuracy requirements.

## 2. Requirements Fulfilled

### Core Requirements:
- ✅ **User Account Management** - Users can create accounts and manage profile details with email/phone validation
- ✅ **Group Management** - Users can create multiple groups, join existing groups, invite other members
- ✅ **Member Invitations** - Add and manage group members with role-based access (ADMIN/MEMBER)
- ✅ **Expense Recording** - Record expenses with amount, description, participants, and their respective shares
- ✅ **Flexible Split Methods** - Support EQUAL, PROPORTIONAL, PERCENTAGE, and EXACT split methods
- ✅ **Automatic Calculation** - System auto-calculates distributions based on selected split method
- ✅ **Expense Updates & Comments** - Update expense descriptions and add comments for discussion
- ✅ **Transaction History** - Complete audit trail of all individual and group expenses
- ✅ **Balance Settlement** - Settle outstanding balances for one-to-one and group expenses
- ✅ **Settlement Optimization** - Minimize number of transactions using graph-based algorithms

## 3. Design Patterns Used

### **1. Singleton Pattern**
- **Implementation**: `InMemoryDatabase.ts` ensures only one instance manages all repositories
- **Benefits**: Centralized data access, consistent state across all services, single source of truth
- **Code Location**: `src/database/InMemoryDatabase.ts` - Instance created once and reused throughout

### **2. Repository Pattern**
- **Implementation**: 8 repository classes abstract data access from business logic
- **Repositories**: UserRepository, GroupRepository, GroupMemberRepository, ExpenseRepository, ExpenseSplitRepository, PaymentRepository, CommentRepository, TransactionHistoryRepository
- **Benefits**: Easy testing, switchable implementations, isolated data operations
- **Code Location**: `src/repositories/*` - Each repository manages one entity type's CRUD operations

### **3. Factory Pattern**
- **Implementation**: Service classes create objects through factory methods
- **Examples**: UserService.register() creates User with validation, ExpenseService.recordExpense() creates Expense with splits
- **Benefits**: Centralized object creation, encapsulated validation, consistent initialization
- **Code Location**: Service classes with creation and recording methods

### **4. Strategy Pattern**
- **Implementation**: Multiple expense-splitting strategies (EQUAL, PROPORTIONAL, PERCENTAGE, EXACT)
- **Payment Settlement**: Different settlement optimization strategies
- **Benefits**: Plugin architecture, runtime behavior selection, easy extension
- **Code Location**: `src/services/ExpenseService.ts` (split calculation), `src/services/SettlementService.ts` (optimization)

### **5. State Pattern**
- **Implementation**: Each entity has well-defined states managed through enums
- **States**:
  - UserRole: ADMIN, MEMBER
  - PaymentStatus: PENDING, COMPLETED
  - TransactionType: EXPENSE, PAYMENT
  - ExpenseCategory: FOOD, TRAVEL, ENTERTAINMENT, UTILITIES, OTHER
- **Benefits**: Clear state management, validation of legal transitions
- **Code Location**: `src/enums/index.ts` - All state definitions

### **6. Observer Pattern**
- **Implementation**: Expense creation automatically triggers balance updates and transaction history
- **Example**: Recording expense creates ExpenseSplit records and TransactionHistory automatically
- **Benefits**: Loose coupling, automatic state synchronization, event-driven updates
- **Code Location**: `src/services/ExpenseService.ts` - Triggers automatic records

### **7. Graph Algorithm Pattern**
- **Implementation**: Settlement optimization uses graph algorithms to minimize transactions
- **Example**: SettlementService.optimizeSettlements() uses greedy algorithm to calculate minimum payments
- **Benefits**: Mathematically optimal solutions, scalable to large debt networks
- **Code Location**: `src/services/SettlementService.ts` - Core algorithm implementation

## 4. Project Structure

```
splitwise/
├── src/
│   ├── models/                 # Entity classes (8 files)
│   │   ├── User.ts            # User profiles
│   │   ├── Group.ts           # Group management
│   │   ├── GroupMember.ts     # Group membership
│   │   ├── Expense.ts         # Expense records
│   │   ├── ExpenseSplit.ts    # Expense distributions
│   │   ├── Payment.ts         # Settlement payments
│   │   ├── Comment.ts         # Expense comments
│   │   └── TransactionHistory.ts  # Transaction audit trail
│   │
│   ├── repositories/           # Data access layer (8 files)
│   │   ├── UserRepository.ts
│   │   ├── GroupRepository.ts
│   │   ├── GroupMemberRepository.ts
│   │   ├── ExpenseRepository.ts
│   │   ├── ExpenseSplitRepository.ts
│   │   ├── PaymentRepository.ts
│   │   ├── CommentRepository.ts
│   │   └── TransactionHistoryRepository.ts
│   │
│   ├── services/               # Business logic (7 files)
│   │   ├── UserService.ts      # User management
│   │   ├── GroupService.ts     # Group operations
│   │   ├── ExpenseService.ts   # Expense recording
│   │   ├── SettlementService.ts # Balance & optimization
│   │   ├── PaymentService.ts   # Payment processing
│   │   ├── CommentService.ts   # Comment management
│   │   └── SetupService.ts     # Sample data initialization
│   │
│   ├── database/
│   │   └── InMemoryDatabase.ts # Singleton coordinator
│   │
│   ├── console/
│   │   └── ConsoleInterface.ts # Interactive menu
│   │
│   ├── enums/
│   │   └── index.ts            # All enum definitions (5 types)
│   │
│   ├── utils/
│   │   ├── IdGenerator.ts      # UUID generation
│   │   └── ValidationUtil.ts   # Validation & calculations
│   │
│   └── index.ts                # Application entry point
│
├── schema.md                   # Database design (8 tables)
├── class-diagram.md            # Architecture documentation
├── readme.md                   # This file
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── .gitignore                  # Git ignore rules
```

## 5. Core Entities & Relationships

### **User**
- Properties: userId, name, email, phone, profileImage, createdAt
- Relationships: Can create groups, join groups, record expenses, make payments
- Validations: Email format (RFC 5322), 10-digit phone number

### **Group**
- Properties: groupId, groupName, description, createdBy, createdAt, isActive
- Relationships: Contains multiple members, multiple expenses
- Features: Soft delete support, creator becomes ADMIN

### **GroupMember**
- Properties: groupMemberId, groupId, userId, role (ADMIN/MEMBER), joinedAt, isActive
- Relationships: Links users to groups with role assignment
- Features: Soft delete, role-based permissions

### **Expense**
- Properties: expenseId, groupId, paidBy, amount, description, splitType, category, createdAt, updatedAt, isSettled
- Relationships: One payer, multiple participants via ExpenseSplit
- Features: Multiple split methods, category tracking, settlement flag

### **ExpenseSplit**
- Properties: splitId, expenseId, userId, amount, percentage, customAmount
- Relationships: Details how expense distributed to each participant
- Features: Flexible amount storage for different split types

### **Payment**
- Properties: paymentId, fromUserId, toUserId, amount, status (PENDING/COMPLETED), method, createdAt, completedAt
- Relationships: Records settlement between two users
- Features: Status tracking, completion timestamps

### **Comment**
- Properties: commentId, expenseId, userId, text, createdAt
- Relationships: Enables discussion on expenses
- Features: Chronologically sorted, linked to expenses

### **TransactionHistory**
- Properties: transactionId, fromUserId, toUserId, amount, type (EXPENSE/PAYMENT), expenseId, paymentId, createdAt
- Relationships: Complete audit trail of all transactions
- Features: Supports filtering by type, user, period

## 6. Key Features

### **1. Multi-User Profile Management**
- Register with email and phone validation
- Manage profile details (name, phone, image)
- View user profiles across system
- Authentication via email

### **2. Flexible Group Management**
- Create groups with description
- Invite multiple members to groups
- Role-based access (ADMIN can manage members and settings)
- Soft delete preserves expense history
- Support multiple groups per user

### **3. Advanced Expense Recording**
- Four flexible split methods:
  - **EQUAL**: Amount divided equally among all participants
  - **PROPORTIONAL**: Split by proportion values (e.g., 1:2:3)
  - **PERCENTAGE**: Split by percentages (must sum to 100%)
  - **EXACT**: Individual exact amounts (must sum to total)
- Categorization (FOOD, TRAVEL, ENTERTAINMENT, UTILITIES, OTHER)
- Description tracking for all expenses
- Update capabilities with timestamp tracking

### **4. Automatic Calculation**
- System automatically calculates each participant's share
- Real-time balance updates across groups
- Per-user total balance calculation
- Group balance matrix showing who owes whom

### **5. Settlement Optimization Algorithm**
- **Problem**: User owes person A ₹100 and person B owes user ₹100 (requires 2 transactions)
- **Solution**: Optimize to 0 transactions (circular debt elimination)
- **Algorithm**: Greedy approach to minimize total payment transactions
- **Complexity**: O(n log n) where n = number of participants
- Identifies minimum payments needed to settle all debts

### **6. Real-Time Balance Tracking**
- Per-user total balance (across all groups)
- Group-specific balance matrix
- Balance calculation from Expense + ExpenseSplit records (not denormalized)
- Always accurate, no stale data

### **7. One-to-One Payments**
- Settle debts directly between users
- Track payment status (PENDING/COMPLETED)
- Payment method recording (CASH, etc.)
- Completion timestamps

### **8. Transaction History & Audit Trail**
- Complete history of all expenses and payments
- Filter by user, transaction type, time period
- Links back to original expense or payment
- Chronological sorting for analysis

### **9. Collaborative Comments**
- Add comments to expenses for discussion
- View all comments on an expense
- Comment history with creator info

### **10. Multi-Group Support**
- Users can be members of multiple groups simultaneously
- Independent balance tracking per group
- Separate expense management per group
- Cross-group balance visibility

## 7. Sample Test Data

When the system starts, `SetupService` automatically loads:

### **Users (4 total)**
- Rajesh Kumar (rajesh@email.com)
- Priya Singh (priya@email.com)
- Amit Patel (amit@email.com)
- Kavya Sharma (kavya@email.com)

### **Groups (2 total)**
- **Friends Trip**: Goa trip with Rajesh, Priya, Amit
- **Apartment Rent**: Shared apartment with Priya, Amit, Kavya

### **Expenses (5 total)**
- Group 1: Hotel (₹3000 equal split)
- Group 1: Food (₹1200 equal split)
- Group 1: Entertainment (₹600 equal split)
- Group 2: Monthly Rent (₹15000 equal split)
- Group 2: Internet & Utilities (₹2000 equal split)

### **Sample Balances After Setup**
- Rajesh: Owes ₹1000 to Priya + ₹400 to Amit
- Priya: Owes ₹7500 to Amit + ₹1666.67 to Kavya
- Amit: Owes ₹8333.33 to Kavya
- Kavya: Owes nobody

## 8. Installation & Setup

### **Prerequisites**
- Node.js 18+
- npm 8+
- TypeScript 5.0+

### **Installation Steps**

```bash
# 1. Navigate to project directory
cd LLD/splitwise

# 2. Install dependencies
npm install

# 3. Build TypeScript to JavaScript
npm run build

# 4. Run the application
npm run dev
```

### **Running the Application**

```bash
# Using ts-node (direct TypeScript execution)
npm run dev

# Or build and run JavaScript
npm run start
```

## 9. Testing Scenarios

### **Scenario 1: Create Group and Record Expense**
1. Register 3 users (Alice, Bob, Charlie)
2. Create group "Trip"
3. Alice pays ₹3000 for hotel, split equally among 3 → Each owes ₹1000
4. Bob pays ₹1500 for food, split equally → Each owes ₹500
5. **Balances**: Alice: -₹1500, Bob: -₹1000, Charlie: +₹2500

### **Scenario 2: Settlement Optimization**
1. Alice owes Bob ₹1000
2. Bob owes Charlie ₹1000
3. Charlie owes Alice ₹500
4. **Without Optimization**: 3 transactions (A→B, B→C, C→A)
5. **With Optimization**: 1 transaction (A→C for ₹500, circular debt eliminated)

### **Scenario 3: Multiple Split Methods**
- **Equal Split**: ₹1200 among 4 people → ₹300 each
- **Proportional**: ₹1000 with ratios 1:2:3 → ₹166.67, ₹333.33, ₹500
- **Percentage**: ₹2000 with 25%:50%:25% → ₹500, ₹1000, ₹500
- **Exact Amount**: ₹1000 with ₹300, ₹400, ₹300 → Verified sum equals total

### **Scenario 4: Group Balance Matrix**
1. Create group with 3 members
2. Record 3 expenses with different payers
3. View balance matrix:
   - Shows everyone who owes whom in the group
   - Used for settlement optimization
   - Identifies circular debts

### **Scenario 5: Transaction History for Audit**
1. Record expense
2. Make payment
3. View complete history:
   - All expenses logged
   - All payments logged
   - Timestamps preserved
   - Links to original records

## 10. Validation Rules

### **User Validation**
- Email: Must be valid format (contains @ and domain)
- Phone: Must be 10-digit numeric
- Name: Non-empty string
- Profile: Unique email across system

### **Group Validation**
- Group name: Non-empty string
- Members: Must be registered users
- Duplicate prevention: One user cannot join same group twice

### **Expense Validation**
- Amount: Must be positive number
- Description: Non-empty string
- Participants: All must be group members
- Split values:
  - EQUAL: Automatically divided
  - PROPORTIONAL: All proportions must be > 0
  - PERCENTAGE: Must sum to exactly 100%
  - EXACT: Must sum to total amount

### **Payment Validation**
- Amount: Must be positive, <= outstanding balance
- Users: From and To must be different
- Status: Only PENDING payments can be completed

### **Comment Validation**
- Text: Non-empty string
- Expense: Must exist
- User: Must be group member

## 11. Algorithms & Calculations

### **Balance Calculation Formula**
```
For each user in group:
  balance = 0
  
  // Amount they paid for others
  for each expense where user is payer:
    balance += expense.amount
  
  // Amount they owe from their shares
  for each ExpenseSplit for user:
    balance -= split.amount
  
  // For one-to-one payments
  for each payment sent:
    balance += payment.amount
  
  return balance (positive = they're owed, negative = they owe)
```

### **Settlement Optimization Algorithm**
```
Input: List of user balances (positive = owed money, negative = owes money)
Output: Minimum list of payments to settle all debts

1. Create debtors list (negative balance users)
2. Create creditors list (positive balance users)

3. While both lists not empty:
   - Get top debtor (most negative) and creditor (most positive)
   - Payment amount = min(debtor amount, creditor amount)
   - Record payment from debtor to creditor
   - Reduce both amounts
   - Remove if settled (≈ 0)
   
4. Return payment list

Result: Minimizes number of transactions (proven greedy algorithm)
```

### **Split Calculation Methods**
```
EQUAL:         amount / participant_count
PROPORTIONAL:  (proportion / total_proportions) * amount
PERCENTAGE:    (percentage / 100) * amount
EXACT:         verify sum == amount, then use exact values
```

## 12. Security Features

### **Data Validation**
- All user inputs validated at service layer
- Email/phone format validated before storage
- Amount calculations validate for arithmetic accuracy
- Status transitions validated for legality

### **Role-Based Access Control**
- ADMIN: Can add/remove group members, manage settings
- MEMBER: Can view group, add expenses, comment
- Enforced at service layer

### **Financial Security**
- Cannot create payment more than outstanding balance
- Refund calculations automatic (no manual override)
- Transaction history immutable (append-only)
- Balance calculations always from source data (not cached)

### **Data Integrity**
- InMemoryDatabase Singleton ensures single source of truth
- No duplicate group memberships for same user
- Expense splits must account for total amount
- Soft delete preserves historical data

## 13. Potential Enhancements

### **1. Persistent Database**
- Replace in-memory storage with MongoDB/PostgreSQL
- Implement database transactions for ACID compliance
- Add data backup and recovery mechanisms
- Implement audit logging for all operations

### **2. Email Notifications**
- Send confirmation email after expense recorded
- Send reminder for outstanding payments
- Send notification when settled
- Bulk notification summaries weekly/monthly

### **3. Mobile App**
- Develop iOS/Android native apps
- QR code to join groups
- Push notifications for payments
- Camera receipt scanning for expenses

### **4. Advanced Reporting**
- Expense analytics (spending by category, time trend)
- User spending patterns (who spends most on what)
- Group financial reports (total spent, per person)
- Debt settlement timeline predictions

### **5. Recurring Expenses**
- Set up monthly/weekly recurring expenses
- Automatic split calculation on schedule
- Skip or override individual occurrences
- Template-based expense creation

### **6. Advanced Split Methods**
- Item-based splitting (assign items to specific people)
- Weighted splits based on consumption
- Debt priority (settle oldest debts first)
- Currency conversion for international trips

### **7. Social Features**
- Friend connections and groups discovery
- Social sharing of group expenses
- Activity feed for groups
- User profiles with statistics

### **8. Budget Tracking**
- Set spending limits per group/category
- Budget alerts when approaching limits
- Spending analytics vs budget
- Detailed spending breakdowns

### **9. Payment Integration**
- Integration with UPI/PayPal for automatic payment
- Payment request links
- Payment reminders with escalation
- Blockchain-based settlement tracking

### **10. Machine Learning**
- Category prediction based on expense description
- Anomaly detection for unusual spending
- Smart split recommendations based on history
- Predictive balance calculations

## 14. Conclusion

The Splitwise System demonstrates a complete end-to-end implementation of a complex financial application. It showcases:

- **Advanced Algorithms** - Settlement optimization using graph theory
- **Complex Data Relationships** - Multiple levels of entity relationships (Users → Groups → Expenses → Splits)
- **Financial Accuracy** - Precise balance calculations with no rounding errors
- **Scalable Architecture** - Clean separation of concerns across layers
- **Flexible Design** - Multiple split methods, categories, and transaction types
- **User-Centric Features** - Comments, history, real-time balances
- **Production-Ready Patterns** - Singleton, Repository, Factory, Strategy patterns

The system is production-ready and can serve as a reference implementation for payment platforms, expense-sharing applications, and group financial management systems.
