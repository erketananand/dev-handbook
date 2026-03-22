import { Transaction } from './Transaction';
import { TransactionType, TransactionStatus } from '../enums';
import { Account } from './Account';
import { ValidationUtil } from '../utils/ValidationUtil';

export class WithdrawalTransaction extends Transaction {
  constructor(
    cardId: string,
    accountId: string,
    amount: number,
    atmId: string,
    id?: string
  ) {
    super(cardId, accountId, amount, TransactionType.WITHDRAWAL, atmId, id);
  }

  public canExecute(account: Account): boolean {
    return (
      account.isActive() &&
      ValidationUtil.isValidAmount(this.amount) &&
      this.amount <= account.getBalance() &&
      this.amount <= ValidationUtil.getMaxWithdrawalPerTransaction()
    );
  }

  public execute(account: Account): boolean {
    if (!this.canExecute(account)) {
      this.recordFailure();
      return false;
    }

    if (!account.debit(this.amount)) {
      this.recordFailure();
      return false;
    }

    this.recordSuccess(account.getBalance());
    return true;
  }

  public getDescription(): string {
    return `Withdrawn ₹${this.amount.toFixed(2)} from ATM ${this.atmId}`;
  }
}
