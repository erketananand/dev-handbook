import { IBookingObserver } from './IBookingObserver';
import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';

export class SMSNotifier implements IBookingObserver {
  onBookingConfirmed(booking: Booking): void {
    console.log(`[SMS]   📱 Your booking is confirmed! Ref: ${booking.bookingRef}`);
  }

  onBookingCancelled(booking: Booking): void {
    console.log(`[SMS]   📱 Booking ${booking.bookingRef} has been cancelled.`);
  }

  onFlightStatusChanged(flight: Flight): void {
    console.log(`[SMS]   📱 Alert: Flight ${flight.flightNumber} status: ${flight.status}`);
  }
}
