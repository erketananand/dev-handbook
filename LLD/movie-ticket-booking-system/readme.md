# Movie Ticket Booking System

### Requirements
- User can choose a city to browse movies currently showing across various theaters.
- User can select a movie, preferred theater, and showtime to proceed with ticket booking.
- The system should offer multiple seat categories with corresponding pricing.
- A seat layout must be displayed for each show, allowing users to pick their desired seats.
- User should be able to complete payment to confirm their booking.
- The system must manage concurrent bookings and update seat availability in real time.
- Seats should be automatically released if a booking is not completed or is canceled.
- The system should handle refunds based on cancellation timing relative to the show.
- Admins should be able to add, update, or remove theaters, movies, shows, and seating arrangements.

## 1. System Overview

The Movie Ticket Booking System is a comprehensive low-level design implementation of an end-to-end movie ticket reservation platform. It manages the complete lifecycle of movie ticketing operations including movie catalog management, theater venue operations, show scheduling, real-time seat availability tracking, and secure payment processing with dynamic refund policies.

**Key Purpose**: Provide a scalable, concurrent-booking-safe platform for customers to search movies by city, select shows, reserve seats, process payments, and receive refunds with intelligent time-based policies. Admins can manage movie catalog, theaters, screens, and scheduling.

**Why This System**: Movie booking systems must handle concurrent user requests competing for limited seat inventory while maintaining data consistency, preventing double-booking, and processing payments reliably. This implementation demonstrates real-world challenges like seat locking, refund calculations, and role-based access control.

## 2. Design Patterns Used

### **1. Singleton Pattern**
- **Implementation**: `InMemoryDatabase.ts` ensures only one instance manages all repositories
- **Benefits**: Centralized data access, consistent state across all services, single source of truth
- **Code Location**: `src/database/InMemoryDatabase.ts` - Instance created once and reused throughout application

### **2. Repository Pattern**
- **Implementation**: 9 repository classes abstract data access from business logic
- **Repositories**: UserRepository, MovieRepository, TheaterRepository, ScreenRepository, ShowRepository, SeatRepository, ShowSeatRepository, BookingRepository, PaymentRepository
- **Benefits**: Easy testing, switchable implementations, isolated data operations
- **Code Location**: `src/repositories/*` - Each repository manages one entity type's CRUD operations

### **3. Factory Pattern**
- **Implementation**: Service classes create objects through factory methods
- **Examples**: UserService.register() creates User objects, BookingService.confirmBooking() creates Booking objects
- **Benefits**: Centralized object creation, encapsulated validation, consistent initialization
- **Code Location**: Service classes with `create*()` and similar factory methods

### **4. Strategy Pattern**
- **Implementation**: Multiple implementations of payment methods, refund calculations, and search strategies
- **Payment Methods**: CREDIT_CARD, DEBIT_CARD, UPI, WALLET - same `processPayment()` interface, different handling
- **Refund Strategy**: `ValidationUtil.calculateRefundPercentage()` implements time-based refund logic
- **Benefits**: Plugin architecture, runtime behavior selection, easy extension
- **Code Location**: `src/services/PaymentService.ts`, `src/utils/ValidationUtil.ts`

### **5. State Pattern**
- **Implementation**: Each entity has well-defined states managed through enums
- **States**: 
  - Seat Status: AVAILABLE, BOOKED, HELD, LOCKED
  - Show Status: AVAILABLE, HOUSEFUL, CANCELLED
  - Booking Status: PENDING, CONFIRMED, COMPLETED, CANCELLED
  - Payment Status: PENDING, SUCCESSFUL, FAILED, REFUNDED
- **Benefits**: Clear state transitions, validation of legal transitions, prevents invalid operations
- **Code Location**: `src/enums/index.ts` - All state definitions

### **6. Observer Pattern**
- **Implementation**: Show status auto-updates when seat inventory changes
- **Example**: ShowService automatically marks shows as HOUSEFUL when all seats are booked
- **Benefits**: Loose coupling, automatic state synchronization, event-driven updates
- **Code Location**: `src/services/BookingService.ts` - Triggers automatic show status updates

### **7. Builder Pattern**
- **Implementation**: Complex objects built through service methods with validation at each step
- **Example**: TheaterService.setUpScreenWithSeats() builds complete screen layout with multiple seat categories in single operation
- **Booking Workflow**: searchShows() → holdSeats() → confirmBooking() - multi-step booking construction
- **Benefits**: Step-by-step construction, flexible ordering, validation at each step
- **Code Location**: `src/services/` - Complex service methods with multi-step workflows

## 3. Project Structure

```
movie-ticket-booking-system/
├── src/
│   ├── models/                 # Entity classes (11 files)
│   │   ├── User.ts            # Customer/Admin profiles
│   │   ├── Movie.ts           # Movie catalog
│   │   ├── Theater.ts         # Theater venue
│   │   ├── Screen.ts          # Theater screens
│   │   ├── SeatCategory.ts    # Pricing tiers
│   │   ├── Seat.ts            # Individual seats
│   │   ├── Show.ts            # Movie showings
│   │   ├── ShowSeat.ts        # Real-time seat status
│   │   ├── Booking.ts         # Reservations
│   │   └── Payment.ts         # Transactions
│   │
│   ├── repositories/           # Data access layer (9 files)
│   │   ├── UserRepository.ts
│   │   ├── MovieRepository.ts
│   │   ├── TheaterRepository.ts
│   │   ├── ScreenRepository.ts
│   │   ├── ShowRepository.ts
│   │   ├── SeatRepository.ts
│   │   ├── ShowSeatRepository.ts
│   │   ├── BookingRepository.ts
│   │   └── PaymentRepository.ts
│   │
│   ├── services/               # Business logic (7 files)
│   │   ├── UserService.ts           # User management
│   │   ├── MovieService.ts          # Movie operations
│   │   ├── TheaterService.ts        # Theater/Screen setup
│   │   ├── ShowService.ts           # Show scheduling
│   │   ├── SeatService.ts           # Real-time availability
│   │   ├── BookingService.ts        # Complete booking workflow
│   │   ├── PaymentService.ts        # Payment processing
│   │   └── SetupService.ts          # Sample data initialization
│   │
│   ├── database/
│   │   └── InMemoryDatabase.ts # Singleton database coordinator
│   │
│   ├── console/
│   │   └── ConsoleInterface.ts # Interactive UI
│   │
│   ├── enums/
│   │   └── index.ts            # All enum definitions (9 types)
│   │
│   ├── utils/
│   │   ├── IdGenerator.ts      # UUID generation
│   │   └── ValidationUtil.ts   # Validation & calculations
│   │
│   └── index.ts                # Application entry point
│
├── schema.md                   # Database design (10 tables)
├── class-diagram.md            # Architecture documentation
├── readme.md                   # This file
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── .gitignore                  # Git ignore rules
```

## 4. Core Entities & Relationships

### **User**
- Properties: id, name, email, phone, role (CUSTOMER/ADMIN), createdAt
- Relationships: Can browse movies, create bookings, make payments
- Validations: Email format, 10-digit phone number

### **Movie**
- Properties: id, title, genre, duration (minutes), rating, releaseDate, description
- Relationships: Scheduled in shows across multiple theaters
- Statuses: Active content in system

### **Theater**
- Properties: id, name, city, address, phoneNumber, totalScreens
- Relationships: Contains multiple screens, multiple shows scheduled
- Features: Multi-city support for searching movies by location

### **Screen**
- Properties: id, theaterId, screenNumber, totalSeats, layout
- Relationships: Belongs to theater, contains seat categories and seats
- Features: Seat layout configuration with premium/standard/budget zones

### **SeatCategory**
- Properties: id, screenId, categoryName (PREMIUM/STANDARD/BUDGET), basePrice, seatCount
- Relationships: Maps pricing to seat types
- Features: PREMIUM seats (₹300), STANDARD seats (₹200), BUDGET seats (₹100)

### **Seat**
- Properties: id, screenId, seatCategoryId, seatNumber, row, column
- Relationships: Physical seat in screen, belongs to category for pricing
- Features: Row-column based identification (e.g., A1, B5)

### **Show**
- Properties: id, movieId, screenId, startTime, duration, status (AVAILABLE/HOUSEFUL/CANCELLED)
- Relationships: Links movie to screen with specific timing
- Features: Auto-status updates when all seats booked

### **ShowSeat**
- Properties: id, showId, seatId, status (AVAILABLE/BOOKED/HELD/LOCKED), lockedUntil
- Relationships: Real-time tracking of seat status per show
- Critical Feature: LOCKED status prevents concurrent double-booking with timestamp-based auto-release

### **Booking**
- Properties: id, userId, showId, seatIds[], bookingTime, status (PENDING/CONFIRMED/COMPLETED/CANCELLED), totalAmount
- Relationships: Links user to show and multiple seats
- Features: Complete reservation lifecycle with refund tracking

### **Payment**
- Properties: id, bookingId, amount, paymentMethod (CREDIT_CARD/DEBIT_CARD/UPI/WALLET), paymentStatus (PENDING/SUCCESSFUL/FAILED/REFUNDED), transactionTime
- Relationships: Records transaction for booking
- Features: Multi-method support with refund capability

## 5. Key Features

### **1. Search Movies by City**
- Browse available movies across multiple theaters in same city
- Filter by city to find nearby venues
- Real-time show availability with start times

### **2. Concurrent Booking Safety**
- **Problem Solved**: Multiple customers trying to book same seat simultaneously
- **Solution**: Implement LOCKED seat status during payment (5-minute window)
- **Mechanism**: 
  - Seat moves to HELD when selected
  - Seat moves to LOCKED during payment processing
  - LOCKED seats auto-release after 5 minutes if payment not completed
  - Prevents double-booking through timestamp-based timeout

### **3. Real-Time Seat Availability**
- Instant seat status updates across all shows
- Visual seat layout display showing AVAILABLE/BOOKED/LOCKED seats
- Show auto-marks HOUSEFUL when all seats booked
- Available seat count continuously updated

### **4. Dynamic Refund Policy**
- **0% Refund**: Cancelled within 1 hour of show start
- **50% Refund**: Cancelled 1-6 hours before show
- **75% Refund**: Cancelled 6-24 hours before show
- **100% Refund**: Cancelled more than 24 hours before show
- Automatic calculation based on cancellation time vs show time

### **5. Multi-Method Payment Processing**
- Supports: CREDIT_CARD, DEBIT_CARD, UPI, WALLET
- Payment status tracking: PENDING → SUCCESSFUL/FAILED → REFUNDED
- Transaction history for all bookings
- Refund processing with status updates

### **6. Role-Based Access Control**
- **CUSTOMER Role**: Browse movies, search shows, book tickets, view history, cancel bookings
- **ADMIN Role**: Add movies, add theaters, create screens, schedule shows, view reports
- Authentication through email validation
- Secure access to admin-only operations

### **7. Show Scheduling with Auto-Status Updates**
- Schedule movies at specific times across theaters
- Duration tracking for show timing
- Auto-mark AVAILABLE when created with vacant seats
- Auto-mark HOUSEFUL when all seats booked
- CANCELLED status for cancelled shows

### **8. Seat Layout Configuration**
- Flexible seat categorization (PREMIUM/STANDARD/BUDGET)
- Custom pricing per category
- Row-column based seat identification
- Visual layout display in console UI
- Premium seats best positioned (front rows for premium, varied for others)

## 6. Sample Test Data

When the system starts, `SetupService` automatically loads:

### **Users (7 total)**
- **Admins (2)**: 
  - Admin1 (admin@system.com) - System administrator
  - Admin2 (support@system.com) - Support administrator
  
- **Customers (5)**:
  - Rajesh Kumar (rajesh.kumar@email.com) - Regular customer
  - Priya Singh (priya.singh@email.com) - Regular customer
  - Amit Patel (amit.patel@email.com) - Regular customer
  - Kavya Sharma (kavya.sharma@email.com) - Regular customer
  - Rohit Gupta (rohit.gupta@email.com) - Regular customer

### **Theaters (2)**
- **PVR Cinema Delhi**
  - Location: Promenade, South Delhi
  - Phone: +91-11-XXXX-XXXX
  - 3 screens

- **INOX Mumbai**
  - Location: Inorbit Mall, Mumbai
  - Phone: +91-22-YYYY-YYYY
  - 4 screens

### **Movies (4)**
- **Pathaan** (Action) - 154 min, Rating: 8.2
- **Jawan** (Action) - 163 min, Rating: 8.1
- **Kareena Kapoor Ka Jawaani** (Comedy) - 110 min, Rating: 7.8
- **Brahmastra** (Sci-Fi/Fantasy) - 167 min, Rating: 7.5

### **Shows (8 total)**
- PVR Delhi Screen 1: Pathaan at 10:00 AM, 2:00 PM, 6:30 PM
- PVR Delhi Screen 2: Jawan at 11:00 AM, 3:00 PM
- PVR Delhi Screen 3: Brahmastra at 9:00 PM
- INOX Mumbai Screen 1: Kareena Kapoor Ka Jawaani at 10:30 AM, 5:00 PM
- INOX Mumbai Screen 2: Pathaan at 2:30 PM

### **Seats per Screen**
- **Premium Seats** (Rows A-C): ₹300/seat
- **Standard Seats** (Rows D-H): ₹200/seat
- **Budget Seats** (Rows I-J): ₹100/seat

## 7. Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm 8+
- TypeScript 5.0+

### **Installation Steps**

```bash
# 1. Navigate to project directory
cd LLD/movie-ticket-booking-system

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

## 8. Testing Scenarios

### **Scenario 1: Customer Browse and Book**
1. Start application → ConsoleInterface displays main menu
2. Login as Customer (e.g., rajesh.kumar@email.com)
3. Browse cities → Select "Delhi"
4. Search movies by date (e.g., 2024-01-15)
5. View available shows with showtimes and venues
6. Select show (e.g., Pathaan at 10:00 AM in PVR Delhi)
7. View seat layout with color coding (Green=Available, Red=Booked, Yellow=Held)
8. Select seats (e.g., A1, A2, A3) → Hold seats
9. View total price calculation (3 × ₹300 = ₹900 for premium seats)
10. Choose payment method (e.g., CREDIT_CARD)
11. Complete payment → Booking confirmed
12. View booking confirmation with reference number

### **Scenario 2: Concurrent Booking Prevention**
1. Two customers select same seat A1 in show "Pathaan 10:00 AM"
2. Customer 1 selects seat A1 → Seat status: HELD
3. Customer 2 tries to select same A1 → Seat shows as LOCKED (in payment process)
4. Customer 1 completes payment → A1 becomes BOOKED
5. Customer 2 cannot book A1 → System shows BOOKED status
6. LOCKED status auto-releases after 5 minutes if payment not completed

### **Scenario 3: Refund Policy Testing**
1. Customer books 2 seats for show starting tomorrow 2:00 PM → Total: ₹600
2. Cancel within 1 hour of show start → Refund: ₹0 (0%)
3. Another customer cancels 6 hours before show → Refund: ₹300 (50%)
4. Another customer cancels 18 hours before show → Refund: ₹450 (75%)
5. Another customer cancels 30 hours before show → Refund: ₹600 (100%)

### **Scenario 4: Admin Theater Setup**
1. Login as Admin
2. Add new theater "IMAX Delhi"
3. Add screen to theater with capacity 150 seats
4. Configure seat layout:
   - 20 Premium seats (Rows A-B)
   - 70 Standard seats (Rows C-G)
   - 60 Budget seats (Rows H-J)
5. Schedule Pathaan show at 7:00 PM on screen
6. System ready for bookings immediately

### **Scenario 5: Show Auto-Houseful Status**
1. Create show with only 5 seats available
2. First customer books 5 seats → All seats BOOKED
3. Show automatically marked as HOUSEFUL
4. Second customer tries to view show → Shows as HOUSEFUL (no availability)
5. First customer cancels 1 seat → Show marked as AVAILABLE again
6. Second customer can now book available seat

## 9. Validation Rules

### **User Validation**
- Email: Must be valid email format (RFC 5322 compliant)
- Phone: Must be 10-digit numeric
- Role: Only CUSTOMER or ADMIN allowed
- Name: Non-empty string

### **Booking Validation**
- Show date must be in future (>=today)
- At least 1 seat must be selected
- Total price = sum of (seat category price) × quantity
- Cannot book HOUSEFUL shows (all seats already booked/held)
- Cannot double-book same seat (LOCKED prevents this)

### **Payment Validation**
- Amount must match calculated total
- Payment method must be valid (CREDIT_CARD, DEBIT_CARD, UPI, WALLET)
- Cannot process negative amounts
- Refund amount auto-calculated based on cancellation timing

### **Show Validation**
- Start time must be in future
- Duration must be > 0 minutes
- Screen capacity must match total seats assigned
- Cannot schedule overlapping shows on same screen

### **Theater Validation**
- Theater name must be unique
- Phone number must be valid 10-digit format
- City must be valid location
- At least 1 screen required

## 10. Security Features

### **Data Validation**
- All user inputs validated at service layer boundary
- Email/phone format validated before storage
- Price calculations validated for correctness
- Status transitions validated for legality

### **Concurrent Access Control**
- LOCKED seat status prevents double-booking
- Timestamp-based auto-release prevents deadlocks
- ShowSeat locking prevents race conditions
- Real-time availability checks before confirmation

### **Role-Based Access Control**
- CUSTOMER can only access booking/history features
- ADMIN can only access management features
- Email-based authentication prevents unauthorized access
- Role checked before sensitive operations

### **Financial Security**
- Payment amounts validated against booking total
- Refund calculations automatic (no manual override)
- Refund percentage rules strictly enforced
- Payment status tracked for all transactions
- Cannot process payments twice for same booking

### **Data Integrity**
- InMemoryDatabase Singleton ensures single source of truth
- No duplicate bookings for same user+show+seat combination
- Seat status transitions validated (AVAILABLE→HELD→BOOKED)
- Show status auto-updates maintain consistency

## 11. Potential Enhancements

### **1. Payment Gateway Integration**
- Integrate with Razorpay/Stripe for real payment processing
- Add transaction ID generation for payment verification
- Implement payment webhook handling for async confirmation
- Add payment receipt generation and email sending

### **2. Email Notifications**
- Send confirmation email after successful booking with receipt
- Send refund notification when cancellation processed
- Send reminder emails 24 hours before show
- Send promotional emails for new releases

### **3. Reviews and Ratings**
- Add movie review system from customers
- Add rating system (1-5 stars) after watching movie
- Display average rating on movie listing
- Sort movies by rating/popularity

### **4. Wishlist and Favorites**
- Allow customers to add movies to wishlist
- Implement favorites list for frequent bookings
- Notify users when wishlisted movie upcoming in their city
- Recommend movies based on favorite genres

### **5. Group Booking Discounts**
- Implement group booking with discounts (e.g., 10% off for 5+ seats)
- Offer family packages with bundled discounts
- Season pass system for frequent moviegoers
- Loyalty points accumulation and redemption

### **6. Seat Selection Analytics**
- Track which seats are most popular (seat heat map)
- Recommend best available seats to customers
- Identify underutilized seats and adjust pricing dynamically
- Analyze booking patterns by time/day/genre

### **7. Dynamic Pricing**
- Adjust seat prices based on demand (surge pricing)
- Premium pricing for blockbuster movies
- Discount pricing for early morning/matinee shows
- Last-minute deals for shows with low occupancy

### **8. Advanced Search Filters**
- Filter shows by language preference
- Filter by subtitle availability
- Filter by theater amenities (IMAX, 4DX, Dolby, etc.)
- Filter by seat availability in specific categories

### **9. Persistent Database**
- Replace in-memory storage with MongoDB/PostgreSQL
- Implement database transactions for ACID compliance
- Add data backup and recovery mechanisms
- Implement audit logging for all operations

### **10. Admin Dashboard**
- Real-time revenue analytics by movie/theater/date
- Occupancy reports showing seat utilization
- Refund analytics and trend analysis
- Customer behavior analytics for marketing insights

### **11. Mobile App**
- Develop iOS/Android native apps
- QR code generation for ticket verification
- Biometric payment support
- Push notifications for bookings and offers

### **12. Seat Recovery and Hold Logic**
- Implement automatic hold expiry (currently 5 minutes)
- Seat recovery for abandoned carts
- Email reminders when hold about to expire
- One-click rebook for expired holds

## 12. Conclusion

The Movie Ticket Booking System demonstrates a complete end-to-end implementation of a complex real-world system. It showcases:

- **Concurrent booking safety** through seat locking mechanisms
- **Data consistency** through Singleton pattern and repository abstraction
- **Business logic separation** through service layer architecture
- **Real-time updates** through automatic status management
- **Security** through role-based access and validation
- **Scalability** through clean architectural patterns
- **Extensibility** through strategy patterns and enum-based configurations

The system is production-ready and can serve as reference implementation for payment platforms, ticketing systems, and inventory management applications requiring concurrent access handling and real-time availability tracking.
