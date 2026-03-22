import { Card } from '../models/Card';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { WithdrawalTransaction } from '../models/WithdrawalTransaction';
import { DepositTransaction } from '../models/DepositTransaction';
import { CashDispenser } from '../models/CashDispenser';
import { CardRepository } from '../repositories/CardRepository';
import { AccountRepository } from '../repositories/AccountRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { ValidationUtil } from '../utils/ValidationUtil';
import { TransactionStatus } from '../enums';

export class BankingService {
  private cardRepository: CardRepository;
  private accountRepository: AccountRepository;
  private transactionRepository: TransactionRepository;

  constructor() {
    this.cardRepository = new CardRepository();
    this.accountRepository = new AccountRepository();
    this.transactionRepository = new TransactionRepository();
  }

  public authenticateCard(
    cardNumber: string,
    pin: string,
    atmId: string
  ): Account | null {
    const card = this.cardRepository.findByCardNumber(cardNumber);

    if (!card || !card.isValid()) {
      return null;
    }

    if (!card.validatePin(pin)) {
      this.cardRepository.update(card);
      return null;
    }

    this.cardRepository.update(card);

    const account = this.accountRepository.findById(card.accountId);
    if (!account || !account.isActive()) {
      return null;
    }

    return account;
  }

  public withdrawal(
    card: Card,
    account: Account,
    amount: number,
    cashDispenser: CashDispenser,
    atmId: string
  ): Transaction | null {
    if (!ValidationUtil.isValidAmount(amount)) {
      return null;
    }

    if (!cashDispenser.canDispense(amount)) {
      return null;
    }

    const transaction = new WithdrawalTransaction(
      card.id,
      account.id,
      amount,
      atmId
    );

    if (!transaction.canExecute(account)) {
      transaction.recordFailure();
      this.transactionRepository.save(transaction);
      return null;
    }

    if (!transaction.execute(account)) {
      this.transactionRepository.save(transaction);
      return null;
    }

    if (!cashDispenser.dispenseCash(amount)) {
      transaction.recordFailure();
      this.transactionRepository.save(transaction);
      // Refund the account
      account.credit(amount);
      this.accountRepository.update(account);
      return null;
    }

    this.accountRepository.update(account);
    this.transactionRepository.save(transaction);
    return transaction;
  }

  public deposit(
    card: Card,
    account: Account,
    amount: number,
    cashDispenser: CashDispenser,
    atmId: string
  ): Transaction | null {
    if (!ValidationUtil.isValidAmount(amount)) {
      return null;
    }

    const transaction = new DepositTransaction(
      card.id,
      account.id,
      amount,
      atmId
    );

    if (!transaction.execute(account)) {
      transaction.recordFailure();
      this.transactionRepository.save(transaction);
      return null;
    }

    cashDispenser.depositCash(amount);

    this.accountRepository.update(account);
    this.transactionRepository.save(transaction);
    return transaction;
  }

  public changePin(
    card: Card,
    oldPin: string,
    newPin: string
  ): boolean {
    if (!card.updatePin(oldPin, newPin)) {
      return false;
    }

    this.cardRepository.update(card);
    return true;
  }

  public getBalance(account: Account): number {
    return account.getBalance();
  }

  public getMiniStatement(account: Account, limit: number = 5): Transaction[] {
    return this.transactionRepository.findByAccountId(account.id, limit);
  }

  public validateTransaction(transaction: Transaction): boolean {
    return transaction.status === TransactionStatus.SUCCESS;
  }
}
