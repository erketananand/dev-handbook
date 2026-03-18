### Requirements:

> **Theater & Location**

1. System should support **multiple cities**
2. Each city can have **multiple theaters**
3. Each theater contains **multiple screens (halls)**

> **Movies & Shows**

4. System should support **multiple movies**
5. Each movie can run in **multiple theaters and screens**
6. Each movie can have **multiple showtimes**
7. Each show is tied to:
   * One movie
   * One screen
   * One time slot

> **User Actions**

8. Users should be able to:
   * Browse movies by city/theater
   * View show timings
   * Select a show
   * View available seats
   * Select seats
   * Book tickets

> **Seat Management**

9. Each screen has a **fixed seat layout**
10. System should support **different seat types**:
    * Regular
    * VIP
    * Premium
11. Seat availability should be tracked **per show**
12. Prevent **double booking of seats**

> **Booking System**

13. Users can create a booking for one or more seats
14. Each booking should store:
    * Selected seats
    * Show details
    * Total price
15. Booking statuses:
    * Pending
    * Confirmed
    * Cancelled

> **Payment**

16. System should support **payment processing**
17. Payment statuses:
    * Success
    * Failed
    * Pending
18. Booking should only be confirmed after successful payment

> **Booking Lifecycle**

19. Track booking states:
    * Seat selection → Pending → Payment → Confirmed
20. Allow booking cancellation (optional refund handling)

### Schema:

> **City**

| Column  | Type    | Constraints |
| ------- | ------- | ----------- |
| city_id | INT     | PK          |
| name    | VARCHAR | NOT NULL    |
| state   | VARCHAR |             |
| country | VARCHAR |             |

> **Theater**

| Column     | Type    | Constraints        |
| ---------- | ------- | ------------------ |
| theater_id | INT     | PK                 |
| name       | VARCHAR | NOT NULL           |
| address    | VARCHAR |                    |
| city_id    | INT     | FK → City(city_id) |

> **Screen (Hall)**

| Column      | Type    | Constraints              |
| ----------- | ------- | ------------------------ |
| screen_id   | INT     | PK                       |
| theater_id  | INT     | FK → Theater(theater_id) |
| name        | VARCHAR |                          |
| total_seats | INT     |                          |

> **Movie**

| Column           | Type    | Constraints |
| ---------------- | ------- | ----------- |
| movie_id         | INT     | PK          |
| title            | VARCHAR | NOT NULL    |
| duration_minutes | INT     |             |
| language         | VARCHAR |             |
| genre            | VARCHAR |             |
| release_date     | DATE    |             |

> **Show (Showtime)**

| Column     | Type     | Constraints            |
| ---------- | -------- | ---------------------- |
| show_id    | INT      | PK                     |
| movie_id   | INT      | FK → Movie(movie_id)   |
| screen_id  | INT      | FK → Screen(screen_id) |
| start_time | DATETIME | NOT NULL               |
| end_time   | DATETIME | NOT NULL               |
| price_base | DECIMAL  |                        |

> **Seat**

| Column      | Type    | Constraints                   |
| ----------- | ------- | ----------------------------- |
| seat_id     | INT     | PK                            |
| screen_id   | INT     | FK → Screen(screen_id)        |
| row_number  | VARCHAR |                               |
| seat_number | INT     |                               |
| seat_type   | ENUM    | ('REGULAR', 'VIP', 'PREMIUM') |

> **Show_Seat (Inventory)**

| Column       | Type    | Constraints                        |
| ------------ | ------- | ---------------------------------- |
| show_seat_id | INT     | PK                                 |
| show_id      | INT     | FK → Show(show_id)                 |
| seat_id      | INT     | FK → Seat(seat_id)                 |
| status       | ENUM    | ('AVAILABLE', 'BOOKED', 'BLOCKED') |
| price        | DECIMAL |                                    |

> **User**

| Column  | Type    | Constraints |
| ------- | ------- | ----------- |
| user_id | INT     | PK          |
| name    | VARCHAR |             |
| email   | VARCHAR | UNIQUE      |
| phone   | VARCHAR |             |

> **Booking**

| Column       | Type     | Constraints                           |
| ------------ | -------- | ------------------------------------- |
| booking_id   | INT      | PK                                    |
| user_id      | INT      | FK → User(user_id)                    |
| show_id      | INT      | FK → Show(show_id)                    |
| booking_time | DATETIME |                                       |
| status       | ENUM     | ('CONFIRMED', 'CANCELLED', 'PENDING') |
| total_amount | DECIMAL  |                                       |

> **Booking_Seat**

| Column          | Type | Constraints                  |
| --------------- | ---- | ---------------------------- |
| booking_seat_id | INT  | PK                           |
| booking_id      | INT  | FK → Booking(booking_id)     |
| show_seat_id    | INT  | FK → Show_Seat(show_seat_id) |

> **Payment**

| Column           | Type     | Constraints                      |
| ---------------- | -------- | -------------------------------- |
| payment_id       | INT      | PK                               |
| booking_id       | INT      | FK → Booking(booking_id)         |
| amount           | DECIMAL  |                                  |
| payment_method   | VARCHAR  |                                  |
| status           | ENUM     | ('SUCCESS', 'FAILED', 'PENDING') |
| transaction_time | DATETIME |                                  |

> **Relationship Summary (Quick View)**

| Relationship           | Type  |
| ---------------------- | ----- |
| City → Theater         | 1 : N |
| Theater → Screen       | 1 : N |
| Screen → Seat          | 1 : N |
| Movie → Show           | 1 : N |
| Screen → Show          | 1 : N |
| Show → Show_Seat       | 1 : N |
| User → Booking         | 1 : N |
| Booking → Booking_Seat | 1 : N |

### Frequent Queries

1. Search movies by city
2. Get theaters + shows for a movie
3. Fetch available seats for a show
4. Lock seats during booking
5. Get user bookings
6. Payment lookup
7. Prevent double booking

#### Indexing Strategy (Table-wise)

> **City**

```sql
CREATE INDEX idx_city_name ON City(name);
```

👉 Fast lookup when user selects city

> **Theater**

```sql
CREATE INDEX idx_theater_city ON Theater(city_id);
```

👉 Query: “theaters in a city”

> **Screen**

```sql
CREATE INDEX idx_screen_theater ON Screen(theater_id);
```

> **Movie**

```sql
CREATE INDEX idx_movie_title ON Movie(title);
CREATE INDEX idx_movie_release ON Movie(release_date);
```

👉 Search + sorting (latest movies)

> **Show (VERY IMPORTANT 🔥)**

```sql
CREATE INDEX idx_show_movie ON Show(movie_id);
CREATE INDEX idx_show_screen ON Show(screen_id);
CREATE INDEX idx_show_time ON Show(start_time);
CREATE INDEX idx_show_movie_city_time 
ON Show(movie_id, start_time);
```

👉 Covers:
  * movie → shows
  * time-based filtering
  * “movies in city today”

💡 Advanced:
  * Add **covering index**

```sql
CREATE INDEX idx_show_cover 
ON Show(movie_id, screen_id, start_time);
```

> **Seat**

```sql
CREATE INDEX idx_seat_screen ON Seat(screen_id);
```

> **Show_Seat (CRITICAL TABLE 🚨)**

```sql
CREATE INDEX idx_show_seat_show ON Show_Seat(show_id);
CREATE INDEX idx_show_seat_status ON Show_Seat(status);
```

> **Composite Index (MOST IMPORTANT)**

```sql
CREATE INDEX idx_show_seat_show_status 
ON Show_Seat(show_id, status);
```

👉 Query:

```sql
SELECT * FROM Show_Seat 
WHERE show_id = ? AND status = 'AVAILABLE';
```

⚡ This index is used in **every booking**

> **Prevent Double Booking**

```sql
CREATE UNIQUE INDEX uniq_show_seat 
ON Show_Seat(show_id, seat_id);
```

> **User**

```sql
CREATE UNIQUE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_phone ON User(phone);
```

> **Booking**

```sql
CREATE INDEX idx_booking_user ON Booking(user_id);
CREATE INDEX idx_booking_show ON Booking(show_id);
CREATE INDEX idx_booking_status ON Booking(status);
```

**Composite:**

```sql
CREATE INDEX idx_booking_user_time 
ON Booking(user_id, booking_time DESC);
```

👉 Fetch user booking history fast

> **Booking_Seat**

```sql
CREATE INDEX idx_booking_seat_booking ON Booking_Seat(booking_id);
CREATE INDEX idx_booking_seat_showseat ON Booking_Seat(show_seat_id);
```

> **Payment**

```sql
CREATE INDEX idx_payment_booking ON Payment(booking_id);
CREATE INDEX idx_payment_status ON Payment(status);
```

#### Query-Level Optimizations

> **Fetch Shows by City + Movie**

Instead of joins every time:

👉 Add **denormalization**

```sql
ALTER TABLE Show ADD city_id INT;
CREATE INDEX idx_show_city_movie ON Show(city_id, movie_id);
```

⚡ Avoids:

```
Show → Screen → Theater → City (4 joins ❌)
```

> **Seat Availability Optimization**

❌ Avoid:

```sql
SELECT * FROM Show_Seat WHERE show_id = ?
```

✅ Use:

```sql
SELECT seat_id FROM Show_Seat 
WHERE show_id = ? AND status = 'AVAILABLE';
```

👉 Uses composite index

> **Pagination (VERY IMPORTANT)**

```sql
SELECT * FROM Show
WHERE movie_id = ?
ORDER BY start_time
LIMIT 20 OFFSET 0;
```

👉 Needs:

```sql
(movie_id, start_time) index
```

> **Concurrency Control (HOT TOPIC)**

**Option 1: Pessimistic Locking**

```sql
SELECT * FROM Show_Seat 
WHERE show_seat_id IN (...) 
FOR UPDATE;
```

**Option 2: Optimistic Locking**

```sql
UPDATE Show_Seat
SET status = 'BOOKED'
WHERE show_seat_id = ?
AND status = 'AVAILABLE';
```

👉 Check affected rows = success/failure

#### Advanced Optimizations (Senior-Level)

> **1. Caching (Redis)**

Cache:

  * Movie list per city
  * Show list per movie
  * Seat map (short TTL)

> **2. Partitioning**

Show_Seat Table (Huge Table 🚨) so, `PARTITION BY HASH(show_id);`

> **3. Read Replicas**

  * Reads → replicas
  * Writes → primary

> **4. TTL for BLOCKED Seats**

  * Auto-release seats after 5 mins

> **Covering Index Example**

```sql
CREATE INDEX idx_showseat_cover 
ON Show_Seat(show_id, status, seat_id);
```

👉 Avoid table lookup entirely

#### Interview Takeaways (Say This 💯)

* “I use **composite indexes on (show_id, status)**for seat availability”
* “I enforce **unique constraint on (show_id, seat_id)**to prevent double booking”
* “I denormalize city_id into Show to reduce joins”
* “I use **optimistic locking**for high concurrency”
* “I cache seat maps and show listings using Redis”
* “I partition Show_Seat since it's the largest table”


