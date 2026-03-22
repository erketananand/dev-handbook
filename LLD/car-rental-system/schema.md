## Car Rental System - Database Schema

### Table: Customer

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique customer identifier (UUID)        |
| name          | VARCHAR(100) | NOT NULL               | Customer full name                       |
| email         | VARCHAR(150) | NOT NULL, UNIQUE       | Email address                            |
| phone         | VARCHAR(20)  | NOT NULL               | Contact phone number                     |
| driver_license| VARCHAR(50)  | NOT NULL, UNIQUE       | Driver's license number                  |
| license_expiry| DATE         | NOT NULL               | License expiry date                      |
| address       | VARCHAR(255) | NOT NULL               | Customer address                         |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- UNIQUE INDEX on `driver_license`

---

### Table: Car

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique car identifier (UUID)             |
| license_plate | VARCHAR(20)  | NOT NULL, UNIQUE       | Vehicle registration plate number        |
| brand         | VARCHAR(50)  | NOT NULL               | Car brand (e.g., Mercedes, BMW, Audi)    |
| model         | VARCHAR(50)  | NOT NULL               | Car model name                           |
| year          | INTEGER      | NOT NULL, CHECK >= 2000| Manufacturing year                       |
| car_type      | VARCHAR(20)  | NOT NULL               | Type: SEDAN, SUV, HATCHBACK, VAN         |
| fuel_type     | VARCHAR(20)  | NOT NULL               | Type: PETROL, DIESEL, HYBRID, ELECTRIC   |
| seat_capacity | INTEGER      | NOT NULL, CHECK > 0    | Number of seats                          |
| color         | VARCHAR(30)  | NOT NULL               | Car color                                |
| base_price    | DECIMAL(10,2)| NOT NULL, CHECK > 0    | Base rental price per day                |
| mileage       | INTEGER      | NOT NULL, DEFAULT 0    | Current mileage in kilometers            |
| status        | VARCHAR(20)  | NOT NULL, DEFAULT 'AVAILABLE' | Status: AVAILABLE, BOOKED, MAINTENANCE, RETIRED |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `license_plate`
- INDEX on `status`
- INDEX on (`car_type`, `fuel_type`)

---

### Table: Reservation

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique reservation identifier (UUID)     |
| reservation_num  | VARCHAR(20)  | NOT NULL, UNIQUE       | Human-readable reservation number        |
| customer_id      | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Customer.id                   |
| car_id           | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Car.id                        |
| start_date       | TIMESTAMP    | NOT NULL               | Rental start datetime                    |
| end_date         | TIMESTAMP    | NOT NULL               | Rental end datetime                      |
| pickup_location  | VARCHAR(255) | NOT NULL               | Pickup location                          |
| dropoff_location | VARCHAR(255) | NOT NULL               | Drop-off location                        |
| status           | VARCHAR(20)  | NOT NULL               | Status: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED |
| total_price      | DECIMAL(10,2)| NOT NULL               | Total rental price                       |
| num_days         | INTEGER      | NOT NULL, CHECK > 0    | Number of rental days                    |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `reservation_num`
- FOREIGN KEY: `customer_id` REFERENCES `Customer(id)` ON DELETE CASCADE
- FOREIGN KEY: `car_id` REFERENCES `Car(id)`
- INDEX on `status`
- INDEX on (`start_date`, `end_date`)
- INDEX on (`customer_id`, `created_at`)

---

### Table: Payment

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique payment identifier (UUID)         |
| reservation_id   | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Reservation.id                |
| payment_method   | VARCHAR(20)  | NOT NULL               | Method: CREDIT_CARD, DEBIT_CARD, UPI, WALLET |
| amount           | DECIMAL(10,2)| NOT NULL, CHECK > 0    | Payment amount                           |
| status           | VARCHAR(20)  | NOT NULL               | Status: PENDING, SUCCESSFUL, FAILED, REFUNDED |
| transaction_id   | VARCHAR(100) | NULLABLE               | Transaction ID from payment gateway      |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Payment datetime                         |
| processed_at     | TIMESTAMP    | NULLABLE               | Payment processing datetime              |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `reservation_id` REFERENCES `Reservation(id)` ON DELETE CASCADE
- INDEX on `status`
- INDEX on `created_at`

---

### Table: Vehicle_Maintenance

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique maintenance record identifier     |
| car_id        | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Car.id                        |
| maintenance_type| VARCHAR(50) | NOT NULL               | Type: OIL_CHANGE, TIRE_ROTATION, REPAIR  |
| description   | VARCHAR(255) | NOT NULL               | Maintenance description                  |
| cost          | DECIMAL(10,2)| NOT NULL               | Maintenance cost                         |
| start_date    | TIMESTAMP    | NOT NULL               | Maintenance start datetime               |
| end_date      | TIMESTAMP    | NULLABLE               | Maintenance completion datetime          |
| status        | VARCHAR(20)  | NOT NULL               | Status: SCHEDULED, IN_PROGRESS, COMPLETED |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `car_id` REFERENCES `Car(id)` ON DELETE CASCADE
- INDEX on `status`
- INDEX on (`car_id`, `start_date`)

---

### Table: Rental_Location

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique location identifier (UUID)        |
| name          | VARCHAR(100) | NOT NULL               | Location name                            |
| address       | VARCHAR(255) | NOT NULL, UNIQUE       | Location address                         |
| city          | VARCHAR(50)  | NOT NULL               | City name                                |
| phone         | VARCHAR(20)  | NOT NULL               | Contact phone                            |
| operating_hours| VARCHAR(50) | NOT NULL               | Operating hours (e.g., 09:00-18:00)      |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `address`
- INDEX on `city`

---

### Table: Insurance

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique insurance record identifier       |
| reservation_id   | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Reservation.id                |
| insurance_type   | VARCHAR(50)  | NOT NULL               | Type: BASIC, PREMIUM, FULL_COVERAGE      |
| premium_amount   | DECIMAL(10,2)| NOT NULL               | Insurance premium cost                   |
| coverage_limit   | DECIMAL(15,2)| NOT NULL               | Maximum coverage amount                  |
| deductible       | DECIMAL(10,2)| NOT NULL               | Deductible amount                        |
| status           | VARCHAR(20)  | NOT NULL               | Status: ACTIVE, CLAIMED, EXPIRED         |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY: `reservation_id` REFERENCES `Reservation(id)` ON DELETE CASCADE
- INDEX on `status`
