import { IBookingState } from './IBookingState';
import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums/BookingStatus';
import { ConfirmedState } from './ConfirmedState';
import { CancelledState } from './CancelledState';

export class PendingState implements IBookingState {
  confirm(booking: Booking): void {
    booking.setState(new ConfirmedState());
    console.log(`[STATE] Booking ${booking.bookingRef} → CONFIRMED`);
  }

  cancel(booking: Booking): void {
    booking.setState(new CancelledState(0)); // No refund — payment not made yet
    console.log(`[STATE] Booking ${booking.bookingRef} → CANCELLED (pending, no refund)`);
  }

  reschedule(booking: Booking, _newFlightId: string): void {
    throw new Error(`Cannot reschedule booking ${booking.bookingRef}: payment not yet completed.`);
  }

  getStatus(): BookingStatus {
    return BookingStatus.PENDING;
  }

  getStateName(): string {
    return 'Pending';
  }
}
