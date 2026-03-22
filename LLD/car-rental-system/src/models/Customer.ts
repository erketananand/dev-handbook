import { IdGenerator } from '../utils/IdGenerator';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Customer {
  public readonly id: string;
  public name: string;
  public email: string;
  public phone: string;
  public driverLicense: string;
  public licenseExpiry: Date;
  public address: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    email: string,
    phone: string,
    driverLicense: string,
    licenseExpiry: Date,
    address: string,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.driverLicense = driverLicense;
    this.licenseExpiry = licenseExpiry;
    this.address = address;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public isLicenseValid(): boolean {
    return !ValidationUtil.isLicenseExpired(this.licenseExpiry);
  }

  public isValid(): boolean {
    return (
      ValidationUtil.isValidEmail(this.email) &&
      ValidationUtil.isValidPhone(this.phone) &&
      ValidationUtil.isValidDriverLicense(this.driverLicense) &&
      this.isLicenseValid() &&
      this.name.trim().length > 0 &&
      this.address.trim().length > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.name} | ${this.email} | License: ${this.driverLicense}`;
  }
}
