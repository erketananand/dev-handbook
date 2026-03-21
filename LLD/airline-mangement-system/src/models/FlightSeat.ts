import { Seat } from './Seat';

/**
 * FlightSeat is a value object scoped to a specific flight instance.
 * The same physical Seat can appear in many FlightSeat records (one per flight).
 * It tracks per-flight availability and pricing.
 */
export class FlightSeat {
  public readonly seat: Seat;
  public isAvailable: boolean;
  public price: number;

  constructor(seat: Seat, price: number) {
    this.seat = seat;
    this.isAvailable = true;
    this.price = price;
  }

  public lock(): void {
    this.isAvailable = false;
  }

  public release(): void {
    this.isAvailable = true;
  }
}
