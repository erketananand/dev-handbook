import { IBookingObserver } from './IBookingObserver';
import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';

/**
 * Singleton subject in the Observer Pattern.
 * Decouples booking/flight logic from notification delivery.
 */
export class BookingNotifier {
  private static instance: BookingNotifier;
  private observers: IBookingObserver[] = [];

  private constructor() {}

  public static getInstance(): BookingNotifier {
    if (!BookingNotifier.instance) {
      BookingNotifier.instance = new BookingNotifier();
    }
    return BookingNotifier.instance;
  }

  public attach(observer: IBookingObserver): void {
    this.observers.push(observer);
  }

  public detach(observer: IBookingObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  public notifyBookingConfirmed(booking: Booking): void {
    this.observers.forEach(o => o.onBookingConfirmed(booking));
  }

  public notifyBookingCancelled(booking: Booking): void {
    this.observers.forEach(o => o.onBookingCancelled(booking));
  }

  public notifyFlightStatusChanged(flight: Flight): void {
    this.observers.forEach(o => o.onFlightStatusChanged(flight));
  }
}
