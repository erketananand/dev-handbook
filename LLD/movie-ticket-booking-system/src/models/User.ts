import { IdGenerator } from '../utils/IdGenerator';
import { ValidationUtil } from '../utils/ValidationUtil';
import { UserRole } from '../enums';

export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public phone: string;
  public passwordHash: string;
  public address: string;
  public role: UserRole;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    email: string,
    phone: string,
    passwordHash: string,
    address: string,
    role: UserRole = UserRole.USER,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.passwordHash = passwordHash;
    this.address = address;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public isValid(): boolean {
    return (
      ValidationUtil.isValidEmail(this.email) &&
      ValidationUtil.isValidPhone(this.phone) &&
      this.name.trim().length > 0 &&
      this.passwordHash.length > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.name} | ${this.email} | ${this.phone} | ${this.role}`;
  }
}
