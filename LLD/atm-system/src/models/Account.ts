import { IdGenerator } from '../utils/IdGenerator';
import { AccountStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Account {
  public readonly id: string;
  public accountNumber: string;
  public balance: number;
  public status: AccountStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    accountNumber: string,
    initialBalance: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.status = AccountStatus.ACTIVE;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public debit(amount: number): boolean {
    if (
      !ValidationUtil.isValidWithdrawalAmount(amount, this.balance) ||
      this.status !== AccountStatus.ACTIVE
    ) {
      return false;
    }
    this.balance -= amount;
    this.updatedAt = new Date();
    return true;
  }

  public credit(amount: number): void {
    if (!ValidationUtil.isValidAmount(amount)) {
      throw new Error('Invalid deposit amount');
    }
    this.balance += amount;
    this.updatedAt = new Date();
  }

  public getBalance(): number {
    return this.balance;
  }

  public isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  public freeze(): void {
    this.status = AccountStatus.FROZEN;
    this.updatedAt = new Date();
  }

  public unfreeze(): void {
    this.status = AccountStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  public close(): void {
    this.status = AccountStatus.CLOSED;
    this.updatedAt = new Date();
  }

  public isValid(): boolean {
    return (
      ValidationUtil.isValidAccountNumber(this.accountNumber) &&
      ValidationUtil.isValidBalance(this.balance)
    );
  }

  public getDisplayInfo(): string {
    return `Account: ${this.accountNumber} | Balance: ₹${this.balance.toFixed(2)} | Status: ${this.status}`;
  }
}
