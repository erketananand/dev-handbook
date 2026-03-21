import { IBookingState } from './IBookingState';
import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums/BookingStatus';

export class CancelledState implements IBookingState {
  private readonly cancelledAt: Date;
  private readonly refundAmount: number;

  constructor(refundAmount: number) {
    this.cancelledAt = new Date();
    this.refundAmount = refundAmount;
  }

  confirm(booking: Booking): void {
    throw new Error(`Cannot confirm booking ${booking.bookingRef}: already cancelled.`);
  }

  cancel(booking: Booking): void {
    console.log(`[STATE] Booking ${booking.bookingRef} is already CANCELLED.`);
  }

  reschedule(booking: Booking, _newFlightId: string): void {
    throw new Error(`Cannot reschedule booking ${booking.bookingRef}: already cancelled.`);
  }

  getStatus(): BookingStatus {
    return BookingStatus.CANCELLED;
  }

  getStateName(): string {
    return 'Cancelled';
  }

  getCancelledAt(): Date {
    return this.cancelledAt;
  }

  getRefundAmount(): number {
    return this.refundAmount;
  }
}
