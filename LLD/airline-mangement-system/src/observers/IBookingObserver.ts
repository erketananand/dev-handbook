import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';

/**
 * Observer Pattern interface for booking and flight event notifications.
 * New notification channels (push, in-app) can be added without changing core logic.
 */
export interface IBookingObserver {
  onBookingConfirmed(booking: Booking): void;
  onBookingCancelled(booking: Booking): void;
  onFlightStatusChanged(flight: Flight): void;
}
