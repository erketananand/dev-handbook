## Requirements
- User can enquire about balance and mini-statement
- User can withdraw balance
- User can deposit balance
- User can update pin
- ATM manage cash dispense and deposit to track the current state of cash in the ATM
- ATM does user authentication via it's card & pin

## Core Entities
- **ATM:** Main class for ATM operations; interacts with `BankingService` and `CashDispenser`.
- **Card:** Represents an ATM card with card number and PIN. Card will have accountId to know this card belongs to which account.
- **Account:** Represents a bank account with account number and balance; supports debit and credit operations.
- **Transaction (abstract):** Base class for transactions; extended by `WithdrawalTransaction` and `DepositTransaction`.
- **WithdrawalTransaction / DepositTransaction:** Concrete transaction types for withdrawal and deposit.
- **BankingService:** Manages bank accounts and processes transactions; uses thread-safe data structures.
- **CashDispenser:** Manages the ATM's cash inventory and handles dispensing.