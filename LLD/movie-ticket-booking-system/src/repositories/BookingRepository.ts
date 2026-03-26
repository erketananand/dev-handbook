import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums';

export class BookingRepository {
  private bookings: Map<string, Booking> = new Map();

  public save(booking: Booking): void {
    this.bookings.set(booking.id, booking);
  }

  public findById(id: string): Booking | null {
    return this.bookings.get(id) || null;
  }

  public findByNumber(bookingNumber: string): Booking | null {
    for (const booking of this.bookings.values()) {
      if (booking.bookingNumber === bookingNumber) {
        return booking;
      }
    }
    return null;
  }

  public findByUser(userId: string): Booking[] {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  public findByShow(showId: string): Booking[] {
    return Array.from(this.bookings.values()).filter(b => b.showId === showId);
  }

  public getByStatus(status: BookingStatus): Booking[] {
    return Array.from(this.bookings.values()).filter(b => b.status === status);
  }

  public getPendingBookings(): Booking[] {
    return Array.from(this.bookings.values()).filter(b => b.status === BookingStatus.PENDING);
  }

  public getExpiredPendingBookings(): Booking[] {
    return Array.from(this.bookings.values()).filter(
      b => b.status === BookingStatus.PENDING && b.isExpired()
    );
  }

  public getAllBookings(): Booking[] {
    return Array.from(this.bookings.values());
  }

  public update(booking: Booking): void {
    if (this.bookings.has(booking.id)) {
      this.bookings.set(booking.id, booking);
    }
  }

  public delete(bookingId: string): boolean {
    return this.bookings.delete(bookingId);
  }

  public clear(): void {
    this.bookings.clear();
  }

  public getCount(): number {
    return this.bookings.size;
  }
}
