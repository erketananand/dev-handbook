import { IBookingState } from './IBookingState';
import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums/BookingStatus';
import { CancelledState } from './CancelledState';

export class RescheduledState implements IBookingState {
  private readonly originalFlightId: string;
  private readonly rescheduledAt: Date;

  constructor(originalFlightId: string) {
    this.originalFlightId = originalFlightId;
    this.rescheduledAt = new Date();
  }

  confirm(booking: Booking): void {
    console.log(`[STATE] Booking ${booking.bookingRef} is CONFIRMED (rescheduled).`);
  }

  cancel(booking: Booking): void {
    const refund = booking.calculateRefund();
    booking.setState(new CancelledState(refund));
    console.log(`[STATE] Booking ${booking.bookingRef} → CANCELLED | Refund: ₹${refund}`);
  }

  reschedule(booking: Booking, newFlightId: string): void {
    booking.flightId = newFlightId;
    booking.setState(new RescheduledState(this.originalFlightId));
    console.log(`[STATE] Booking ${booking.bookingRef} → RESCHEDULED again to flight ${newFlightId}`);
  }

  getStatus(): BookingStatus {
    return BookingStatus.RESCHEDULED;
  }

  getStateName(): string {
    return 'Rescheduled';
  }

  getOriginalFlightId(): string {
    return this.originalFlightId;
  }

  getRescheduledAt(): Date {
    return this.rescheduledAt;
  }
}
