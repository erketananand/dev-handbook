import { IdGenerator } from '../utils/IdGenerator';
import { IBookingState } from '../states/IBookingState';
import { PendingState } from '../states/PendingState';
import { BookingStatus } from '../enums/BookingStatus';

export class Booking {
  public readonly id: string;
  public readonly bookingRef: string;
  public readonly passengerId: string;
  public flightId: string;
  public seatId: string | null;
  public bookingState: IBookingState;
  public totalAmount: number;
  public paymentId: string | null;
  public readonly bookedAt: Date;
  public updatedAt: Date;

  constructor(
    passengerId: string,
    flightId: string,
    totalAmount: number,
    seatId: string | null = null,
    id?: string,
    bookingRef?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.bookingRef = bookingRef || IdGenerator.generateBookingRef();
    this.passengerId = passengerId;
    this.flightId = flightId;
    this.seatId = seatId;
    this.totalAmount = totalAmount;
    this.paymentId = null;
    this.bookedAt = new Date();
    this.updatedAt = new Date();
    this.bookingState = new PendingState();
  }

  public setState(state: IBookingState): void {
    this.bookingState = state;
    this.update();
  }

  public confirm(): void {
    this.bookingState.confirm(this);
  }

  public cancel(): void {
    this.bookingState.cancel(this);
  }

  public reschedule(newFlightId: string): void {
    this.bookingState.reschedule(this, newFlightId);
  }

  public getStatus(): BookingStatus {
    return this.bookingState.getStatus();
  }

  public assignPayment(paymentId: string): void {
    this.paymentId = paymentId;
    this.update();
  }

  public calculateRefund(): number {
    if (!this.paymentId) return 0;
    return Math.round(this.totalAmount * 0.8); // 80% refund
  }

  public update(): void {
    this.updatedAt = new Date();
  }

  public getDisplayInfo(): string {
    return `Ref: ${this.bookingRef} | Status: ${this.getStatus()} | Amount: ₹${this.totalAmount}`;
  }
}
