import { IdGenerator } from '../utils/IdGenerator';
import { CardStatus } from '../enums';
import { EncryptionUtil } from '../utils/EncryptionUtil';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Card {
  public readonly id: string;
  public cardNumber: string;
  public accountId: string;
  public pinHash: string;
  public status: CardStatus;
  public expiryDate: Date;
  public failedAttempts: number;
  public blockedUntil: Date | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    cardNumber: string,
    accountId: string,
    pin: string,
    expiryDate: Date,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.cardNumber = cardNumber;
    this.accountId = accountId;
    this.pinHash = EncryptionUtil.hashPin(pin);
    this.status = CardStatus.ACTIVE;
    this.expiryDate = expiryDate;
    this.failedAttempts = 0;
    this.blockedUntil = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public validatePin(inputPin: string): boolean {
    if (this.status === CardStatus.BLOCKED) {
      if (this.blockedUntil && new Date() < this.blockedUntil) {
        return false;
      }
      this.unblock();
    }

    if (!EncryptionUtil.verifyPin(inputPin, this.pinHash)) {
      this.failedAttempts++;
      if (this.failedAttempts >= 3) {
        this.block();
      }
      return false;
    }

    this.resetFailedAttempts();
    return true;
  }

  public updatePin(oldPin: string, newPin: string): boolean {
    if (!ValidationUtil.isValidPin(newPin)) {
      throw new Error('Invalid PIN format');
    }

    if (!this.validatePin(oldPin)) {
      return false;
    }

    this.pinHash = EncryptionUtil.hashPin(newPin);
    this.updatedAt = new Date();
    return true;
  }

  public block(): void {
    this.status = CardStatus.BLOCKED;
    this.blockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Block for 24 hours
    this.updatedAt = new Date();
  }

  public unblock(): void {
    this.status = CardStatus.ACTIVE;
    this.blockedUntil = null;
    this.failedAttempts = 0;
    this.updatedAt = new Date();
  }

  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }

  public isValid(): boolean {
    return (
      ValidationUtil.isValidCardNumber(this.cardNumber) &&
      this.status !== CardStatus.BLOCKED &&
      !this.isExpired()
    );
  }

  public isExpired(): boolean {
    return new Date() > this.expiryDate;
  }

  public isActive(): boolean {
    return this.status === CardStatus.ACTIVE && !this.isExpired();
  }

  public getDisplayInfo(): string {
    const maskedCardNumber = EncryptionUtil.maskCardNumber(this.cardNumber);
    return `Card: ${this.cardNumber} | Status: ${this.status} | Expiry: ${this.expiryDate.toLocaleDateString()}`;
  }
}
