import { IdGenerator } from '../utils/IdGenerator';
import { Seat } from './Seat';
import { SeatClass } from '../enums/SeatClass';

export class Aircraft {
  public readonly id: string;
  public registration: string;
  public model: string;
  public seats: Map<string, Seat>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(registration: string, model: string, id?: string) {
    this.id = id || IdGenerator.generateUUID();
    this.registration = registration;
    this.model = model;
    this.seats = new Map();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public addSeat(seat: Seat): void {
    this.seats.set(seat.id, seat);
    this.updatedAt = new Date();
  }

  public getSeat(seatId: string): Seat | undefined {
    return this.seats.get(seatId);
  }

  public getAllSeats(): Seat[] {
    return Array.from(this.seats.values());
  }

  public getSeatsByClass(seatClass: SeatClass): Seat[] {
    return Array.from(this.seats.values()).filter(s => s.seatClass === seatClass);
  }

  public getTotalSeats(): number {
    return this.seats.size;
  }

  public getDisplayInfo(): string {
    return `${this.registration} | ${this.model} | ${this.getTotalSeats()} seats`;
  }
}
