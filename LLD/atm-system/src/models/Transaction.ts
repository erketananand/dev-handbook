import { IdGenerator } from '../utils/IdGenerator';
import { TransactionStatus, TransactionType } from '../enums';
import { Account } from './Account';

export abstract class Transaction {
  public readonly id: string;
  public cardId: string;
  public accountId: string;
  public amount: number;
  public balanceAfter: number;
  public status: TransactionStatus;
  public transactionType: TransactionType;
  public atmId: string;
  public readonly createdAt: Date;

  constructor(
    cardId: string,
    accountId: string,
    amount: number,
    transactionType: TransactionType,
    atmId: string,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.cardId = cardId;
    this.accountId = accountId;
    this.amount = amount;
    this.balanceAfter = 0;
    this.status = TransactionStatus.FAILED;
    this.transactionType = transactionType;
    this.atmId = atmId;
    this.createdAt = new Date();
  }

  public abstract execute(account: Account): boolean;
  public abstract canExecute(account: Account): boolean;
  public abstract getDescription(): string;

  public recordSuccess(balanceAfter: number): void {
    this.status = TransactionStatus.SUCCESS;
    this.balanceAfter = balanceAfter;
  }

  public recordFailure(): void {
    this.status = TransactionStatus.FAILED;
  }

  public getDisplayInfo(): string {
    return `${this.transactionType} | Amount: ₹${this.amount.toFixed(2)} | Status: ${
      this.status
    } | Time: ${this.createdAt.toLocaleString()}`;
  }
}
