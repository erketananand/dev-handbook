import { UUID, generateUUID } from "../utils";

/**
 * User - Core entity representing UPI account holder
 */
export class User {
  readonly userId: UUID;
  name: string;
  email: string;
  phone: string;
  upiId: string;
  isVerified: boolean;
  createdAt: Date;

  constructor(name: string, email: string, phone: string, upiId: string) {
    this.userId = generateUUID();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.upiId = upiId;
    this.isVerified = false;
    this.createdAt = new Date();
  }

  public updateProfile(name: string, email: string): void {
    this.name = name;
    this.email = email;
  }

  public verifyKYC(): void {
    this.isVerified = true;
  }

  public canPerformTransaction(): boolean {
    return this.isVerified;
  }
}
