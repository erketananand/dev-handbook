import { Passenger } from '../models/Passenger';
import { Aircraft } from '../models/Aircraft';
import { Flight } from '../models/Flight';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';

/**
 * In-Memory Database using Singleton Pattern
 * Stores all system data in memory using Maps with secondary indexes for fast lookups.
 */
export class InMemoryDatabase {
  private static instance: InMemoryDatabase;

  // Entity storage
  public passengers: Map<string, Passenger> = new Map();
  public aircraft: Map<string, Aircraft> = new Map();
  public flights: Map<string, Flight> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public payments: Map<string, Payment> = new Map();

  // Secondary indexes
  public passengersByEmail: Map<string, Passenger> = new Map();
  public flightsByNumber: Map<string, Flight> = new Map();
  public bookingsByRef: Map<string, Booking> = new Map();
  public bookingsByPassengerId: Map<string, Booking[]> = new Map();
  public bookingsByFlightId: Map<string, Booking[]> = new Map();

  private constructor() {
    console.log('[DATABASE] In-Memory Database initialized');
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  public addPassenger(passenger: Passenger): void {
    this.passengers.set(passenger.id, passenger);
    this.passengersByEmail.set(passenger.email, passenger);
  }

  public addAircraft(aircraft: Aircraft): void {
    this.aircraft.set(aircraft.id, aircraft);
  }

  public addFlight(flight: Flight): void {
    this.flights.set(flight.id, flight);
    this.flightsByNumber.set(flight.flightNumber, flight);
  }

  public addBooking(booking: Booking): void {
    this.bookings.set(booking.id, booking);
    this.bookingsByRef.set(booking.bookingRef, booking);

    if (!this.bookingsByPassengerId.has(booking.passengerId)) {
      this.bookingsByPassengerId.set(booking.passengerId, []);
    }
    this.bookingsByPassengerId.get(booking.passengerId)!.push(booking);

    if (!this.bookingsByFlightId.has(booking.flightId)) {
      this.bookingsByFlightId.set(booking.flightId, []);
    }
    this.bookingsByFlightId.get(booking.flightId)!.push(booking);
  }

  public addPayment(payment: Payment): void {
    this.payments.set(payment.id, payment);
  }

  public clearAll(): void {
    this.passengers.clear();
    this.aircraft.clear();
    this.flights.clear();
    this.bookings.clear();
    this.payments.clear();
    this.passengersByEmail.clear();
    this.flightsByNumber.clear();
    this.bookingsByRef.clear();
    this.bookingsByPassengerId.clear();
    this.bookingsByFlightId.clear();
    console.log('[DATABASE] All data cleared');
  }

  public getStats(): Record<string, number> {
    return {
      passengers: this.passengers.size,
      aircraft: this.aircraft.size,
      flights: this.flights.size,
      bookings: this.bookings.size,
      payments: this.payments.size
    };
  }

  public printStats(): void {
    console.log('\n' + '='.repeat(70));
    console.log('DATABASE STATISTICS');
    console.log('='.repeat(70));
    Object.entries(this.getStats()).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(20)}: ${value}`);
    });
    console.log('='.repeat(70) + '\n');
  }
}
