import { IdGenerator } from '../utils/IdGenerator';

export class RentalLocation {
  public readonly id: string;
  public name: string;
  public address: string;
  public city: string;
  public phone: string;
  public operatingHours: string;
  public readonly createdAt: Date;

  constructor(
    name: string,
    address: string,
    city: string,
    phone: string,
    operatingHours: string,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.name = name;
    this.address = address;
    this.city = city;
    this.phone = phone;
    this.operatingHours = operatingHours;
    this.createdAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.name.length > 0 &&
      this.address.length > 0 &&
      this.city.length > 0 &&
      this.phone.length > 0 &&
      this.operatingHours.length > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.name} | ${this.address}, ${this.city} | ${this.operatingHours}`;
  }
}
