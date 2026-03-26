# Movie Ticket Booking System - Database Schema

## Tables

### 1. User (Customer Profile)
```sql
CREATE TABLE User (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(512) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);
```

### 2. Movie (Film Details)
```sql
CREATE TABLE Movie (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100) NOT NULL,
  duration_minutes INT NOT NULL,
  language VARCHAR(50) NOT NULL,
  rating DECIMAL(2,1),
  release_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_title (title),
  INDEX idx_genre (genre),
  INDEX idx_release_date (release_date)
);
```

### 3. Theater (Cinema Location)
```sql
CREATE TABLE Theater (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  total_screens INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_city (city),
  INDEX idx_name (name)
);
```

### 4. Screen (Theater Auditorium)
```sql
CREATE TABLE Screen (
  id VARCHAR(36) PRIMARY KEY,
  theater_id VARCHAR(36) NOT NULL,
  screen_number INT NOT NULL,
  total_seats INT NOT NULL,
  layout_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (theater_id) REFERENCES Theater(id),
  UNIQUE KEY unique_screen (theater_id, screen_number),
  INDEX idx_theater_id (theater_id)
);
```

### 5. Show (Movie Showing)
```sql
CREATE TABLE Show (
  id VARCHAR(36) PRIMARY KEY,
  movie_id VARCHAR(36) NOT NULL,
  screen_id VARCHAR(36) NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  available_seats INT NOT NULL,
  total_seats INT NOT NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (movie_id) REFERENCES Movie(id),
  FOREIGN KEY (screen_id) REFERENCES Screen(id),
  INDEX idx_movie_id (movie_id),
  INDEX idx_screen_id (screen_id),
  INDEX idx_show_date (show_date),
  INDEX idx_status (status)
);
```

### 6. SeatCategory (Seat Type - Different Prices)
```sql
CREATE TABLE SeatCategory (
  id VARCHAR(36) PRIMARY KEY,
  screen_id VARCHAR(36) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_seats INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (screen_id) REFERENCES Screen(id),
  INDEX idx_screen_id (screen_id)
);
```

### 7. Seat (Individual Theater Seat)
```sql
CREATE TABLE Seat (
  id VARCHAR(36) PRIMARY KEY,
  screen_id VARCHAR(36) NOT NULL,
  seat_category_id VARCHAR(36) NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (screen_id) REFERENCES Screen(id),
  FOREIGN KEY (seat_category_id) REFERENCES SeatCategory(id),
  UNIQUE KEY unique_seat (screen_id, row_label, seat_number),
  INDEX idx_screen_id (screen_id),
  INDEX idx_status (status)
);
```

### 8. ShowSeat (Seat Availability per Show)
```sql
CREATE TABLE ShowSeat (
  id VARCHAR(36) PRIMARY KEY,
  show_id VARCHAR(36) NOT NULL,
  seat_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  booked_at TIMESTAMP,
  released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (show_id) REFERENCES Show(id),
  FOREIGN KEY (seat_id) REFERENCES Seat(id),
  UNIQUE KEY unique_show_seat (show_id, seat_id),
  INDEX idx_show_id (show_id),
  INDEX idx_status (status)
);
```

### 9. Booking (Ticket Reservation)
```sql
CREATE TABLE Booking (
  id VARCHAR(36) PRIMARY KEY,
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  show_id VARCHAR(36) NOT NULL,
  num_tickets INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  canceled_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (show_id) REFERENCES Show(id),
  INDEX idx_user_id (user_id),
  INDEX idx_show_id (show_id),
  INDEX idx_status (status),
  INDEX idx_booking_number (booking_number)
);
```

### 10. BookingDetail (Seats per Booking)
```sql
CREATE TABLE BookingDetail (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  seat_id VARCHAR(36) NOT NULL,
  seat_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES Booking(id),
  FOREIGN KEY (seat_id) REFERENCES Seat(id),
  INDEX idx_booking_id (booking_id)
);
```

### 11. Payment (Transaction Record)
```sql
CREATE TABLE Payment (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES Booking(id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_status (status)
);
```

### 12. Refund (Cancellation Refund)
```sql
CREATE TABLE Refund (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  payment_id VARCHAR(36),
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_percentage INT,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES Booking(id),
  FOREIGN KEY (payment_id) REFERENCES Payment(id),
  INDEX idx_booking_id (booking_id)
);
```

## Key Indexes

- **Performance**: Indexes on frequently queried fields (city, movie_id, user_id, status, show_date)
- **Uniqueness**: Unique constraints on theater screen numbers, seat positions, booking numbers
- **Referential Integrity**: Foreign keys link all entities maintaining data consistency
- **Concurrency**: Separate ShowSeat table enables real-time seat management

## Row-Level Constraints

- Show date must be >= current date
- Show time must be valid (00:00 - 23:59)
- Total seats must be > 0
- Seat prices must be > 0
- Booking status: PENDING → CONFIRMED → COMPLETED/CANCELLED
- Payment status: PENDING → SUCCESSFUL/FAILED
- Refund percentage: 0-100 based on cancellation timing
