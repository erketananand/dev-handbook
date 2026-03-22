import { IBookingObserver } from './IBookingObserver';
import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';

export class EmailNotifier implements IBookingObserver {
  onBookingConfirmed(booking: Booking): void {
    console.log(`[EMAIL] ✉  Booking confirmed! Ref: ${booking.bookingRef} | Amount: ₹${booking.totalAmount}`);
  }

  onBookingCancelled(booking: Booking): void {
    console.log(`[EMAIL] ✉  Booking cancelled. Ref: ${booking.bookingRef} | Refund: ₹${booking.calculateRefund()}`);
  }

  onFlightStatusChanged(flight: Flight): void {
    console.log(`[EMAIL] ✉  Flight update: ${flight.flightNumber} (${flight.source} → ${flight.destination}) is now ${flight.status}`);
  }
}
