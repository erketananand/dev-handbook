import { IdGenerator } from '../utils/IdGenerator';
import { ShowStatus } from '../enums';

export class Show {
  public readonly id: string;
  public movieId: string;
  public screenId: string;
  public showDate: Date;
  public showTime: string;
  public availableSeats: number;
  public totalSeats: number;
  public status: ShowStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    movieId: string,
    screenId: string,
    showDate: Date,
    showTime: string,
    totalSeats: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.movieId = movieId;
    this.screenId = screenId;
    this.showDate = showDate;
    this.showTime = showTime;
    this.totalSeats = totalSeats;
    this.availableSeats = totalSeats;
    this.status = ShowStatus.AVAILABLE;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getAvailableSeats(): number {
    return this.availableSeats;
  }

  public updateAvailableSeats(count: number): void {
    this.availableSeats = count;
    if (this.availableSeats === 0) {
      this.status = ShowStatus.HOUSEFUL;
    } else if (this.availableSeats > 0 && this.availableSeats < this.totalSeats) {
      this.status = ShowStatus.AVAILABLE;
    }
    this.updatedAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.showDate >= new Date() &&
      this.showTime.length > 0 &&
      this.totalSeats > 0 &&
      this.availableSeats >= 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.showDate.toLocaleDateString()} ${this.showTime} | ${this.availableSeats}/${this.totalSeats} seats | ${this.status}`;
  }
}
