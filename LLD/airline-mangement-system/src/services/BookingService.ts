import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { BookingRepository } from '../repositories/BookingRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { FlightRepository } from '../repositories/FlightRepository';
import { IPaymentMethod } from '../strategies/payment/IPaymentMethod';
import { BookingNotifier } from '../observers/BookingNotifier';
import { SeatLockManager } from '../utils/SeatLockManager';
import { BookingStatus } from '../enums/BookingStatus';
import { SeatClass } from '../enums/SeatClass';
import { Logger } from '../utils/Logger';

export class BookingService {
  private bookingRepo = new BookingRepository();
  private paymentRepo = new PaymentRepository();
  private flightRepo = new FlightRepository();
  private notifier = BookingNotifier.getInstance();
  private lockManager = SeatLockManager.getInstance();

  public createBooking(
    passengerId: string,
    flightId: string,
    seatId: string | null,
    totalAmount: number
  ): Booking | null {
    const flight = this.flightRepo.findById(flightId);
    if (!flight) {
      Logger.error('Flight not found.');
      return null;
    }

    if (flight.status === 'CANCELLED' as any) {
      Logger.error('Cannot book a cancelled flight.');
      return null;
    }

    // Validate seat availability
    if (seatId) {
      const flightSeat = flight.getSeatAvailability(seatId);
      if (!flightSeat || !flightSeat.isAvailable) {
        Logger.error('Selected seat is not available.');
        return null;
      }
    }

    const booking = new Booking(passengerId, flightId, totalAmount, seatId);

    // Lock seat to prevent double-booking
    if (seatId) {
      const locked = this.lockManager.tryLock(seatId, flightId, booking.id);
      if (!locked) {
        Logger.error('Seat is temporarily held by another session. Please try again.');
        return null;
      }
      flight.lockSeat(seatId);
      this.flightRepo.update(flight);
    }

    this.bookingRepo.save(booking);
    Logger.success(`Booking created: ${booking.bookingRef} (PENDING payment)`);
    return booking;
  }

  public processPayment(bookingId: string, paymentMethod: IPaymentMethod): boolean {
    const booking = this.bookingRepo.findById(bookingId);
    if (!booking) {
      Logger.error('Booking not found.');
      return false;
    }

    if (booking.getStatus() !== BookingStatus.PENDING) {
      Logger.error(`Cannot process payment for booking in ${booking.getStatus()} state.`);
      return false;
    }

    const payment = new Payment(bookingId, booking.totalAmount, paymentMethod);
    const success = payment.process();
    this.paymentRepo.save(payment);

    if (success) {
      booking.assignPayment(payment.id);
      booking.confirm();
      this.bookingRepo.update(booking);
      // Release SeatLockManager lock — flight seat is already locked in the Flight object
      if (booking.seatId) {
        this.lockManager.releaseLock(booking.seatId, booking.flightId, booking.id);
      }
      this.notifier.notifyBookingConfirmed(booking);
      Logger.success(`Payment successful. Booking ${booking.bookingRef} CONFIRMED.`);
      return true;
    } else {
      // Release seat so others can book it
      if (booking.seatId) {
        const flight = this.flightRepo.findById(booking.flightId);
        if (flight) {
          flight.releaseSeat(booking.seatId);
          this.flightRepo.update(flight);
        }
        this.lockManager.releaseLock(booking.seatId, booking.flightId, booking.id);
      }
      Logger.error('Payment failed. Seat released.');
      return false;
    }
  }

  public cancelBooking(bookingRef: string): boolean {
    const booking = this.bookingRepo.findByRef(bookingRef);
    if (!booking) {
      Logger.error('Booking not found.');
      return false;
    }

    if (booking.getStatus() === BookingStatus.CANCELLED) {
      Logger.warn('Booking is already cancelled.');
      return false;
    }

    booking.cancel();
    this.bookingRepo.update(booking);

    // Release seat back to inventory
    if (booking.seatId) {
      const flight = this.flightRepo.findById(booking.flightId);
      if (flight) {
        flight.releaseSeat(booking.seatId);
        this.flightRepo.update(flight);
      }
    }

    // Process refund
    if (booking.paymentId) {
      const payment = this.paymentRepo.findById(booking.paymentId);
      if (payment) {
        const refund = booking.calculateRefund();
        payment.refund(refund);
        this.paymentRepo.update(payment);
        Logger.info(`Refund of ₹${refund} initiated.`);
      }
    }

    this.notifier.notifyBookingCancelled(booking);
    Logger.success(`Booking ${bookingRef} cancelled.`);
    return true;
  }

  public rescheduleBooking(bookingRef: string, newFlightId: string): boolean {
    const booking = this.bookingRepo.findByRef(bookingRef);
    if (!booking) {
      Logger.error('Booking not found.');
      return false;
    }

    const newFlight = this.flightRepo.findById(newFlightId);
    if (!newFlight) {
      Logger.error('New flight not found.');
      return false;
    }

    // Release old seat
    if (booking.seatId) {
      const oldFlight = this.flightRepo.findById(booking.flightId);
      if (oldFlight) {
        oldFlight.releaseSeat(booking.seatId);
        this.flightRepo.update(oldFlight);
      }
      booking.seatId = null;
    }

    booking.reschedule(newFlightId);
    this.bookingRepo.update(booking);
    Logger.success(`Booking ${bookingRef} rescheduled to ${newFlight.flightNumber}.`);
    return true;
  }

  public getBookingByRef(ref: string): Booking | undefined {
    return this.bookingRepo.findByRef(ref);
  }

  public getBookingsByPassenger(passengerId: string): Booking[] {
    return this.bookingRepo.findByPassengerId(passengerId);
  }

  public displayBookingDetails(booking: Booking): void {
    const flight = this.flightRepo.findById(booking.flightId);
    console.log('\n' + '='.repeat(80));
    console.log(`BOOKING DETAILS  -  Ref: ${booking.bookingRef}`);
    console.log('='.repeat(80));
    console.log(`Status     : ${booking.getStatus()}`);

    if (flight) {
      console.log(`Flight     : ${flight.flightNumber} | ${flight.source} → ${flight.destination}`);
      console.log(`Departure  : ${flight.departureTime.toLocaleString()}`);
      console.log(`Arrival    : ${flight.arrivalTime.toLocaleString()}`);
    }

    if (booking.seatId && flight) {
      const fs = flight.getSeatAvailability(booking.seatId);
      if (fs) console.log(`Seat       : ${fs.seat.seatNumber} (${fs.seat.seatClass})`);
    } else {
      console.log('Seat       : Not assigned');
    }

    console.log(`Amount     : ₹${booking.totalAmount}`);
    console.log(`Payment    : ${booking.paymentId ? 'Paid' : 'Pending'}`);
    console.log(`Booked At  : ${booking.bookedAt.toLocaleString()}`);

    if (booking.getStatus() === BookingStatus.CONFIRMED || booking.getStatus() === BookingStatus.RESCHEDULED) {
      console.log(`Refund (if cancelled): ₹${booking.calculateRefund()}`);
    }

    console.log('='.repeat(80) + '\n');
  }

  public displaySeatOptions(flightId: string): void {
    const flight = this.flightRepo.findById(flightId);
    if (!flight) {
      Logger.error('Flight not found.');
      return;
    }

    console.log('\nAvailable Seats:');
    for (const cls of [SeatClass.FIRST, SeatClass.BUSINESS, SeatClass.ECONOMY]) {
      const seats = flight.getAvailableSeats(cls);
      if (seats.length === 0) continue;
      console.log(`\n  ${cls} (₹${flight.getPriceForClass(cls)} each):`);
      seats.slice(0, 10).forEach(fs => {
        console.log(`    - ${fs.seat.seatNumber} (ID: ${fs.seat.id})`);
      });
      if (seats.length > 10) console.log(`    ... and ${seats.length - 10} more`);
    }
  }
}
