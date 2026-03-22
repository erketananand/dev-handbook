import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Reservation } from '../models/Reservation';
import { ReservationStatus, PaymentMethod, CarStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';
import { Payment } from '../models/Payment';
import { Insurance } from '../models/Insurance';
import { InsuranceType } from '../enums';

export class RentalService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public createReservation(
    customerId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    pickupLocation: string,
    dropoffLocation: string,
    basePrice: number
  ): Reservation | null {
    // Validate customer
    const customer = this.db.customerRepository.findById(customerId);
    if (!customer || !customer.isValid() || !customer.isLicenseValid()) {
      throw new Error('Invalid customer or license expired');
    }

    // Validate car
    const car = this.db.carRepository.findById(carId);
    if (!car || !car.isAvailable()) {
      throw new Error('Car not available');
    }

    // Validate date range
    if (!ValidationUtil.isValidDateRange(startDate, endDate)) {
      throw new Error('Invalid date range');
    }

    // Check for conflicts
    const conflicts = this.db.reservationRepository.getConflictingReservations(
      carId,
      startDate,
      endDate
    );
    if (conflicts.length > 0) {
      throw new Error('Car is already booked for this period');
    }

    // Calculate total price
    const numDays = ValidationUtil.calculateRentalDays(startDate, endDate);
    const totalPrice = basePrice * numDays;

    const reservation = new Reservation(
      customerId,
      carId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      totalPrice
    );

    if (!reservation.isValid()) {
      throw new Error('Reservation validation failed');
    }

    this.db.reservationRepository.save(reservation);
    return reservation;
  }

  public confirmReservation(reservationId: string): Reservation | null {
    const reservation = this.db.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    reservation.confirm();
    this.db.reservationRepository.update(reservation);

    // Mark car as booked
    const car = this.db.carRepository.findById(reservation.carId);
    if (car) {
      car.markAsBooked();
      this.db.carRepository.update(car);
    }

    return reservation;
  }

  public activateReservation(reservationId: string): Reservation | null {
    const reservation = this.db.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    reservation.activate();
    this.db.reservationRepository.update(reservation);
    return reservation;
  }

  public completeReservation(reservationId: string, distanceTraveled: number): Reservation | null {
    const reservation = this.db.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    reservation.complete();
    this.db.reservationRepository.update(reservation);

    // Mark car as available
    const car = this.db.carRepository.findById(reservation.carId);
    if (car) {
      car.updateMileage(distanceTraveled);
      car.markAsAvailable();
      this.db.carRepository.update(car);
    }

    return reservation;
  }

  public cancelReservation(reservationId: string): Reservation | null {
    const reservation = this.db.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (!this.canCancelReservation(reservation)) {
      throw new Error('Cannot cancel this reservation');
    }

    reservation.cancel();
    this.db.reservationRepository.update(reservation);

    // Mark car as available
    const car = this.db.carRepository.findById(reservation.carId);
    if (car && car.status !== CarStatus.MAINTENANCE) {
      car.markAsAvailable();
      this.db.carRepository.update(car);
    }

    return reservation;
  }

  public getReservationById(reservationId: string): Reservation | null {
    return this.db.reservationRepository.findById(reservationId);
  }

  public getReservationByNumber(reservationNumber: string): Reservation | null {
    return this.db.reservationRepository.findByReservationNumber(reservationNumber);
  }

  public getCustomerReservations(customerId: string): Reservation[] {
    return this.db.reservationRepository.getReservationsByCustomer(customerId);
  }

  public getActiveReservations(): Reservation[] {
    return this.db.reservationRepository.getActiveReservations();
  }

  public getReschedulePrice(
    reservationId: string,
    newStartDate: Date,
    newEndDate: Date,
    basePrice: number
  ): number {
    const numDays = ValidationUtil.calculateRentalDays(newStartDate, newEndDate);
    return basePrice * numDays;
  }

  private canCancelReservation(reservation: Reservation): boolean {
    return (
      reservation.status === ReservationStatus.PENDING ||
      reservation.status === ReservationStatus.CONFIRMED
    );
  }

  public canRefund(reservation: Reservation): boolean {
    if (reservation.status !== ReservationStatus.CANCELLED) {
      return false;
    }
    return true;
  }

  public getRefundAmount(reservation: Reservation, paymentAmount: number): number {
    const hoursSinceCreation = (Date.now() - reservation.createdAt.getTime()) / (1000 * 60 * 60);
    const refundPercentage = ValidationUtil.getMaxRefundPercentage(hoursSinceCreation);
    return (paymentAmount * refundPercentage) / 100;
  }
}
