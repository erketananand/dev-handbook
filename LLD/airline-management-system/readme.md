### Requirements:
* User can search the flight based on source, destination, date
  * User can opt Direct, multi-hop, one-way, round-trip option - _Secondary requirement_
* User can sort the flight with price, duration
* User can book the flight by providing passenger details
  * User can select seat & ad-ons - _Secondary requirement_
* User can reschedule & cancel their booking
* System should have flight and user information

### Facade System / AirlineManagementSystem

- **Flight Management:** The system manages flights, each with a unique flight number, aircraft, source, destination, and schedule.
- **Aircraft Management:** Each flight is associated with an aircraft, which has a model and a set of seats.
- **Seat Management:** The system manages seat assignments and availability for each flight.
- **Passenger Management:** Passengers can be added, updated, and associated with bookings.
- **Booking Management:** Users can book flights, and the system tracks bookings, assigned seats, and passengers.
- **Payment Processing:** The system processes payments for bookings.

### Core Entities

- **AirlineManagementSystem:** Main class that manages flights, bookings, passengers, and payments.
- **Flight:** Represents a flight with flight number, aircraft, source, destination, schedule, and seats.
- **Aircraft:** Represents an aircraft with a model and a set of seats.
- **Seat:** Represents a seat on an aircraft, with seat number, class, and availability.
- **Passenger:** Represents a user with ID, name, and contact details.
- **Booking:** Represents a booking, including user(s), flight, seat(s), and payment.
- **Payment (in payment/):** Represents a payment transaction for a booking.
