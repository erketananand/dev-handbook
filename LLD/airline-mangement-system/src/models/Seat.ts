import { IdGenerator } from '../utils/IdGenerator';
import { SeatClass } from '../enums/SeatClass';

export class Seat {
  public readonly id: string;
  public readonly aircraftId: string;
  public readonly seatNumber: string;
  public readonly seatClass: SeatClass;

  constructor(
    seatNumber: string,
    seatClass: SeatClass,
    aircraftId: string,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.seatNumber = seatNumber;
    this.seatClass = seatClass;
    this.aircraftId = aircraftId;
  }

  public isValid(): boolean {
    return this.seatNumber.trim().length > 0;
  }

  public getDisplayInfo(): string {
    return `${this.seatNumber} (${this.seatClass})`;
  }
}
