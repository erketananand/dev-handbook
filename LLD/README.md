[Avoid double booking in Distributed System](https://github.com/erketananand/dev-handbook/tree/main/LLD#avoid-double-booking-in-distributed-system)

[How to Prevent Double Payment](https://github.com/erketananand/dev-handbook/edit/main/LLD/README.md#how-to-prevent-double-payment)

# Avoid double booking in Distributed System
Node.js is single-threaded per process(app instance), but in production we usually run:
 - Multiple Node.js instances (cluster mode, PM2, Docker, Kubernetes) behind a load balancer
 - Now multiple instances can try to book the same seat at the same time
### Steps:
1. DB Locking as all app instances share the same database
    - Add `UNIQUE` constraint on (system_id, seat_number)
      > _system_id could be show_id(BookMyShow), train_id(IRCTC), flight_id(Indigo), bus_id(RedBus)_  
      > If two instances try booking the same seat, one insert succeeds and the second fails with a unique constraint error. **Problem solved at the database level**.
    - Use DB transaction with `SELECT ... FOR UPDATE`
      > If another instance tries the same seat: *It waits until the first transaction finishes* and **Prevents race condition**
    - Optimistic Locking (High Scale Systems)
      >  Add a version column: `seat_id | show_id | seat_number | is_booked | version`  
         Update with condition:
         ```sql
          UPDATE seats
          SET is_booked = true, version = version + 1
          WHERE seat_id = 1 AND version = 3;
        ```
        > If 0 rows updated → someone else already booked it. Used in high-scale distributed systems.
2. Distributed Locking (Redis Based)
    - Used to hold seat during payment and to prevent ghost locking
    - If we want temporary locking during checkout then we should use Redis with
      - Redlock algorithm
      - SETNX pattern
      ```
      1. User selects seat
      2. Create Redis lock with expiry (5 mins)
      3. If payment successful → confirm booking
      4. If timeout → release lock
      ```
### Core Idea
In real booking systems muulti-layers safety/locking added to avoid double booking
- Redis → Temporary seat hold
- Database transaction → Final booking
- Unique constraint → Absolute protection.

---

# How to Prevent Double Payment

### 1️⃣ Use Idempotency Key
- Generate a unique `payment_attempt_id` and send it to the gateway (supported by Stripe, Razorpay).
- If the same request is retried, the gateway returns the same result instead of charging again.

### 2️⃣ Add Unique Constraint in DB
- Add `UNIQUE(booking_id)` or `UNIQUE(transaction_id)` in our payments table.
- Even if two instances process the same payment, the database blocks duplicates.

### 3️⃣ Make Webhook Idempotent
- Gateways may send success webhooks multiple times.
- Before marking payment SUCCESS, check if it’s already processed — if yes, ignore.

### 4️⃣ Use Database Transaction
- Mark `payment SUCCESS` and `Confirm booking` in one transaction so partial updates don’t happen.

### 5️⃣ Use Proper Payment States
- Instead of `isPaid = true`, use states like: `INITIATED → SUCCESS → FAILED → REFUNDED`
- This helps handle retries safely.

### 6️⃣ Verify Gateway Signature
- Always validate webhook signature to prevent fake or replayed payment confirmations.

### 7️⃣ Never Trust Client-Side Success
- Confirm payment only via server-side verification or webhook.

### Core Idea

**Idempotency + DB constraint + Transaction = No double payment.**

---

