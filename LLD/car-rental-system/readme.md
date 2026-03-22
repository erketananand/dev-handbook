# Car Rental System

A comprehensive **car rental management system** that handles vehicle reservations, customer management, payments, and maintenance tracking. Built with TypeScript using an in-memory database and layered architecture.

## System Overview

The Car Rental System manages end-to-end vehicle rental operations including:
- **Vehicle Fleet Management**: Track available vehicles, maintenance schedules, and vehicle status
- **Customer Management**: Register customers, validate driver licenses, and manage customer profiles
- **Reservation System**: Create, confirm, and manage vehicle reservations with date/price validation
- **Payment Processing**: Process payments with multiple payment methods and track revenue
- **Maintenance Tracking**: Schedule and manage vehicle maintenance
- **Location Management**: Manage multiple rental locations across different cities
- **Insurance Management**: Offer different insurance plans with dynamic premium calculation

## Design Patterns

### 1. **Singleton Pattern**
Used in `InMemoryDatabase` to ensure only one instance of the database exists throughout the application lifecycle.

```typescript
// Centralized database
const db = InMemoryDatabase.getInstance();
```

### 2. **Repository Pattern**
Data access layer abstracts database operations from business logic.

```typescript
// CustomerRepository, CarRepository, ReservationRepository, PaymentRepository
customerRepository.findById(id);
carRepository.getAvailableCars();
reservationRepository.getConflictingReservations(carId, startDate, endDate);
```

### 3. **Service Layer Pattern**
Business logic is encapsulated in service classes that use repositories.

```typescript
// CustomerService handles customer registration and validation
customerService.register(name, email, phone, license, expiry, address);

// RentalService manages reservations and dates
rentalService.createReservation(customerId, carId, startDate, endDate, ...);
```

### 4. **Factory Pattern**
Creation of complex objects is centralized.

```typescript
// Customer, Car, Reservation, Payment objects created through services
const customer = new Customer(...);
const reservation = new Reservation(...);
```

### 5. **Strategy Pattern**
Different strategies for payments, searches, and calculations.

```typescript
// Different payment methods
PaymentMethod.CREDIT_CARD | DEBIT_CARD | UPI | WALLET

// Different insurance types
InsuranceType.BASIC | PREMIUM | FULL_COVERAGE
```

### 6. **State Pattern**
Entity lifecycle management through status enums.

```typescript
// Car status lifecycle
CarStatus.AVAILABLE → BOOKED → MAINTENANCE → AVAILABLE

// Reservation status lifecycle
ReservationStatus.PENDING → CONFIRMED → ACTIVE → COMPLETED
```

### 7. **Observer Pattern (Implicit)**
Service layer notifies about state changes (payment status, reservation confirmation).

## Project Structure

```
car-rental-system/
├── src/
│   ├── console/
│   │   └── ConsoleInterface.ts        # UI/Menu system for user interactions
│   │
│   ├── database/
│   │   └── InMemoryDatabase.ts        # Singleton in-memory database with all repositories
│   │
│   ├── enums/
│   │   └── index.ts                   # All status and type enumerations
│   │
│   ├── models/
│   │   ├── Customer.ts                # Customer profile with license validation
│   │   ├── Car.ts                     # Vehicle details and status management
│   │   ├── Reservation.ts             # Booking details and lifecycle
│   │   ├── Payment.ts                 # Transaction handling
│   │   ├── VehicleMaintenance.ts      # Maintenance record tracking
│   │   ├── RentalLocation.ts          # Pickup/dropoff locations
│   │   └── Insurance.ts               # Insurance policy management
│   │
│   ├── repositories/
│   │   ├── CustomerRepository.ts      # Customer data access
│   │   ├── CarRepository.ts           # Vehicle data access
│   │   ├── ReservationRepository.ts   # Reservation data access
│   │   └── PaymentRepository.ts       # Payment data access
│   │
│   ├── services/
│   │   ├── CustomerService.ts         # Customer registration and management
│   │   ├── VehicleService.ts          # Fleet management and maintenance
│   │   ├── RentalService.ts           # Reservation creation and management
│   │   ├── PaymentService.ts          # Payment processing
│   │   └── SetupService.ts            # System initialization with sample data
│   │
│   ├── utils/
│   │   ├── IdGenerator.ts             # Unique ID generation
│   │   └── ValidationUtil.ts          # Data validation utilities
│   │
│   └── index.ts                       # Application entry point
│
├── package.json                        # Project dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── .gitignore                          # Git ignore rules
├── schema.md                           # Database schema documentation
├── class-diagram.md                    # Architecture and design documentation
└── README.md                           # This file
```

## Core Entities

### 1. **Customer**
- Manages customer profiles with license validation
- validates email, phone, and driver license format
- Tracks license expiry date
- Methods: `register()`, `getCustomerById()`, `updateCustomer()`, `canRent()`

**Fields**: id, name, email, phone, driverLicense, licenseExpiry, address

### 2. **Car**
- Manages vehicle fleet with detailed specifications
- Tracks vehicle status (AVAILABLE, BOOKED, MAINTENANCE, RETIRED)
- Manages mileage and pricing
- Methods: `addCar()`, `getAvailableCars()`, `markAsBooked()`, `markForMaintenance()`

**Fields**: id, licensePlate, brand, model, year, carType, fuelType, seatCapacity, basePrice, status

### 3. **Reservation**
- Handles vehicle booking with date conflict detection
- Manages reservation lifecycle (PENDING → CONFIRMED → ACTIVE → COMPLETED)
- Calculates rental pricing
- Methods: `createReservation()`, `confirmReservation()`, `cancelReservation()`, `completeReservation()`

**Fields**: id, reservationNumber, customerId, carId, startDate, endDate, pickupLocation, dropoffLocation, totalPrice, status

### 4. **Payment**
- Processes payments with multiple methods (Credit Card, Debit Card, UPI, Wallet)
- Tracks payment status (PENDING, SUCCESSFUL, FAILED, REFUNDED)
- Manages transaction IDs
- Methods: `createPayment()`, `processPayment()`, `refundPayment()`, `getPaymentSummary()`

**Fields**: id, reservationId, paymentMethod, amount, status, transactionId

### 5. **VehicleMaintenance**
- Tracks maintenance records and schedules
- Manages maintenance types (OIL_CHANGE, TIRE_ROTATION, REPAIR, INSPECTION, CLEANING)
- Calculates maintenance duration
- Methods: `scheduleMaintenance()`, `completeMaintenance()`, `getMaintenanceHistory()`

**Fields**: id, carId, maintenanceType, description, cost, startDate, endDate, status

### 6. **RentalLocation**
- Manages multiple rental branches
- Stores location details (address, city, phone, hours)
- Methods: `saveLocation()`, `getLocationsByCity()`, `getAllLocations()`

**Fields**: id, name, address, city, phone, operatingHours

### 7. **Insurance**
- Manages insurance policies with dynamic premium calculation
- Different coverage levels (BASIC, PREMIUM, FULL_COVERAGE)
- Tracks claims and policy status
- Methods: `activate()`, `claim()`, `expire()`

**Fields**: id, reservationId, insuranceType, premiumAmount, coverageLimit, deductible, status

## Key Features

### 1. **Vehicle Availability Management**
- Real-time availability checking
- Date range conflict detection
- Automatic status management (AVAILABLE → BOOKED → AVAILABLE)
- Price-based filtering

### 2. **Customer Validation**
- Email and phone format validation
- Driver license format and expiry verification
- Customer eligibility checking before rental

### 3. **Flexible Pricing**
- Dynamic pricing based on vehicle type and rental duration
- Automatic calculation of total rental cost
- Refund calculation based on cancellation timing

### 4. **Payment Processing**
- Multiple payment method support
- Transaction ID generation and tracking
- Revenue reporting and analytics
- Refund management

### 5. **Reservation Management**
- Automatic conflict detection
- Status-based lifecycle management
- Reservation history tracking per customer
- Easy cancellation with refund policies

### 6. **Maintenance Scheduling**
- Maintenance history per vehicle
- Automatic vehicle status update during maintenance
- Maintenance cost tracking
- Maintenance type categorization

### 7. **Multi-Location Support**
- Multiple rental branches across cities
- Location-based search and filtering
- Operating hours management
- Pickup and dropoff location selection

## Sample Test Data

### Customers (3)
- **Rajesh Kumar** | Email: rajesh.kumar@email.com | License: DL5K9BX2FM | Valid until 2027
- **Priya Singh** | Email: priya.singh@email.com | License: DL7M2KL9QR | Valid until 2026
- **Amit Patel** | Email: amit.patel@email.com | License: DL3N8XY1WS | Valid until 2028

### Vehicles (5)
1. **Toyota Innova Crysta** (VAN) | ₹3500/day | 7 seats | License: DL01AB1234
2. **Hyundai Creta** (SUV) | ₹2500/day | 5 seats | License: DL01AB1235
3. **Maruti Swift** (HATCHBACK) | ₹1500/day | 5 seats | License: DL01AB1236
4. **Honda Accord** (SEDAN) | ₹2800/day | 5 seats | License: DL01AB1237
5. **Mahindra XUV700** (SUV) | ₹3200/day | 7 seats | License: DL01AB1238

### Rental Locations (3)
- **Downtown Branch** | New Delhi | 9:00 AM - 9:00 PM
- **Airport Branch** | New Delhi | 24/7 Operations
- **Bangalore Branch** | Bangalore | 8:00 AM - 8:00 PM

### Sample Reservations (2)
1. Rajesh Kumar → Toyota Innova Crysta | 3 days | Total: ₹10,500
2. Priya Singh → Hyundai Creta | 5 days | Total: ₹12,500

## Installation & Setup

### Prerequisites
- Node.js 18+
- TypeScript 5.0+
- npm or yarn

### Steps

1. **Navigate to project directory**
   ```bash
   cd car-rental-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run build
   ```

4. **Run the application**
   ```bash
   npm start
   ```

   Or in development mode with auto-reload:
   ```bash
   npm run dev
   ```

## Testing the System

### Test Scenario 1: Customer Registration
```
1. Go to Customer Management → Register New Customer
2. Enter details (all validations are performed)
3. System confirms successful registration with customer ID
```

### Test Scenario 2: Vehicle Search and Booking
```
1. Go to Book a Car
2. Enter customer email (e.g., rajesh.kumar@email.com)
3. View available vehicles
4. Select a vehicle and number of days
5. Reservation automatically created and confirmed
6. Payment processed automatically
7. Insurance policy added
```

### Test Scenario 3: Payment Management
```
1. Go to Payment Management → View Payment Summary
2. View total revenue, successful/failed payments
3. Check transaction details for each payment
```

### Test Scenario 4: Reservation Cancellation
```
1. Go to Manage Reservations → View All Reservations
2. Get reservation number
3. Cancel Reservation (only PENDING/CONFIRMED can be cancelled)
4. Refund calculated based on timing
```

### Test Scenario 5: Fleet Status
```
1. Go to Vehicle Management → View Fleet Status
2. Check available/booked/maintenance vehicles
3. See total fleet count
```

## Validation Rules

### Customer Validation
- Email must be in valid format (contains @ and domain)
- Phone must be 10 digits
- Driver license must be alphanumeric
- License expiry date must be in future
- Name and address cannot be empty

### Car Validation
- License plate must be unique and non-empty
- Brand and model required
- Year must be >= 2000
- Seat capacity must be >= 1
- Base price must be > 0

### Reservation Validation
- Start date must be before end date
- Both dates must be valid
- Car must be available during entire period
- Customer must have valid, non-expired license
- No overlapping reservations for same car

### Payment Validation
- Amount must match reservation total
- Only one successful payment per reservation
- Refunds only for successful payments
- Refund amount cannot exceed payment amount

## Security Features

### Customer Protection
- Driver license expiry validation
- Valid email and phone verification
- Customer eligibility checking before rental

### Transaction Security
- Unique transaction IDs for all payments
- Payment status tracking
- Refund audit trail

### Data Integrity
- Unique identifiers (UUID) for all entities
- Date validation for all temporal operations
- Status-based state machine for entities
- Conflict detection for reservations

## API/Service Methods

### CustomerService
```typescript
register(name, email, phone, license, expiry, address)
getCustomerById(customerId)
getCustomerByEmail(email)
getAllCustomers()
updateCustomer(customerId, updates)
deleteCustomer(customerId)
canRent(customerId)
```

### VehicleService
```typescript
addCar(licensePlate, brand, model, year, carType, fuelType, seats, color, price)
getCarById(carId)
getAvailableCars()
getAvailableCarsByType(carType)
getAllCars()
scheduleMaintenance(carId, maintenanceType, description, cost)
completeMaintenance(maintenanceId)
updateCarMileage(carId, distance)
```

### RentalService
```typescript
createReservation(customerId, carId, startDate, endDate, pickup, dropoff, basePrice)
confirmReservation(reservationId)
activateReservation(reservationId)
completeReservation(reservationId, distanceTraveled)
cancelReservation(reservationId)
getCustomerReservations(customerId)
getActiveReservations()
```

### PaymentService
```typescript
createPayment(reservationId, paymentMethod, amount)
processPayment(paymentId)
failPayment(paymentId)
refundPayment(paymentId, refundAmount)
getPaymentByReservation(reservationId)
getTotalRevenue()
getPaymentSummary()
```

## Potential Enhancements

1. **Authentication & Authorization** - User login, role-based access control
2. **Persistent Database** - Replace in-memory with SQL/NoSQL database
3. **Email Notifications** - Automated confirmation and reminder emails
4. **SMS Integration** - SMS alerts for bookings and payments
5. **Loyalty Program** - Reward points, discounts, membership tiers
6. **Vehicle Damage Assessment** - Photos, damage reports, liability tracking
7. **GPS & Tracking** - Real-time vehicle tracking and location monitoring
8. **Driver Rating System** - Rate drivers, track driving behavior
9. **Advanced Analytics** - Reporting dashboard, revenue analytics, utilization metrics
10. **Mobile App** - iOS/Android app for bookings and management

## Error Handling

All operations include comprehensive error handling:
- Invalid customer data throws descriptive errors
- Date conflicts detected and prevented
- License expiry validation prevents invalid rentals
- Payment failures handled gracefully
- Maintenance status prevents vehicle booking

## Code Quality

- **Strict TypeScript**: All files use strict mode
- **Type Safety**: Comprehensive type definitions throughout
- **Separation of Concerns**: Clear layering (Console → Services → Repositories → Database)
- **SOLID Principles**: Single responsibility, dependency injection, open/closed principle
- **Error Handling**: Try-catch blocks with meaningful error messages
- **Validation**: Input validation at service layer
- **Reusability**: Utility functions for common operations

## Running Tests

Sample data is automatically loaded on startup:
- 3 customers with valid licenses
- 5 vehicles across different categories
- 3 rental locations
- 2 completed reservations with payments
- Insurance policies for all reservations

System status displays immediately after startup showing all loaded data.

## License

This is an educational project for learning Low-Level Design (LLD) concepts.

## Author

Created as part of the Developer Handbook - Low-Level Design Systems repository.