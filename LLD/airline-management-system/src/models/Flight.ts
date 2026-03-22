import { IdGenerator } from '../utils/IdGenerator';
import { Aircraft } from './Aircraft';
import { FlightSeat } from './FlightSeat';
import { SeatClass } from '../enums/SeatClass';
import { FlightStatus } from '../enums/FlightStatus';

export class Flight {
  public readonly id: string;
  public readonly flightNumber: string;
  public aircraft: Aircraft;
  public source: string;
  public destination: string;
  public departureTime: Date;
  public arrivalTime: Date;
  public status: FlightStatus;
  public basePrice: number;
  public seatAvailability: Map<string, FlightSeat>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    flightNumber: string,
    aircraft: Aircraft,
    source: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    basePrice: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.flightNumber = flightNumber;
    this.aircraft = aircraft;
    this.source = source;
    this.destination = destination;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
    this.basePrice = basePrice;
    this.status = FlightStatus.SCHEDULED;
    this.seatAvailability = new Map();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.initializeSeatAvailability();
  }

  public initializeSeatAvailability(): void {
    for (const seat of this.aircraft.getAllSeats()) {
      const price = this.getPriceForClass(seat.seatClass);
      this.seatAvailability.set(seat.id, new FlightSeat(seat, price));
    }
  }

  public getAvailableSeats(seatClass?: SeatClass): FlightSeat[] {
    const all = Array.from(this.seatAvailability.values()).filter(fs => fs.isAvailable);
    if (seatClass) return all.filter(fs => fs.seat.seatClass === seatClass);
    return all;
  }

  public getSeatAvailability(seatId: string): FlightSeat | undefined {
    return this.seatAvailability.get(seatId);
  }

  public lockSeat(seatId: string): boolean {
    const flightSeat = this.seatAvailability.get(seatId);
    if (!flightSeat || !flightSeat.isAvailable) return false;
    flightSeat.lock();
    this.updatedAt = new Date();
    return true;
  }

  public releaseSeat(seatId: string): void {
    const flightSeat = this.seatAvailability.get(seatId);
    if (flightSeat) {
      flightSeat.release();
      this.updatedAt = new Date();
    }
  }

  public updateStatus(status: FlightStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public getDurationMinutes(): number {
    return Math.round(
      (this.arrivalTime.getTime() - this.departureTime.getTime()) / (1000 * 60)
    );
  }

  public getPriceForClass(seatClass: SeatClass): number {
    switch (seatClass) {
      case SeatClass.FIRST:    return this.basePrice * 3;
      case SeatClass.BUSINESS: return this.basePrice * 2;
      case SeatClass.ECONOMY:
      default:                 return this.basePrice;
    }
  }

  public getAvailableCount(seatClass?: SeatClass): number {
    return this.getAvailableSeats(seatClass).length;
  }

  public getDisplayInfo(): string {
    const dept = this.departureTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dur = this.getDurationMinutes();
    const hrs = Math.floor(dur / 60);
    const mins = dur % 60;
    return `${this.flightNumber} | ${this.source} → ${this.destination} | Dep: ${dept} | ${hrs}h ${mins}m | ₹${this.basePrice}`;
  }
}
