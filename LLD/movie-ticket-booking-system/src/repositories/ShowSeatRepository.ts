import { ShowSeat } from '../models/ShowSeat';
import { SeatStatus } from '../enums';

export class ShowSeatRepository {
  private showSeats: Map<string, ShowSeat> = new Map();

  public save(showSeat: ShowSeat): void {
    this.showSeats.set(showSeat.id, showSeat);
  }

  public findById(id: string): ShowSeat | null {
    return this.showSeats.get(id) || null;
  }

  public findByShow(showId: string): ShowSeat[] {
    return Array.from(this.showSeats.values()).filter(ss => ss.showId === showId);
  }

  public findBySeat(seatId: string): ShowSeat[] {
    return Array.from(this.showSeats.values()).filter(ss => ss.seatId === seatId);
  }

  public findByShowAndSeat(showId: string, seatId: string): ShowSeat | null {
    for (const showSeat of this.showSeats.values()) {
      if (showSeat.showId === showId && showSeat.seatId === seatId) {
        return showSeat;
      }
    }
    return null;
  }

  public getAvailableSeats(showId: string): ShowSeat[] {
    return Array.from(this.showSeats.values()).filter(
      ss => ss.showId === showId && ss.status === SeatStatus.AVAILABLE
    );
  }

  public getBookedSeats(showId: string): ShowSeat[] {
    return Array.from(this.showSeats.values()).filter(
      ss => ss.showId === showId && ss.status === SeatStatus.BOOKED
    );
  }

  public getLockedSeats(showId: string): ShowSeat[] {
    return Array.from(this.showSeats.values()).filter(
      ss => ss.showId === showId && ss.status === SeatStatus.LOCKED
    );
  }

  public getAllShowSeats(): ShowSeat[] {
    return Array.from(this.showSeats.values());
  }

  public releaseExpiredLocks(): void {
    for (const showSeat of this.showSeats.values()) {
      if (showSeat.isLockExpired()) {
        showSeat.release();
      }
    }
  }

  public update(showSeat: ShowSeat): void {
    if (this.showSeats.has(showSeat.id)) {
      this.showSeats.set(showSeat.id, showSeat);
    }
  }

  public delete(showSeatId: string): boolean {
    return this.showSeats.delete(showSeatId);
  }

  public clear(): void {
    this.showSeats.clear();
  }

  public getCount(): number {
    return this.showSeats.size;
  }
}
