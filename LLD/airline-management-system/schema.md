## Airline Management System - Database Schema

### Table: Passenger

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique passenger identifier (UUID)       |
| name          | VARCHAR(100) | NOT NULL               | Full name of the passenger               |
| email         | VARCHAR(150) | NOT NULL, UNIQUE       | Email address                            |
| phone         | VARCHAR(20)  | NOT NULL               | Contact phone number                     |
| passport_no   | VARCHAR(50)  | NULLABLE               | Passport number for international travel |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

### Table: Aircraft

| Column Name    | Data Type    | Constraints            | Description                              |
|----------------|--------------|------------------------|------------------------------------------|
| id             | VARCHAR(36)  | PRIMARY KEY            | Unique aircraft identifier (UUID)        |
| registration   | VARCHAR(20)  | NOT NULL, UNIQUE       | Aircraft registration number (e.g., VT-AXB) |
| model          | VARCHAR(100) | NOT NULL               | Aircraft model (e.g., Boeing 737, A320)  |
| total_seats    | INTEGER      | NOT NULL, CHECK > 0    | Total number of seats on the aircraft    |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `registration`

### Table: Seat

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique seat identifier (UUID)            |
| aircraft_id   | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Aircraft.id                   |
| seat_number   | VARCHAR(10)  | NOT NULL               | Seat number (e.g., 12A, 14C)             |
| seat_class    | VARCHAR(20)  | NOT NULL               | Seat class: ECONOMY, BUSINESS, FIRST     |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`aircraft_id`, `seat_number`)
- INDEX on `aircraft_id`
- FOREIGN KEY: `aircraft_id` REFERENCES `Aircraft(id)` ON DELETE CASCADE

### Table: Flight

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique flight identifier (UUID)          |
| flight_number    | VARCHAR(20)  | NOT NULL               | Flight number (e.g., AI-202)             |
| aircraft_id      | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Aircraft.id                   |
| source           | VARCHAR(100) | NOT NULL               | Departure airport/city                   |
| destination      | VARCHAR(100) | NOT NULL               | Arrival airport/city                     |
| departure_time   | TIMESTAMP    | NOT NULL               | Scheduled departure datetime             |
| arrival_time     | TIMESTAMP    | NOT NULL               | Scheduled arrival datetime               |
| status           | VARCHAR(20)  | NOT NULL, DEFAULT 'SCHEDULED' | Flight status: SCHEDULED, BOARDING, DEPARTED, ARRIVED, CANCELLED, DELAYED |
| base_price       | DECIMAL(10,2)| NOT NULL, CHECK >= 0   | Base ticket price                        |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`flight_number`, `aircraft_id`, `source`, `destination`, `departure_time`)
- INDEX on (`source`, `destination`, `departure_time`)
- FOREIGN KEY: `aircraft_id` REFERENCES `Aircraft(id)`

**Constraints:**
- CHECK: `arrival_time > departure_time`

### Table: FlightSeatAvailability

| Column Name   | Data Type    | Constraints            | Description                              |
|---------------|--------------|------------------------|------------------------------------------|
| id            | VARCHAR(36)  | PRIMARY KEY            | Unique record identifier (UUID)          |
| flight_id     | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Flight.id                     |
| seat_id       | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Seat.id                       |
| seat_status   | VARCHAR(20)  | NOT NULL, DEFAULT AVAILABLE | Seat Status: AVAILABLE, OCCUPIED, RESERVED|
| price         | DECIMAL(10,2)| NOT NULL               | Price for this seat on this flight (may differ by class) |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`flight_id`, `seat_id`)
- INDEX on (`flight_id`, `seat_status`)
- FOREIGN KEY: `flight_id` REFERENCES `Flight(id)` ON DELETE CASCADE
- FOREIGN KEY: `seat_id` REFERENCES `Seat(id)` ON DELETE CASCADE

### Table: Booking

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique booking identifier (UUID)         |
| booking_ref      | VARCHAR(20)  | NOT NULL, UNIQUE       | Human-readable booking reference (e.g., PNR) |
| passenger_id     | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Passenger.id (primary passenger) |
| flight_id        | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Flight.id                     |
| seat_id          | VARCHAR(36)  | NULLABLE, FOREIGN KEY  | References Seat.id (NULL if not selected)|
| status           | VARCHAR(20)  | NOT NULL, DEFAULT 'CONFIRMED' | Booking status: CONFIRMED, CANCELLED, RESCHEDULED, PENDING |
| total_amount     | DECIMAL(10,2)| NOT NULL, CHECK >= 0   | Total amount paid                        |
| booked_at        | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Booking creation timestamp               |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `booking_ref`
- FOREIGN KEY: `passenger_id` REFERENCES `Passenger(id)`
- FOREIGN KEY: `flight_id` REFERENCES `Flight(id)`
- FOREIGN KEY: `seat_id` REFERENCES `Seat(id)` ON DELETE SET NULL

### Table: Payment

| Column Name      | Data Type    | Constraints            | Description                              |
|------------------|--------------|------------------------|------------------------------------------|
| id               | VARCHAR(36)  | PRIMARY KEY            | Unique payment identifier (UUID)         |
| booking_id       | VARCHAR(36)  | NOT NULL, FOREIGN KEY  | References Booking.id                    |
| amount           | DECIMAL(10,2)| NOT NULL, CHECK >= 0   | Payment amount                           |
| method           | VARCHAR(30)  | NOT NULL               | Payment method: CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET |
| status           | VARCHAR(20)  | NOT NULL, DEFAULT 'PENDING' | Payment status: PENDING, SUCCESS, FAILED, REFUNDED |
| transaction_id   | VARCHAR(100) | NULLABLE               | External transaction/gateway reference   |
| paid_at          | TIMESTAMP    | NULLABLE               | Timestamp when payment was completed     |
| created_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record creation timestamp                |
| updated_at       | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Record last update timestamp             |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on (`booking_id`, `status`)
- UNIQUE INDEX on `transaction_id` (when NOT NULL)
- FOREIGN KEY: `booking_id` REFERENCES `Booking(id)` ON DELETE CASCADE

## Relationships

### One-to-Many Relationships

1. **Aircraft → Seat**
   - One aircraft has many seats
   - `Seat.aircraft_id` references `Aircraft.id`

2. **Aircraft → Flight**
   - One aircraft is used for many flights
   - `Flight.aircraft_id` references `Aircraft.id`

3. **Flight → FlightSeatAvailability**
   - One flight has many seat availability records
   - `FlightSeatAvailability.flight_id` references `Flight.id`

4. **Seat → FlightSeatAvailability**
   - One seat appears in many flight availability records
   - `FlightSeatAvailability.seat_id` references `Seat.id`

5. **Passenger → Booking**
   - One passenger can have many bookings
   - `Booking.passenger_id` references `Passenger.id`

6. **Flight → Booking**
   - One flight has many bookings
   - `Booking.flight_id` references `Flight.id`

7. **Booking → Payment**
   - One booking has one or more payment records (e.g., refund creates new record)
   - `Payment.booking_id` references `Booking.id`

## Entity Relationship Summary

```
Aircraft (1) ──→ (M) Seat
Aircraft (1) ──→ (M) Flight

Flight  (1) ──→ (M) FlightSeatAvailability ←── (M) Seat
Flight  (1) ──→ (M) Booking

Passenger (1) ──→ (M) Booking

Booking (1) ──→ (1) Seat [assigned seat]
Booking (1) ──→ (M) Payment
```

## Normalization Notes

- **3rd Normal Form (3NF)** achieved
- `FlightSeatAvailability` is a junction table resolving the M:N relationship between `Flight` and `Seat`, and also stores per-flight seat pricing
- Seat availability (`seat_status`) is tracked per flight instance, not per aircraft, allowing the same physical seat to be available on different flights
- `Booking.seat_id` is nullable to support bookings where seat selection is deferred
- Payment records are append-only (new row per transaction) to maintain an audit trail for refunds and retries

## Additional Considerations

### For In-Memory Implementation:
- Use Maps keyed by `id` for O(1) lookups
- Maintain secondary indexes (e.g., by `flight_number`, `booking_ref`) using additional Maps
- Implement seat availability as a `Set<seatId>` per flight for fast availability checks
- Validate CHECK constraints (`arrival_time > departure_time`, non-negative amounts) in application layer

### Future Enhancements:
- Add `Addon` table for meal, baggage, and seat upgrade add-ons per booking
- Add `FlightRoute` table to support multi-hop itineraries
- Add `Waitlist` table for cancelled-seat notifications
- Add `Notification` table for booking confirmations and alerts

Document Version: 1.0
Last Updated: March 21, 2026
