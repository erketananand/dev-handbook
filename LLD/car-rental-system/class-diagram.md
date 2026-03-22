# Car Rental System - Class Diagram

## ARCHITECTURE OVERVIEW

The system uses a **layered service architecture** with clear separation of concerns:

```
ConsoleInterface (UI)
    ↓
Services: RentalService | PaymentService | CustomerService | VehicleService
    ↓
Repositories: CarRepository | CustomerRepository | ReservationRepository | PaymentRepository
    ↓
InMemoryDatabase (Singleton) — stores Maps + secondary indexes
```

---

## DESIGN PATTERNS USED

1. **Singleton**: InMemoryDatabase (single instance for all data)
2. **Repository**: Data access layer abstraction
3. **Factory**: Reservation and Payment creation
4. **Strategy**: Different payment strategies and search filters
5. **State**: Vehicle and Reservation state management
6. **Observer**: Payment and Reservation notifications
7. **Builder**: Complex reservation creation

---

## CORE CLASSES

### 1. Customer
**Attributes:**
- id: string (UUID)
- name: string
- email: string (unique)
- phone: string
- driverLicense: string (unique)
- licenseExpiry: Date
- address: string
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(name, email, phone, driverLicense, licenseExpiry, address, id?)
- isLicenseValid(): boolean
- isValid(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Store customer information and driver details
- Validate driver license status

---

### 2. Car
**Attributes:**
- id: string (UUID)
- licensePlate: string (unique)
- brand: string
- model: string
- year: number
- carType: CarType (enum: SEDAN, SUV, HATCHBACK, VAN)
- fuelType: FuelType (enum: PETROL, DIESEL, HYBRID, ELECTRIC)
- seatCapacity: number
- color: string
- basePrice: number (per day)
- mileage: number
- status: CarStatus (enum: AVAILABLE, BOOKED, MAINTENANCE, RETIRED)
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(licensePlate, brand, model, year, carType, fuelType, seatCapacity, color, basePrice, id?)
- isAvailable(): boolean
- markAsBooked(): void
- markAsAvailable(): void
- markForMaintenance(): void
- ret ire(): void
- updateMileage(distance: number): void
- isValid(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Model a physical vehicle with all specifications
- Manage car status and availability
- Track vehicle mileage and maintenance

---

### 3. Reservation
**Attributes:**
- id: string (UUID)
- reservationNumber: string (unique)
- customerId: string
- carId: string
- startDate: Date
- endDate: Date
- pickupLocation: string
- dropoffLocation: string
- status: ReservationStatus (enum: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED)
- totalPrice: number
- numDays: number
- createdAt: Date
- updatedAt: Date

**Methods:**
- constructor(customerId, carId, startDate, endDate, pickupLocation, dropoffLocation, totalPrice, id?)
- calculateNumDays(): number
- confirm(): void
- activate(): void
- complete(): void
- cancel(): void
- isValid(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Track car rental reservations
- Manage reservation lifecycle and status transitions
- Calculate rental duration and pricing

---

### 4. Payment
**Attributes:**
- id: string (UUID)
- reservationId: string
- paymentMethod: PaymentMethod (enum)
- amount: number
- status: PaymentStatus (enum: PENDING, SUCCESSFUL, FAILED, REFUNDED)
- transactionId: string | null
- createdAt: Date
- processedAt: Date | null

**Methods:**
- constructor(reservationId, paymentMethod, amount, id?)
- process(): boolean
- refund(): boolean
- isFailed(): boolean
- isSuccessful(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Handle payment transactions
- Track payment status and history

---

### 5. VehicleMaintenance
**Attributes:**
- id: string (UUID)
- carId: string
- maintenanceType: MaintenanceType (enum)
- description: string
- cost: number
- startDate: Date
- endDate: Date | null
- status: MaintenanceStatus (enum: SCHEDULED, IN_PROGRESS, COMPLETED)

**Methods:**
- constructor(carId, maintenanceType, description, cost, id?)
- start(): void
- complete(): void
- getDuration(): number | null
- getDisplayInfo(): string

**Responsibilities:**
- Track vehicle maintenance records
- Manage maintenance lifecycle

---

### 6. RentalLocation
**Attributes:**
- id: string (UUID)
- name: string
- address: string (unique)
- city: string
- phone: string
- operatingHours: string

**Methods:**
- constructor(name, address, city, phone, operatingHours, id?)
- isValid(): boolean
- getDisplayInfo(): string

**Responsibilities:**
- Represent rental pickup/dropoff locations

---

### 7. Insurance
**Attributes:**
- id: string (UUID)
- reservationId: string
- insuranceType: InsuranceType (enum: BASIC, PREMIUM, FULL_COVERAGE)
- premiumAmount: number
- coverageLimit: number
- deductible: number
- status: InsuranceStatus (enum: ACTIVE, CLAIMED, EXPIRED)

**Methods:**
- constructor(reservationId, insuranceType, id?)
- activate(): void
- claim(): void
- expire(): void
- getDisplayInfo(): string

**Responsibilities:**
- Manage rental insurance policies

---

## REPOSITORY CLASSES

### CustomerRepository
**Methods:**
- save(customer: Customer): void
- findById(id: string): Customer | undefined
- findByEmail(email: string): Customer | undefined
- findByDriverLicense(license: string): Customer | undefined
- update(customer: Customer): void
- delete(id: string): void
- getAll(): Customer[]

---

### CarRepository
**Methods:**
- save(car: Car): void
- findById(id: string): Car | undefined
- findByLicensePlate(plate: string): Car | undefined
- findByStatus(status: CarStatus): Car[]
- findByType(carType: CarType): Car[]
- findAvailableCars(startDate, endDate): Car[]
- update(car: Car): void
- delete(id: string): void
- getAll(): Car[]

---

### ReservationRepository
**Methods:**
- save(reservation: Reservation): void
- findById(id: string): Reservation | undefined
- findByReservationNumber(number: string): Reservation | undefined
- findByCustomerId(customerId: string): Reservation[]
- findByCarId(carId: string): Reservation[]
- findByDateRange(startDate, endDate): Reservation[]
- update(reservation: Reservation): void
- delete(id: string): void

---

### PaymentRepository
**Methods:**
- save(payment: Payment): void
- findById(id: string): Payment | undefined
- findByReservationId(reservationId: string): Payment | undefined
- findByStatus(status: PaymentStatus): Payment[]
- update(payment: Payment): void
- getAll(): Payment[]

---

## SERVICE CLASSES

### RentalService
**Responsibilities:**
- Search available cars by date range, location, and filters
- Create and manage reservations
- Calculate rental pricing
- Prevent double-bookings
- Handle reservation lifecycle (confirm, activate, complete, cancel)
- Reschedule reservations

---

### PaymentService
**Responsibilities:**
- Process payments for reservations
- Handle multiple payment methods
- Track payment status
- Process refunds

---

### CustomerService
**Responsibilities:**
- Register and manage customers
- Validate driver licenses
- Manage customer profiles

---

### VehicleService
**Responsibilities:**
- Add and manage cars
- Update car status and mileage
- Handle vehicle maintenance
- Retire vehicles

---

## ENUMS

```typescript
enum CarType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  HATCHBACK = 'HATCHBACK',
  VAN = 'VAN'
}

enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC'
}

enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED'
}

enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  WALLET = 'WALLET'
}

enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_ROTATION = 'TIRE_ROTATION',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  CLEANING = 'CLEANING'
}

enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

enum InsuranceType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  FULL_COVERAGE = 'FULL_COVERAGE'
}

enum InsuranceStatus {
  ACTIVE = 'ACTIVE',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}
```

---

## KEY INTERACTIONS

1. **Search & Book Flow**:
   - Customer searches cars by date, location, type
   - System returns available cars
   - Customer creates reservation
   - System prevents double-booking

2. **Confirmation Flow**:
   - Reservation created with PENDING status
   - Payment processed
   - Reservation confirmed → status = CONFIRMED
   - Car status = BOOKED

3. **Rental Flow**:
   - Reservation activated → status = ACTIVE
   - Car status = BOOKED
   - Customer picks up car

4. **Return Flow**:
   - Customer returns car
   - Update mileage and condition
   - Schedule maintenance if needed
   - Reservation completed → status = COMPLETED
   - Car status = AVAILABLE (after maintenance if needed)
   - Process refund if applicable

5. **Cancellation Flow**:
   - Reservation cancelled → status = CANCELLED
   - Car status = AVAILABLE
   - Process full/partial refund based on cancellation policy
