import { IdGenerator } from '../utils/IdGenerator';
import { SeatStatus } from '../enums';

export class Seat {
  public readonly id: string;
  public screenId: string;
  public seatCategoryId: string;
  public rowLabel: string;
  public seatNumber: number;
  public status: SeatStatus;
  public readonly createdAt: Date;

  constructor(
    screenId: string,
    seatCategoryId: string,
    rowLabel: string,
    seatNumber: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.screenId = screenId;
    this.seatCategoryId = seatCategoryId;
    this.rowLabel = rowLabel;
    this.seatNumber = seatNumber;
    this.status = SeatStatus.AVAILABLE;
    this.createdAt = new Date();
  }

  public markAsBooked(): void {
    this.status = SeatStatus.BOOKED;
  }

  public markAsAvailable(): void {
    this.status = SeatStatus.AVAILABLE;
  }

  public lock(): void {
    this.status = SeatStatus.LOCKED;
  }

  public unlock(): void {
    this.status = SeatStatus.AVAILABLE;
  }

  public getDisplayInfo(): string {
    return `${this.rowLabel}${this.seatNumber} (${this.status})`;
  }
}
