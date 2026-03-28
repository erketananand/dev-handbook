import { UUID, generateUUID } from "../utils";

/**
 * BankAccount - Represents linked bank account
 */
export class BankAccount {
  readonly accountId: UUID;
  readonly userId: UUID;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolder: string;
  isActive: boolean;
  createdAt: Date;

  constructor(
    userId: UUID,
    accountNumber: string,
    ifscCode: string,
    bankName: string,
    accountHolder: string
  ) {
    this.accountId = generateUUID();
    this.userId = userId;
    this.accountNumber = accountNumber;
    this.ifscCode = ifscCode;
    this.bankName = bankName;
    this.accountHolder = accountHolder;
    this.isActive = true;
    this.createdAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public getMaskedAccountNumber(): string {
    return this.accountNumber.slice(-4).padStart(this.accountNumber.length, "*");
  }
}
