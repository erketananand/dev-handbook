import { IBookingState } from './IBookingState';
import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums/BookingStatus';
import { CancelledState } from './CancelledState';
import { RescheduledState } from './RescheduledState';

export class ConfirmedState implements IBookingState {
  private readonly confirmedAt: Date;

  constructor() {
    this.confirmedAt = new Date();
  }

  confirm(booking: Booking): void {
    console.log(`[STATE] Booking ${booking.bookingRef} is already CONFIRMED.`);
  }

  cancel(booking: Booking): void {
    const refund = booking.calculateRefund();
    booking.setState(new CancelledState(refund));
    console.log(`[STATE] Booking ${booking.bookingRef} → CANCELLED | Refund: ₹${refund}`);
  }

  reschedule(booking: Booking, newFlightId: string): void {
    const oldFlightId = booking.flightId;
    booking.flightId = newFlightId;
    booking.setState(new RescheduledState(oldFlightId));
    console.log(`[STATE] Booking ${booking.bookingRef} → RESCHEDULED to flight ${newFlightId}`);
  }

  getStatus(): BookingStatus {
    return BookingStatus.CONFIRMED;
  }

  getStateName(): string {
    return 'Confirmed';
  }

  getConfirmedAt(): Date {
    return this.confirmedAt;
  }
}
