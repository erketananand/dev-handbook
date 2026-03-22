# Airline Management System - Complete Implementation

## Overview

This is a complete **Low Level Design (LLD)** implementation of an **Airline Management System** built using **TypeScript**. The system demonstrates various design patterns, clean architecture principles, and comprehensive flight booking workflows.

## Requirements

### Primary Features
- User can search flights based on source, destination, and date
- User can sort flights by price and duration
- User can book flights by providing passenger details
- User can reschedule & cancel their bookings
- System maintains flight and user information

### Secondary Features
- Direct, multi-hop, one-way, round-trip flight options
- Seat selection during booking
- Add-ons management (luggage, meals, etc.)

## Key Design Patterns Used

1. **Singleton**: InMemoryDatabase (single instance for all data)
2. **Repository Pattern**: Abstraction for data access layer
3. **Factory Pattern**: Flight and Booking creation
4. **State Pattern**: Flight and Booking state management
5. **Strategy Pattern**: Search and sorting strategies
6. **Observer Pattern**: Booking notifications and updates
7. **Builder Pattern**: Complex booking creation

## Project Structure

```
src/
├── console/
│   └── ConsoleInterface.ts          # Main entry point and UI
├── database/
│   └── InMemoryDatabase.ts          # Singleton database
├── enums/
│   └── index.ts                     # All enumerations
├── models/
│   ├── Passenger.ts                 # Passenger information
│   ├── Aircraft.ts                  # Aircraft details
│   ├── Seat.ts                      # Individual seat
│   ├── Flight.ts                    # Flight information
│   ├── FlightSeatAvailability.ts   # Seat availability tracking
│   ├── Booking.ts                   # Booking details
│   └── Payment.ts                   # Payment information
├── repositories/
│   ├── PassengerRepository.ts       # Passenger data access
│   ├── AircraftRepository.ts        # Aircraft data access
│   ├── FlightRepository.ts          # Flight data access
│   ├── BookingRepository.ts         # Booking data access
│   └── PaymentRepository.ts         # Payment data access
├── services/
│   ├── FlightService.ts             # Flight operations
│   ├── BookingService.ts            # Booking management
│   ├── PassengerService.ts          # Passenger management
│   ├── PaymentService.ts            # Payment processing
│   └── AirlineManagementSystem.ts   # Facade/Main orchestrator
└── utils/
    ├── IdGenerator.ts               # UUID generation
    └── ValidationUtil.ts            # Input validation
```

## Core Entities

### Passenger
- Represents a passenger with ID, name, email, phone, passport number
- Can be in states: ACTIVE, INACTIVE
- Stores travel preferences and contact information

### Aircraft
- Represents an aircraft with registration, model, total seats
- Contains seat configuration (Economy, Business, First Class)
- Manages seat inventory and availability

### Seat
- Represents a physical seat on an aircraft
- Has seat number, class (Economy, Business, First)
- Tracks seat status (Available, Occupied, Reserved)

### Flight
- Represents a flight with flight number, aircraft, route, schedule
- Can be in states: SCHEDULED, BOARDING, DEPARTED, ARRIVED, CANCELLED, DELAYED
- Manages seat availability and pricing

### FlightSeatAvailability
- Tracks availability and pricing for each seat on each flight
- Manages dynamic pricing based on demand
- Prevents double-booking

### Booking
- Represents a passenger booking for a flight
- Can be in states: PENDING, CONFIRMED, CHECKED_IN, CANCELLED
- Contains booking reference (PNR), passenger(s), seat(s), and price

### Payment
- Represents a payment transaction for a booking
- Can be in states: PENDING, SUCCESSFUL, FAILED, REFUNDED
- Tracks payment method and amount

## Key Features

### 1. Flight Search & Display
- Search flights by source, destination, and date
- Display all available flights with pricing
- Filter by direct/multi-stop flights
- Show available seats in each class

### 2. Flight Sorting
- Sort by price (ascending/descending)
- Sort by duration
- Sort by departure time
- Combine multiple sort criteria

### 3. Booking Management
- Book flight with passenger details
- Select preferred seats
- Choose seat class
- Apply add-ons (luggage, meals, etc.)
- Generate PNR (booking reference)

### 4. Seat Selection
- View seat map for flight
- Select seats by class: Economy, Business, First
- Real-time seat availability updates
- Prevent double-booking

### 5. Booking Modifications
- Reschedule flight to another date
- Cancel booking with refund processing
- Modify passenger details
- View booking history

### 6. Payment Processing
- Support multiple payment methods
- Track payment status
- Process refunds for cancellations
- Generate payment receipts

## Sample Test Data

### Passengers
```
Passenger 1: Rajesh Kumar | Email: rajesh@email.com | Passport: IN1234567
Passenger 2: Priya Singh | Email: priya@email.com | Passport: IN7654321
Passenger 3: Amit Patel | Email: amit@email.com | Passport: IN4567890
```

### Aircraft
```
Aircraft 1: VT-AXB | Boeing 737 | Total Seats: 180
  - Economy: 144 seats
  - Business: 30 seats
  - First: 6 seats

Aircraft 2: VT-AXC | Airbus A320 | Total Seats: 195
  - Economy: 156 seats
  - Business: 32 seats
  - First: 7 seats
```

### Flights
```
Flight 1: AI-202 | DEL → BOM | 2026-03-22 08:00 → 10:30
  Status: SCHEDULED | Base Price: ₹3,500

Flight 2: AI-203 | BOM → BLR | 2026-03-22 11:00 → 13:30
  Status: SCHEDULED | Base Price: ₹2,800

Flight 3: AI-204 | DEL → NYC | 2026-03-23 22:00 → 09:00 (next day)
  Status: SCHEDULED | Base Price: ₹50,000
```

## Installation & Running

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the application
npm start

# For development with ts-node
npm run dev
```

## Testing the System

### Test Scenario 1: Search & Book Direct Flight
1. Search flights from Delhi to Mumbai on 2026-03-22
2. View available flights
3. Sort by price (low to high)
4. Select flight AI-202
5. Choose passenger details
6. Select Economy seat
7. Proceed with booking
8. Verify PNR generated

### Test Scenario 2: View Seat Map
1. Select a flight
2. View seat availability map
3. Filter by seat class (Business)
4. Select a seat
5. Check seat price

### Test Scenario 3: Reschedule Booking
1. View existing booking
2. Select reschedule option
3. Choose new flight
4. Verify price differences
5. Confirm reschedule

### Test Scenario 4: Cancel Booking
1. View booking details
2. Select cancel option
3. Confirm cancellation
4. Verify refund processing
5. Check payment status

### Test Scenario 5: Multi-passenger Booking
1. Search flights
2. Add multiple passengers
3. Select seats for each passenger
4. Add supplementary services (luggage, seat upgrades)
5. Complete booking

## Validation Rules

- **Passenger Name**: Must be non-empty
- **Email**: Must contain '@'
- **Passport Number**: Valid format for international flights
- **Flight Search**: Date must be in future
- **Seat Selection**: Cannot select already booked seats
- **Booking Status**: Valid state transitions
- **Payment Amount**: Must match booking price
- **Refund Policy**: 100% for cancellations > 24 hours before flight

## Security Features

- **Session Management**: User session tracking
- **PNR Verification**: Secure booking reference generation
- **Payment Gateway**: Secure payment processing
- **Data Integrity**: Transaction logging for all operations
- **Audit Trail**: Track all booking modifications

## Database Schema

The system uses an in-memory database with the following tables:
- `Passengers`: Passenger information
- `Aircraft`: Aircraft details and seat configuration
- `Seats`: Individual seat information
- `Flights`: Flight schedule and status
- `FlightSeatAvailability`: Dynamic seat pricing and availability
- `Bookings`: Booking records
- `Payments`: Payment transactions

See `schema.md` for detailed schema documentation.

## Class Diagram

See `class-diagram.md` for detailed UML class diagram showing relationships between all classes, methods, and enumerations.

## Code Quality

- ✓ Strict TypeScript typing
- ✓ Clear separation of concerns
- ✓ SOLID principles
- ✓ Comprehensive error handling
- ✓ Meaningful naming conventions
- ✓ Well-structured file organization
- ✓ Scalable and maintainable architecture

## Files Generated

- `schema.md` - Database schema design
- `class-diagram.md` - UML class diagram and architecture
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore file
- `src/` - All TypeScript source code with models, services, repositories

## Potential Enhancements

1. **Persistent Database**: Replace InMemoryDatabase with PostgreSQL/MongoDB
2. **API Endpoints**: REST/GraphQL API for external integrations
3. **Real-time Updates**: WebSocket for live seat availability
4. **Mobile App**: React Native mobile application
5. **Payment Integration**: Stripe/PayPal integration
6. **Email Notifications**: Booking confirmations and reminders
7. **Loyalty Program**: Frequent flyer miles and rewards
8. **Cancellation Policies**: Flexible cancellation rules by airline
9. **Dynamic Pricing**: AI-based fare optimization
10. **Airport Coordination**: Ground services integration

## License

MIT
