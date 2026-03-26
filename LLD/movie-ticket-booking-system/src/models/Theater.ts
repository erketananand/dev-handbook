import { IdGenerator } from '../utils/IdGenerator';

export class Theater {
  public readonly id: string;
  public name: string;
  public city: string;
  public address: string;
  public phone: string;
  public totalScreens: number;
  public readonly createdAt: Date;

  constructor(
    name: string,
    city: string,
    address: string,
    phone: string,
    totalScreens: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.name = name;
    this.city = city;
    this.address = address;
    this.phone = phone;
    this.totalScreens = totalScreens;
    this.createdAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.name.length > 0 &&
      this.city.length > 0 &&
      this.address.length > 0 &&
      this.phone.length > 0 &&
      this.totalScreens > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.name} | ${this.city} | ${this.address} | Screens: ${this.totalScreens}`;
  }
}
