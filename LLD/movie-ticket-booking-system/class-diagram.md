# Movie Ticket Booking System - Class Diagram & Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      UI Layer (ConsoleInterface)                     │
│  - User registration & login                                        │
│  - Movie browsing by city                                          │
│  - Show selection & seat layout display                           │
│  - Booking & payment workflow                                     │
│  - Booking management (view, cancel)                             │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    Service Layer (Business Logic)                     │
├──────────────────────────────────────────────────────────────────────┤
│ • UserService: Registration, authentication, profile management     │
│ • MovieService: Movie CRUD operations, filtering                    │
│ • TheaterService: Theater & screen management                       │
│ • ShowService: Show scheduling & management                        │
│ • BookingService: Ticket booking & cancellation                    │
│ • SeatService: Real-time seat allocation & inventory              │
│ • PaymentService: Payment processing & refunds                     │
│ • SetupService: System initialization with sample data            │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│              Repository Layer (Data Access Abstraction)              │
├──────────────────────────────────────────────────────────────────────┤
│ • UserRepository: User persistence                                  │
│ • MovieRepository: Movie persistence                                │
│ • TheaterRepository: Theater & screen persistence                  │
│ • ShowRepository: Show persistence with real-time queries          │
│ • SeatRepository: Seat inventory management                        │
│ • BookingRepository: Booking & details persistence                │
│ • PaymentRepository: Payment & refund persistence                 │
└──────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────┐
│            Database Layer (InMemoryDatabase Singleton)                │
│  - Centralized data management                                      │
│  - All repository implementations                                   │
│  - Secondary indexes for performance                               │
└──────────────────────────────────────────────────────────────────────┘
```

## Core Model Classes

### 1. User
```typescript
class User {
  id: string (UUID)
  name: string
  email: string (unique)
  phone: string (unique)
  passwordHash: string
  address: string
  createdAt: Date
  
  Methods:
  - isValid(): boolean
  - getDisplayInfo(): string
}
```

### 2. Movie
```typescript
class Movie {
  id: string (UUID)
  title: string
  description: string
  genre: string
  durationMinutes: number
  language: string
  rating: number (0-10)
  releaseDate: Date
  
  Methods:
  - isValid(): boolean
  - getDisplayInfo(): string
}
```

### 3. Theater
```typescript
class Theater {
  id: string (UUID)
  name: string
  city: string
  address: string
  phone: string
  totalScreens: number
  
  Methods:
  - isValid(): boolean
  - getDisplayInfo(): string
}
```

### 4. Screen
```typescript
class Screen {
  id: string (UUID)
  theaterId: string (FK)
  screenNumber: number
  totalSeats: number
  layoutType: string
  
  Methods:
  - isValid(): boolean
  - getDisplayInfo(): string
}
```

### 5. SeatCategory
```typescript
class SeatCategory {
  id: string (UUID)
  screenId: string (FK)
  categoryName: string (PREMIUM, STANDARD, ECONOMY)
  price: number
  totalSeats: number
  
  Methods:
  - isValid(): boolean
  - getDisplayInfo(): string
}
```

### 6. Seat
```typescript
class Seat {
  id: string (UUID)
  screenId: string (FK)
  seatCategoryId: string (FK)
  rowLabel: string (A, B, C, ...)
  seatNumber: number
  status: SeatStatus (AVAILABLE, BOOKED, LOCKED)
  
  Methods:
  - markAsBooked(): void
  - markAsAvailable(): void
  - lock(): void
  - unlock(): void
}
```

### 7. Show
```typescript
class Show {
  id: string (UUID)
  movieId: string (FK)
  screenId: string (FK)
  showDate: Date
  showTime: string (HH:MM format)
  availableSeats: number
  totalSeats: number
  status: ShowStatus (AVAILABLE, HOUSEFUL, COMPLETED, CANCELLED)
  
  Methods:
  - isValid(): boolean
  - getAvailableSeats(): number
  - updateAvailableSeats(count): void
  - getDisplayInfo(): string
}
```

### 8. ShowSeat (Real-time Seat Inventory)
```typescript
class ShowSeat {
  id: string (UUID)
  showId: string (FK)
  seatId: string (FK)
  status: SeatStatus (AVAILABLE, BOOKED, LOCKED, HELD)
  bookedAt: Date | null
  releasedAt: Date | null
  
  Methods:
  - lock(timeout): void
  - book(): void
  - release(): void
}
```

### 9. Booking
```typescript
class Booking {
  id: string (UUID)
  bookingNumber: string (unique, BKG-XXXXXX)
  userId: string (FK)
  showId: string (FK)
  numTickets: number
  totalPrice: number
  status: BookingStatus (PENDING, CONFIRMED, COMPLETED, CANCELLED)
  createdAt: Date
  expiresAt: Date (15 min timeout)
  canceledAt: Date | null
  
  Methods:
  - confirm(): void
  - cancel(): void
  - complete(): void
  - isExpired(): boolean
  - getDisplayInfo(): string
}
```

### 10. Payment
```typescript
class Payment {
  id: string (UUID)
  bookingId: string (FK)
  amount: number
  paymentMethod: PaymentMethod (CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING)
  transactionId: string | null
  status: PaymentStatus (PENDING, SUCCESSFUL, FAILED, REFUNDED)
  createdAt: Date
  processedAt: Date | null
  
  Methods:
  - process(): boolean
  - fail(): void
  - refund(): boolean
  - getDisplayInfo(): string
}
```

## Repository Classes

```typescript
class UserRepository {
  - save(user): void
  - findById(id): User | null
  - findByEmail(email): User | null
  - findByPhone(phone): User | null
  - getAllUsers(): User[]
  - update(user): void
  - delete(id): boolean
}

class MovieRepository {
  - save(movie): void
  - findById(id): Movie | null
  - findByTitle(title): Movie[]
  - findByGenre(genre): Movie[]
  - getAllMovies(): Movie[]
  - update(movie): void
  - delete(id): boolean
}

class TheaterRepository {
  - save(theater): void
  - findById(id): Theater | null
  - findByCity(city): Theater[]
  - getAllTheaters(): Theater[]
  - update(theater): void
  - delete(id): boolean
}

class ScreenRepository {
  - save(screen): void
  - findById(id): Screen | null
  - findByTheater(theaterId): Screen[]
  - getAllScreens(): Screen[]
  - update(screen): void
  - delete(id): boolean
}

class ShowRepository {
  - save(show): void
  - findById(id): Show | null
  - findByMovie(movieId): Show[]
  - findByScreen(screenId): Show[]
  - findByDateRange(startDate, endDate): Show[]
  - getAvailableShows(movieId, city, date): Show[]
  - getUpcomingShows(): Show[]
  - update(show): void
}

class SeatRepository {
  - save(seat): void
  - findById(id): Seat | null
  - findByScreen(screenId): Seat[]
  - getAvailableSeats(screenId): Seat[]
  - getBySeatPosition(screenId, row, number): Seat | null
  - update(seat): void
}

class ShowSeatRepository {
  - save(showSeat): void
  - findById(id): ShowSeat | null
  - findByShow(showId): ShowSeat[]
  - getAvailableSeats(showId): ShowSeat[]
  - getSeatsInCategory(showId, categoryId): ShowSeat[]
  - getBookedSeats(showId): ShowSeat[]
  - update(showSeat): void
}

class BookingRepository {
  - save(booking): void
  - findById(id): Booking | null
  - findByNumber(bookingNumber): Booking | null
  - findByUser(userId): Booking[]
  - findByShow(showId): Booking[]
  - getPendingBookings(): Booking[]
  - getExpiredPendingBookings(): Booking[]
  - update(booking): void
}

class PaymentRepository {
  - save(payment): void
  - findById(id): Payment | null
  - findByBooking(bookingId): Payment | null
  - getSuccessfulPayments(): Payment[]
  - getFailedPayments(): Payment[]
  - getTotalRevenue(): number
  - update(payment): void
}
```

## Enumerations

```typescript
enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  LOCKED = 'LOCKED',
  HELD = 'HELD'
}

enum ShowStatus {
  AVAILABLE = 'AVAILABLE',
  HOUSEFUL = 'HOUSEFUL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING'
}

enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
```

## Key Design Patterns

### 1. **Singleton Pattern**
- InMemoryDatabase ensures single instance

### 2. **Repository Pattern**
- Data access abstraction (UserRepository, ShowRepository, BookingRepository, etc.)

### 3. **Service Layer Pattern**
- Business logic encapsulation (UserService, BookingService, SeatService)

### 4. **Factory Pattern**
- Entity creation through services

### 5. **Strategy Pattern**
- Different payment methods, seat categories, pricing strategies

### 6. **State Pattern**
- Booking lifecycle: PENDING → CONFIRMED → COMPLETED/CANCELLED
- Seat status management: AVAILABLE → BOOKED/LOCKED
- Show status: AVAILABLE → HOUSEFUL → COMPLETED

### 7. **Observer Pattern (Implicit)**
- Services notify about booking confirmations, payment status

### 8. **Lock Pattern**
- Seat locking during booking to prevent double bookings

## Key Interaction Flows

### 1. Search & Browse
```
User → MovieService.getMoviesByCity()
      → ShowService.getAvailableShows()
      → Display shows with available seats
```

### 2. Seat Selection & Booking
```
User → SeatService.getAvailableSeats(showId)
     → SeatService.lockSeats() [15 min timeout]
     → BookingService.createBooking()
     → Display seat layout
```

### 3. Payment & Confirmation
```
Booking → PaymentService.createPayment()
        → PaymentService.processPayment()
        → BookingService.confirmBooking()
        → SeatService.confirmSeats()
```

### 4. Cancellation & Refund
```
Booking → BookingService.cancelBooking()
        → SeatService.releaseSeats()
        → PaymentService.processRefund()
        → Refund amount based on timing
```

## Concurrency Management

- **ShowSeat Table**: Separate table for real-time seat state
- **Seat Locking**: Temporary locks during booking selection (15 min timeout)
- **Atomic Operations**: Transactions ensure consistency
- **Conflict Detection**: Prevents double bookings through status checks
- **Auto-Release**: Locks and holds released on expiry

## Data Consistency

- Unique constraints on seat positions (theater + screen + row + number)
- Unique booking numbers prevent duplicate confirmations
- Foreign keys maintain referential integrity
- Status enums enforce valid state transitions
- Timestamps track all entity changes
