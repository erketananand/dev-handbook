import { Seat } from '../models/Seat';
import { SeatStatus } from '../enums';

export class SeatRepository {
  private seats: Map<string, Seat> = new Map();

  public save(seat: Seat): void {
    this.seats.set(seat.id, seat);
  }

  public findById(id: string): Seat | null {
    return this.seats.get(id) || null;
  }

  public findByScreen(screenId: string): Seat[] {
    return Array.from(this.seats.values()).filter(s => s.screenId === screenId);
  }

  public getAvailableSeats(screenId: string): Seat[] {
    return Array.from(this.seats.values()).filter(
      s => s.screenId === screenId && s.status === SeatStatus.AVAILABLE
    );
  }

  public getBookedSeats(screenId: string): Seat[] {
    return Array.from(this.seats.values()).filter(
      s => s.screenId === screenId && s.status === SeatStatus.BOOKED
    );
  }

  public getSeatsByCategory(screenId: string, categoryId: string): Seat[] {
    return Array.from(this.seats.values()).filter(
      s => s.screenId === screenId && s.seatCategoryId === categoryId
    );
  }

  public getAllSeats(): Seat[] {
    return Array.from(this.seats.values());
  }

  public update(seat: Seat): void {
    if (this.seats.has(seat.id)) {
      this.seats.set(seat.id, seat);
    }
  }

  public delete(seatId: string): boolean {
    return this.seats.delete(seatId);
  }

  public clear(): void {
    this.seats.clear();
  }

  public getCount(): number {
    return this.seats.size;
  }
}
