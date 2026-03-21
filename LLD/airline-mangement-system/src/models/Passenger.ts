import { IdGenerator } from '../utils/IdGenerator';

export class Passenger {
  public readonly id: string;
  public name: string;
  public email: string;
  public phone: string;
  public passportNumber: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    email: string,
    phone: string,
    passportNumber: string | null = null,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.passportNumber = passportNumber;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public isValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.email.includes('@') &&
      this.phone.trim().length > 0
    );
  }

  public update(name: string, email: string, phone: string): void {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.updatedAt = new Date();
  }

  public getDisplayInfo(): string {
    return `${this.name} | ${this.email} | ${this.phone}`;
  }
}
