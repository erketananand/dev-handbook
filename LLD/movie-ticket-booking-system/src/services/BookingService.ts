import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Booking } from '../models/Booking';
import { BookingStatus, SeatStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class BookingService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public createBooking(
    userId: string,
    showId: string,
    seatIds: string[],
    totalPrice: number
  ): Booking {
    const user = this.db.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const show = this.db.showRepository.findById(showId);
    if (!show) {
      throw new Error('Show not found');
    }

    if (seatIds.length === 0) {
      throw new Error('At least one seat must be selected');
    }

    if (seatIds.length > show.availableSeats) {
      throw new Error('Not enough seats available');
    }

    // Verify all seats are available
    for (const seatId of seatIds) {
      const showSeat = this.db.showSeatRepository.findByShowAndSeat(showId, seatId);
      if (!showSeat || showSeat.status !== SeatStatus.LOCKED) {
        throw new Error('Invalid seat selection');
      }
    }

    const booking = new Booking(userId, showId, seatIds.length, totalPrice);

    if (!booking.isValid()) {
      throw new Error('Booking validation failed');
    }

    this.db.bookingRepository.save(booking);
    return booking;
  }

  public confirmBooking(bookingId: string): Booking | null {
    const booking = this.db.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error(`Cannot confirm booking in ${booking.status} status`);
    }

    booking.confirm();
    this.db.bookingRepository.update(booking);

    return booking;
  }

  public completeBooking(bookingId: string): Booking | null {
    const booking = this.db.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.complete();
    this.db.bookingRepository.update(booking);

    return booking;
  }

  public cancelBooking(bookingId: string): Booking | null {
    const booking = this.db.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!this.canCancelBooking(booking)) {
      throw new Error('Booking cannot be cancelled in current status');
    }

    booking.cancel();
    this.db.bookingRepository.update(booking);

    return booking;
  }

  public getBookingById(bookingId: string): Booking | null {
    return this.db.bookingRepository.findById(bookingId);
  }

  public getBookingByNumber(bookingNumber: string): Booking | null {
    return this.db.bookingRepository.findByNumber(bookingNumber);
  }

  public getUserBookings(userId: string): Booking[] {
    return this.db.bookingRepository.findByUser(userId);
  }

  public getShowBookings(showId: string): Booking[] {
    return this.db.bookingRepository.findByShow(showId);
  }

  public getPendingBookings(): Booking[] {
    return this.db.bookingRepository.getPendingBookings();
  }

  public getExpiredPendingBookings(): Booking[] {
    return this.db.bookingRepository.getExpiredPendingBookings();
  }

  public cleanupExpiredBookings(): void {
    const expiredBookings = this.getExpiredPendingBookings();
    for (const booking of expiredBookings) {
      booking.cancel();
      this.db.bookingRepository.update(booking);
    }
  }

  public getRefundAmount(bookingId: string): number {
    const booking = this.db.bookingRepository.findById(bookingId);
    if (!booking) return 0;

    const show = this.db.showRepository.findById(booking.showId);
    if (!show) return 0;

    // Create show time date for calculation
    const [hours, minutes] = show.showTime.split(':').map(Number);
    const showDateTime = new Date(show.showDate);
    showDateTime.setHours(hours, minutes, 0);

    const refundPercentage = ValidationUtil.calculateRefundPercentage(booking.createdAt, showDateTime);
    return ValidationUtil.calculateRefundAmount(booking.totalPrice, refundPercentage);
  }

  private canCancelBooking(booking: Booking): boolean {
    return (
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED
    );
  }

  public getAllBookings(): Booking[] {
    return this.db.bookingRepository.getAllBookings();
  }
}
