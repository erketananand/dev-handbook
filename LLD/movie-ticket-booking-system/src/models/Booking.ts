import { IdGenerator } from '../utils/IdGenerator';
import { BookingStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Booking {
  public readonly id: string;
  public bookingNumber: string;
  public userId: string;
  public showId: string;
  public numTickets: number;
  public totalPrice: number;
  public status: BookingStatus;
  public readonly createdAt: Date;
  public expiresAt: Date;
  public canceledAt: Date | null;
  public updatedAt: Date;

  constructor(
    userId: string,
    showId: string,
    numTickets: number,
    totalPrice: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.bookingNumber = IdGenerator.generateBookingNumber();
    this.userId = userId;
    this.showId = showId;
    this.numTickets = numTickets;
    this.totalPrice = totalPrice;
    this.status = BookingStatus.PENDING;
    this.createdAt = new Date();
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    this.canceledAt = null;
    this.updatedAt = new Date();
  }

  public confirm(): void {
    if (this.status === BookingStatus.PENDING) {
      this.status = BookingStatus.CONFIRMED;
      this.updatedAt = new Date();
    }
  }

  public complete(): void {
    if (this.status === BookingStatus.CONFIRMED) {
      this.status = BookingStatus.COMPLETED;
      this.updatedAt = new Date();
    }
  }

  public cancel(): void {
    if (
      this.status === BookingStatus.PENDING ||
      this.status === BookingStatus.CONFIRMED
    ) {
      this.status = BookingStatus.CANCELLED;
      this.canceledAt = new Date();
      this.updatedAt = new Date();
    }
  }

  public isExpired(): boolean {
    return (
      this.status === BookingStatus.PENDING && new Date() > this.expiresAt
    );
  }

  public isValid(): boolean {
    return (
      this.numTickets > 0 &&
      this.totalPrice > 0 &&
      !this.isExpired()
    );
  }

  public getDisplayInfo(): string {
    return `${this.bookingNumber} | ${this.numTickets} tickets | ₹${this.totalPrice.toFixed(2)} | ${this.status}`;
  }
}
