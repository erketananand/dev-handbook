import { IRepository } from './IRepository';
import { Booking } from '../models/Booking';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { BookingStatus } from '../enums/BookingStatus';

export class BookingRepository implements IRepository<Booking> {
  private db = InMemoryDatabase.getInstance();

  findById(id: string): Booking | undefined {
    return this.db.bookings.get(id);
  }

  findAll(): Booking[] {
    return Array.from(this.db.bookings.values());
  }

  save(booking: Booking): Booking {
    this.db.addBooking(booking);
    return booking;
  }

  update(booking: Booking): Booking {
    this.db.bookings.set(booking.id, booking);
    this.db.bookingsByRef.set(booking.bookingRef, booking);
    return booking;
  }

  delete(id: string): boolean {
    const booking = this.db.bookings.get(id);
    if (!booking) return false;
    this.db.bookings.delete(id);
    this.db.bookingsByRef.delete(booking.bookingRef);
    return true;
  }

  exists(id: string): boolean {
    return this.db.bookings.has(id);
  }

  count(): number {
    return this.db.bookings.size;
  }

  clear(): void {
    this.db.bookings.clear();
    this.db.bookingsByRef.clear();
  }

  findByRef(bookingRef: string): Booking | undefined {
    return this.db.bookingsByRef.get(bookingRef);
  }

  findByPassengerId(passengerId: string): Booking[] {
    return this.db.bookingsByPassengerId.get(passengerId) || [];
  }

  findByFlightId(flightId: string): Booking[] {
    return this.db.bookingsByFlightId.get(flightId) || [];
  }

  findByStatus(status: BookingStatus): Booking[] {
    return this.findAll().filter(b => b.getStatus() === status);
  }

  findConfirmedBookings(): Booking[] {
    return this.findByStatus(BookingStatus.CONFIRMED);
  }
}
