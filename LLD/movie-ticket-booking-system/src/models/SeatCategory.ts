import { IdGenerator } from '../utils/IdGenerator';
import { ValidationUtil } from '../utils/ValidationUtil';

export class SeatCategory {
  public readonly id: string;
  public screenId: string;
  public categoryName: string;
  public price: number;
  public totalSeats: number;
  public readonly createdAt: Date;

  constructor(
    screenId: string,
    categoryName: string,
    price: number,
    totalSeats: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.screenId = screenId;
    this.categoryName = categoryName;
    this.price = price;
    this.totalSeats = totalSeats;
    this.createdAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.categoryName.length > 0 &&
      ValidationUtil.isValidPrice(this.price) &&
      this.totalSeats > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.categoryName} | ₹${this.price.toFixed(2)} | ${this.totalSeats} seats`;
  }
}
