## ATM System - Database Schema

### Table: Account

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique account identifier (UUID)         |
| account_number| VARCHAR(20)  | NOT NULL, UNIQUE       | Bank account number                      |
| balance       | DECIMAL(15,2)| NOT NULL, CHECK >= 0   | Current account balance                  |
| account_status| VARCHAR(20)  | NOT NULL, DEFAULT 'ACTIVE' | Account status: ACTIVE, FROZEN, CLOSED |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `account_number`

---

### Table: Card

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique card identifier (UUID)            |
| card_number   | VARCHAR(20)  | NOT NULL, UNIQUE       | Card number (masked in display)          |
| account_id    | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Account.id                    |
| pin           | VARCHAR(64)  | NOT NULL               | Hashed PIN (for authentication)          |
| card_status   | VARCHAR(20)  | NOT NULL, DEFAULT 'ACTIVE' | Card status: ACTIVE, BLOCKED, EXPIRED  |
| expiry_date   | DATE         | NOT NULL               | Card expiry date                         |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `card_number`
- FOREIGN KEY: `account_id` REFERENCES `Account(id)` ON DELETE CASCADE
- INDEX on `account_id`

---

### Table: Transaction

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique transaction identifier (UUID)     |
| account_id       | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Account.id                    |
| transaction_type | VARCHAR(20)  | NOT NULL               | Type: WITHDRAWAL, DEPOSIT, PIN_CHANGE   |
| amount           | DECIMAL(15,2)| NOT NULL, CHECK > 0    | Transaction amount                       |
| balance_after    | DECIMAL(15,2)| NOT NULL               | Account balance after transaction        |
| status           | VARCHAR(20)  | NOT NULL               | Status: SUCCESS, FAILED, CANCELLED       |
| description      | VARCHAR(255) | NULLABLE               | Transaction description/notes            |
| atm_id           | VARCHAR(20)  | NULLABLE               | ATM machine identifier                   |
| attempt_count    | INTEGER      | NOT NULL, DEFAULT 0    | Number of attempts for transaction       |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Transaction datetime                     |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `account_id` REFERENCES `Account(id)` ON DELETE CASCADE
- INDEX on (`account_id`, `created_at`)
- INDEX on (`transaction_type`, `created_at`)

---

### Table: ATM

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique ATM identifier (UUID)             |
| atm_id        | VARCHAR(20)  | NOT NULL, UNIQUE       | Physical ATM machine identifier          |
| location      | VARCHAR(255) | NOT NULL               | ATM location/address                     |
| cash_balance  | DECIMAL(15,2)| NOT NULL, CHECK >= 0   | Total cash available in ATM              |
| atm_status    | VARCHAR(20)  | NOT NULL, DEFAULT 'OPERATIONAL' | Status: OPERATIONAL, MAINTENANCE, OUT_OF_SERVICE |
| max_cash      | DECIMAL(15,2)| NOT NULL               | Maximum cash capacity of ATM             |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `atm_id`

---

### Table: CashInventory

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique inventory identifier (UUID)       |
| atm_id        | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References ATM.id                        |
| denomination  | INTEGER      | NOT NULL               | Denomination (e.g., 100, 500, 2000)     |
| quantity      | INTEGER      | NOT NULL, CHECK >= 0   | Number of notes available                |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`atm_id`, `denomination`)
- FOREIGN KEY: `atm_id` REFERENCES `ATM(id)` ON DELETE CASCADE

---

### Table: SessionLog

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique session identifier (UUID)         |
| card_id       | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Card.id                       |
| atm_id        | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References ATM.id                        |
| login_time    | TIMESTAMP    | NOT NULL               | Session login timestamp                  |
| logout_time   | TIMESTAMP    | NULLABLE               | Session logout timestamp                 |
| session_status| VARCHAR(20)  | NOT NULL               | Status: ACTIVE, CLOSED, TIMEOUT          |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `card_id` REFERENCES `Card(id)` ON DELETE CASCADE
- FOREIGN KEY: `atm_id` REFERENCES `ATM(id)`
- INDEX on (`card_id`, `login_time`)

---

### Table: FailedLoginAttempt

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique attempt identifier (UUID)         |
| card_id       | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Card.id                       |
| atm_id        | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References ATM.id                        |
| attempt_count | INTEGER      | NOT NULL, DEFAULT 1    | Consecutive failed attempts              |
| blocked_until | TIMESTAMP    | NULLABLE               | Timestamp until card is blocked          |
| attempted_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Attempt timestamp                        |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `card_id` REFERENCES `Card(id)` ON DELETE CASCADE
- FOREIGN KEY: `atm_id` REFERENCES `ATM(id)`
- INDEX on `card_id`
- INDEX on (`card_id`, `attempted_at`)
