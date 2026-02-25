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
### Real Production Architecture
In real booking systems muulti-layers safety/locking added to avoid double booking
- Redis → Temporary seat hold
- Database transaction → Final booking
- Unique constraint → Absolute protection.
