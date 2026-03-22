# Airline Management System - Class Diagram

## ARCHITECTURE OVERVIEW

The system uses a **layered service architecture** instead of a single Facade class:

```
ConsoleInterface (UI)
    ↓
Services: PassengerService | FlightService | BookingService | SetupService
    ↓
Repositories: PassengerRepository | AircraftRepository | FlightRepository | BookingRepository | PaymentRepository
    ↓
InMemoryDatabase (Singleton) — stores Maps + secondary indexes
```

---

## CORE CLASSES

### 1. Passenger
**Attributes:**
- id: string (UUID)
- name: string
- email: string
- phone: string
- passportNumber: string | null
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(name, email, phone, passportNumber?, id?)
- isValid(): boolean
- update(name, email, phone): void
- getDisplayInfo(): string

**Responsibilities:**
- Store passenger contact and identity details
- Validate passenger data

---

### 2. Aircraft
**Attributes:**
- id: string (UUID)
- registration: string
- model: string
- seats: Map<string, Seat>
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(registration, model, id?)
- addSeat(seat: Seat): void
- getSeat(seatId: string): Seat | undefined
- getAllSeats(): Seat[]
- getSeatsByClass(seatClass: SeatClass): Seat[]
- getTotalSeats(): number
- getDisplayInfo(): string

**Responsibilities:**
- Model a physical aircraft with its seat configuration
- Provide seat lookup by ID or class

---

### 3. Seat
**Attributes:**
- id: string (UUID)
- aircraftId: string
- seatNumber: string
- seatClass: SeatClass (enum)

**Methods:**
- constructor(seatNumber, seatClass, aircraftId, id?)
- isValid(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Represent a physical seat on an aircraft
- Store class information (Economy, Business, First)

---

### 4. Flight
**Attributes:**
- id: string (UUID)
- flightNumber: string
- aircraft: Aircraft
- source: string
- destination: string
- departureTime: Date
- arrivalTime: Date
- status: FlightStatus (enum)
- basePrice: number
- seatAvailability: Map<string, FlightSeat>
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(flightNumber, aircraft, source, destination, departureTime, arrivalTime, basePrice, id?)
- initializeSeatAvailability(): void
- getAvailableSeats(seatClass?: SeatClass): FlightSeat[]
- getSeatAvailability(seatId: string): FlightSeat | undefined
- lockSeat(seatId: string): boolean
- releaseSeat(seatId: string): void
- updateStatus(status: FlightStatus): void
- getDurationMinutes(): number
- getPriceForClass(seatClass: SeatClass): number
- getAvailableCount(seatClass?: SeatClass): number
- getDisplayInfo(): string

**Responsibilities:**
- Represent a scheduled flight instance
- Track real-time seat availability
- Calculate pricing per seat class

---

### 5. FlightSeat *(Value Object)*
**Attributes:**
- seat: Seat
- isAvailable: boolean
- price: number

**Methods:**
- constructor(seat, price)
- lock(): void
- release(): void

**Responsibilities:**
- Link a seat to a specific flight with availability state and pricing
- Support atomic lock/release for concurrency safety

---

### 6. Booking
**Attributes:**
- id: string (UUID)
- bookingRef: string (PNR)
- passengerId: string
- flightId: string
- seatId: string | null
- bookingState: IBookingState (State Pattern)
- totalAmount: number
- paymentId: string | null
- bookedAt: Date
- updatedAt: Date

**Methods:**
- constructor(passengerId, flightId, totalAmount, seatId?, id?, bookingRef?)
- setState(state: IBookingState): void
- confirm(): void
- cancel(): void
- reschedule(newFlightId: string): void
- getStatus(): BookingStatus
- assignPayment(paymentId: string): void
- calculateRefund(): number  *(returns 80% of totalAmount)*
- update(): void
- getDisplayInfo(): string

**Responsibilities:**
- Manage booking lifecycle via State pattern
- Link passenger, flight, and seat
- Track payment and refund calculations

---

### 7. Payment
**Attributes:**
- id: string (UUID)
- bookingId: string
- amount: number
- paymentMethod: IPaymentMethod (Strategy Pattern)
- status: PaymentStatus (enum)
- transactionId: string | null
- processedAt: Date | null
- createdAt: Date

**Methods:**
- constructor(bookingId, amount, paymentMethod, id?)
- process(): boolean
- refund(refundAmount: number): boolean
- markSuccess(transactionId: string): void
- markFailed(): void
- getStatus(): PaymentStatus
- getDisplayInfo(): string

**Responsibilities:**
- Process payments using Strategy pattern
- Track transaction status
- Handle refunds

---

## DESIGN PATTERNS IMPLEMENTATION

### 1. **STATE PATTERN - Booking States**

**Interface: IBookingState**
```typescript
interface IBookingState {
  confirm(booking: Booking): void;
  cancel(booking: Booking): void;
  reschedule(booking: Booking, newFlightId: string): void;
  getStatus(): BookingStatus;
  getStateName(): string;
}
```

**Concrete States:**

#### PendingState
- Attributes: *(stateless)*
- Methods: confirm() → ConfirmedState, cancel() → CancelledState(0), reschedule() → throws Error
- Transitions: Pending → Confirmed (on successful payment) or Cancelled (no refund)

#### ConfirmedState
- Attributes: confirmedAt: Date
- Methods: confirm() → no-op, cancel() → CancelledState(80% refund), reschedule() → RescheduledState
- Transitions: Confirmed → Cancelled or Rescheduled

#### RescheduledState
- Attributes: originalFlightId: string, rescheduledAt: Date
- Methods: confirm() → no-op, cancel() → CancelledState(80% refund), reschedule() → RescheduledState (again)
- Transitions: Rescheduled → Cancelled or Rescheduled again

#### CancelledState
- Attributes: cancelledAt: Date, refundAmount: number
- Methods: confirm() / reschedule() → throw Error, cancel() → no-op
- Transitions: Terminal state — no further transitions

---

### 2. **STRATEGY PATTERN - Payment Methods**

**Interface: IPaymentMethod**
```typescript
interface IPaymentMethod {
  processPayment(amount: number): PaymentResult;
  refund(transactionId: string, amount: number): boolean;
  getMethodName(): string;
}
```

**Concrete Strategies:**

#### CreditCardPayment
- Attributes: cardNumber, cvv, expiryDate, cardHolderName
- Methods: processPayment(), refund(), validateCard() *(private)*

#### UPIPayment
- Attributes: upiId, appName
- Methods: processPayment(), refund(), validateUpiId() *(private)*

#### NetBankingPayment
- Attributes: bankName, accountNumber
- Methods: processPayment(), refund()

#### WalletPayment
- Attributes: walletId, balance
- Methods: processPayment(), refund(), getBalance()

---

### 3. **STRATEGY PATTERN - Flight Search / Sorting**

**Interface: IFlightSortStrategy**
```typescript
interface IFlightSortStrategy {
  sort(flights: Flight[]): Flight[];
  getStrategyName(): string;
}
```

**Concrete Strategies:**

#### SortByPrice
- Sorts flights ascending by base price (or price for requested class)

#### SortByDuration
- Sorts flights ascending by total flight duration

#### SortByDepartureTime
- Sorts flights by departure time (earliest first)

---

### 4. **SINGLETON PATTERN - Core Infrastructure**

#### InMemoryDatabase
- Single instance holding all entity Maps and secondary indexes
- Attributes: passengers, aircraft, flights, bookings, payments (all Map<string, T>)
- Secondary indexes: passengersByEmail, flightsByNumber, bookingsByRef, bookingsByPassengerId, bookingsByFlightId
- Methods: addPassenger(), addAircraft(), addFlight(), addBooking(), addPayment(), printStats(), clearAll()

#### SeatLockManager
- Single instance managing time-expiring seat locks to prevent double booking
- Attributes: locks: Map<string, SeatLock> *(key: seatId:flightId)*, LOCK_TIMEOUT_MS = 10 min
- Methods: tryLock(seatId, flightId, bookingId), releaseLock(), isLocked(), releaseAllLocksForBooking(), clearAllLocks()
- Ensures: Seat locked before payment; released immediately on payment failure

#### BookingNotifier
- Single instance acting as Observer subject
- Methods: attach(), detach(), notifyBookingConfirmed(), notifyBookingCancelled(), notifyFlightStatusChanged()

---

### 5. **OBSERVER PATTERN - Booking Notifications**

**Subject: BookingNotifier** *(Singleton — see above)*

**Interface: IBookingObserver**
```typescript
interface IBookingObserver {
  onBookingConfirmed(booking: Booking): void;
  onBookingCancelled(booking: Booking): void;
  onFlightStatusChanged(flight: Flight): void;
}
```

**Concrete Observers:**

#### EmailNotifier
- Logs email-style messages for booking confirmed, cancelled, and flight status changes

#### SMSNotifier
- Logs SMS-style alerts for booking confirmed, cancelled, and flight status changes

---

### 6. **REPOSITORY PATTERN - Data Access**

**Interface: IRepository\<T\>**
```typescript
interface IRepository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): T;
  update(entity: T): T;
  delete(id: string): boolean;
  exists(id: string): boolean;
  count(): number;
  clear(): void;
}
```

**Concrete Repositories:**

| Repository | Extra query methods |
|---|---|
| PassengerRepository | findByEmail(email) |
| AircraftRepository | findByRegistration(registration) |
| FlightRepository | findByFlightNumber(), findByRoute(src, dest), findByStatus(), findScheduledFlights() |
| BookingRepository | findByRef(), findByPassengerId(), findByFlightId(), findByStatus(), findConfirmedBookings() |
| PaymentRepository | findByBookingId(), findByStatus() |

---

### 7. **SERVICE LAYER - Business Logic**

#### PassengerService
- Methods: register(name, email, phone, passport?), getByEmail(), getById(), getAllPassengers(), displayAllPassengers()

#### FlightService
- Methods: addAircraft(), addSeatsToAircraft(), addFlight(), searchFlights(src, dest, date, sortStrategy?), getFlightById(), getFlightByNumber(), getAllFlights(), updateFlightStatus(), displayAllFlights(), displayFlightDetails()
- Uses `IFlightSortStrategy` — defaults to `SortByPrice`

#### BookingService
- Methods: createBooking(passengerId, flightId, seatId, amount), processPayment(bookingId, paymentMethod), cancelBooking(ref), rescheduleBooking(ref, newFlightId), getBookingByRef(), getBookingsByPassenger(), displayBookingDetails(), displaySeatOptions()
- Coordinates: `SeatLockManager` (lock before payment, release on failure) + `BookingNotifier` (emit events)

#### SetupService
- Methods: initializeSystem(), displaySystemSummary()
- Seeds 3 aircraft and 6 flights on startup

---

## ENUMS

### SeatClass
```typescript
enum SeatClass { ECONOMY, BUSINESS, FIRST }
```

### FlightStatus
```typescript
enum FlightStatus { SCHEDULED, BOARDING, DEPARTED, ARRIVED, CANCELLED, DELAYED }
```

### BookingStatus
```typescript
enum BookingStatus { PENDING, CONFIRMED, RESCHEDULED, CANCELLED }
```

### PaymentStatus
```typescript
enum PaymentStatus { PENDING, SUCCESS, FAILED, REFUNDED }
```

---

## CLASS RELATIONSHIPS

### Associations
- Passenger (1) → (0..*) Booking: Passenger has many bookings
- Booking (1) → (1) Flight: Booking is for one flight
- Booking (1) → (0..1) Seat: Booking optionally has an assigned seat
- Booking (1) → (1) Payment: Booking has one payment record
- Flight (1) → (1) Aircraft: Flight uses one aircraft
- Flight (1) → (0..*) FlightSeat: Flight tracks availability per seat

### Composition
- Aircraft ◆→ Seat: Seats cannot exist without an aircraft
- Flight ◆→ FlightSeat: FlightSeat is scoped to a specific flight instance

### Aggregation
- Flight ◇→ Aircraft: Aircraft exists independently, assigned to flights
- Booking ◇→ Passenger: Passenger exists independently

### Implementations
- PendingState, ConfirmedState, RescheduledState, CancelledState → IBookingState
- CreditCardPayment, UPIPayment, NetBankingPayment, WalletPayment → IPaymentMethod
- SortByPrice, SortByDuration, SortByDepartureTime → IFlightSortStrategy
- EmailNotifier, SMSNotifier → IBookingObserver
- PassengerRepository, AircraftRepository, FlightRepository, BookingRepository, PaymentRepository → IRepository\<T\>

---

## DESIGN PRINCIPLES APPLIED

1. **Single Responsibility Principle (SRP)**
   - `Flight` manages schedule and availability; `Booking` manages booking lifecycle; `Payment` handles transactions
   - State transitions managed by dedicated State pattern classes

2. **Open/Closed Principle (OCP)**
   - New payment methods can be added by implementing `IPaymentMethod`
   - New sort strategies can be added by implementing `IFlightSortStrategy`
   - New notification channels can be added by implementing `IBookingObserver`

3. **Dependency Inversion Principle (DIP)**
   - `Booking` depends on `IBookingState`, not concrete states
   - `Payment` depends on `IPaymentMethod`, not concrete payment classes

4. **Interface Segregation Principle (ISP)**
   - Small focused interfaces: `IBookingState`, `IPaymentMethod`, `IFlightSortStrategy`, `IBookingObserver`

5. **Liskov Substitution Principle (LSP)**
   - All payment methods, sort strategies, and booking states are substitutable via their interfaces

---

## KEY DESIGN DECISIONS

1. **State Pattern for Booking**: Booking lifecycle (Pending → Confirmed → Rescheduled/Cancelled) has different allowed operations per state, preventing invalid transitions

2. **FlightSeat as Value Object**: Seat availability is modeled per-flight (not per-aircraft) so the same physical seat can be booked on multiple flights on different days

3. **Strategy Pattern for Sorting**: Search results can be sorted by price, duration, or time without modifying `Flight` or search logic

4. **Seat Locking in SeatLockManager**: Two-phase locking — `tryLock()` reserves seat before payment; on payment failure the seat is released in both `SeatLockManager` and `Flight.seatAvailability`. Locks auto-expire after 10 minutes.

5. **Service Layer instead of single Facade**: `PassengerService`, `FlightService`, and `BookingService` each own a focused domain slice. `ConsoleInterface` composes them directly, keeping each service testable in isolation.

6. **Booking Ref Generation**: `AIR-{timestamp6}{random4}` format (e.g., `AIR-839201ABCD`) via `IdGenerator.generateBookingRef()`

---

- **Design Patterns Used:** 5 (Singleton ×3, State, Strategy ×2, Observer, Repository)
- **Core Model Classes:** 7 (Passenger, Aircraft, Seat, FlightSeat, Flight, Booking, Payment)
- **Service Classes:** 4 (PassengerService, FlightService, BookingService, SetupService)
- **Repository Classes:** 5
- **Interfaces:** 5 (IBookingState, IPaymentMethod, IFlightSortStrategy, IBookingObserver, IRepository)
- **State Classes:** 4 (Pending, Confirmed, Rescheduled, Cancelled)
- **Strategy Classes:** 7 (4 payment + 3 sort)
- **Observer Classes:** 2 (EmailNotifier, SMSNotifier)
- **Singleton Classes:** 3 (InMemoryDatabase, SeatLockManager, BookingNotifier)
- **Total Entities:** 36+
