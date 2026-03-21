import { Booking } from '../models/Booking';
import { BookingStatus } from '../enums/BookingStatus';

/**
 * State Pattern interface for Booking lifecycle management.
 * Prevents invalid state transitions and encapsulates state-specific behavior.
 */
export interface IBookingState {
  confirm(booking: Booking): void;
  cancel(booking: Booking): void;
  reschedule(booking: Booking, newFlightId: string): void;
  getStatus(): BookingStatus;
  getStateName(): string;
}
