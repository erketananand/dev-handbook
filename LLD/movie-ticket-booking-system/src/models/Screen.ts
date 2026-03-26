import { IdGenerator } from '../utils/IdGenerator';

export class Screen {
  public readonly id: string;
  public theaterId: string;
  public screenNumber: number;
  public totalSeats: number;
  public layoutType: string;
  public readonly createdAt: Date;

  constructor(
    theaterId: string,
    screenNumber: number,
    totalSeats: number,
    layoutType: string = 'STANDARD',
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.theaterId = theaterId;
    this.screenNumber = screenNumber;
    this.totalSeats = totalSeats;
    this.layoutType = layoutType;
    this.createdAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.screenNumber > 0 &&
      this.totalSeats > 0 &&
      this.layoutType.length > 0
    );
  }

  public getDisplayInfo(): string {
    return `Screen ${this.screenNumber} | ${this.totalSeats} seats | ${this.layoutType}`;
  }
}
