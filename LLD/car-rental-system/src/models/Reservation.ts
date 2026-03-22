import { IdGenerator } from '../utils/IdGenerator';
import { ReservationStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Reservation {
  public readonly id: string;
  public reservationNumber: string;
  public customerId: string;
  public carId: string;
  public startDate: Date;
  public endDate: Date;
  public pickupLocation: string;
  public dropoffLocation: string;
  public status: ReservationStatus;
  public totalPrice: number;
  public numDays: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    customerId: string,
    carId: string,
    startDate: Date,
    endDate: Date,
    pickupLocation: string,
    dropoffLocation: string,
    totalPrice: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.reservationNumber = IdGenerator.generateReservationNumber();
    this.customerId = customerId;
    this.carId = carId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.pickupLocation = pickupLocation;
    this.dropoffLocation = dropoffLocation;
    this.status = ReservationStatus.PENDING;
    this.totalPrice = totalPrice;
    this.numDays = this.calculateNumDays();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public calculateNumDays(): number {
    return ValidationUtil.calculateRentalDays(this.startDate, this.endDate);
  }

  public confirm(): void {
    if (this.status === ReservationStatus.PENDING) {
      this.status = ReservationStatus.CONFIRMED;
      this.updatedAt = new Date();
    }
  }

  public activate(): void {
    if (this.status === ReservationStatus.CONFIRMED) {
      this.status = ReservationStatus.ACTIVE;
      this.updatedAt = new Date();
    }
  }

  public complete(): void {
    if (this.status === ReservationStatus.ACTIVE) {
      this.status = ReservationStatus.COMPLETED;
      this.updatedAt = new Date();
    }
  }

  public cancel(): void {
    if (
      this.status === ReservationStatus.PENDING ||
      this.status === ReservationStatus.CONFIRMED
    ) {
      this.status = ReservationStatus.CANCELLED;
      this.updatedAt = new Date();
    }
  }

  public isValid(): boolean {
    return (
      ValidationUtil.isValidDateRange(this.startDate, this.endDate) &&
      this.pickupLocation.length > 0 &&
      this.dropoffLocation.length > 0 &&
      this.totalPrice > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.reservationNumber} | ${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()} | ₹${this.totalPrice.toFixed(2)} | ${this.status}`;
  }
}
