import { IdGenerator } from '../utils/IdGenerator';
import { SeatStatus } from '../enums';

export class ShowSeat {
  public readonly id: string;
  public showId: string;
  public seatId: string;
  public status: SeatStatus;
  public bookedAt: Date | null;
  public releasedAt: Date | null;
  public lockExpiresAt: Date | null;
  public readonly createdAt: Date;

  constructor(showId: string, seatId: string, id?: string) {
    this.id = id || IdGenerator.generateUUID();
    this.showId = showId;
    this.seatId = seatId;
    this.status = SeatStatus.AVAILABLE;
    this.bookedAt = null;
    this.releasedAt = null;
    this.lockExpiresAt = null;
    this.createdAt = new Date();
  }

  public lock(timeoutMinutes: number = 15): void {
    this.status = SeatStatus.LOCKED;
    this.lockExpiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);
  }

  public book(): void {
    this.status = SeatStatus.BOOKED;
    this.bookedAt = new Date();
    this.lockExpiresAt = null;
  }

  public release(): void {
    this.status = SeatStatus.AVAILABLE;
    this.releasedAt = new Date();
    this.lockExpiresAt = null;
  }

  public isLockExpired(): boolean {
    if (!this.lockExpiresAt) return false;
    return new Date() > this.lockExpiresAt;
  }

  public getDisplayInfo(): string {
    return `ShowSeat: ${this.status} | Locked until: ${this.lockExpiresAt?.toLocaleTimeString() || 'N/A'}`;
  }
}
