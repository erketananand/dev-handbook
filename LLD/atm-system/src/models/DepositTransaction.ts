import { Transaction } from './Transaction';
import { TransactionType } from '../enums';
import { Account } from './Account';
import { ValidationUtil } from '../utils/ValidationUtil';

export class DepositTransaction extends Transaction {
  constructor(
    cardId: string,
    accountId: string,
    amount: number,
    atmId: string,
    id?: string
  ) {
    super(cardId, accountId, amount, TransactionType.DEPOSIT, atmId, id);
  }

  public canExecute(account: Account): boolean {
    return (
      account.isActive() &&
      ValidationUtil.isValidAmount(this.amount) &&
      this.amount <= ValidationUtil.getMaxDepositPerTransaction()
    );
  }

  public execute(account: Account): boolean {
    if (!this.canExecute(account)) {
      this.recordFailure();
      return false;
    }

    try {
      account.credit(this.amount);
      this.recordSuccess(account.getBalance());
      return true;
    } catch (error) {
      this.recordFailure();
      return false;
    }
  }

  public getDescription(): string {
    return `Deposited ₹${this.amount.toFixed(2)} at ATM ${this.atmId}`;
  }
}
