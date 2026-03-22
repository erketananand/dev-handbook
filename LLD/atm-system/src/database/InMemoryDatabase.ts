import { Card } from '../models/Card';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { ATM } from '../models/ATM';

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;

  // Primary data stores
  private cards: Map<string, Card>;
  private cardsByCardNumber: Map<string, Card>;
  private accountsByCardId: Map<string, Card[]>;

  private accounts: Map<string, Account>;
  private accountsByAccountNumber: Map<string, Account>;

  private transactions: Map<string, Transaction>;
  private transactionsByAccountId: Map<string, Transaction[]>;

  private atms: Map<string, ATM>;
  private atmsByAtmId: Map<string, ATM>;

  private constructor() {
    this.cards = new Map();
    this.cardsByCardNumber = new Map();
    this.accountsByCardId = new Map();

    this.accounts = new Map();
    this.accountsByAccountNumber = new Map();

    this.transactions = new Map();
    this.transactionsByAccountId = new Map();

    this.atms = new Map();
    this.atmsByAtmId = new Map();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  // Card operations
  public saveCard(card: Card): void {
    this.cards.set(card.id, card);
    this.cardsByCardNumber.set(card.cardNumber, card);

    const cardsForAccount = this.accountsByCardId.get(card.accountId) || [];
    if (!cardsForAccount.includes(card)) {
      cardsForAccount.push(card);
      this.accountsByCardId.set(card.accountId, cardsForAccount);
    }
  }

  public findCardById(id: string): Card | undefined {
    return this.cards.get(id);
  }

  public findCardByCardNumber(cardNumber: string): Card | undefined {
    return this.cardsByCardNumber.get(cardNumber);
  }

  public findCardsByAccountId(accountId: string): Card[] {
    return this.accountsByCardId.get(accountId) || [];
  }

  public updateCard(card: Card): void {
    this.cards.set(card.id, card);
    this.cardsByCardNumber.set(card.cardNumber, card);
  }

  public deleteCard(id: string): void {
    const card = this.cards.get(id);
    if (card) {
      this.cards.delete(id);
      this.cardsByCardNumber.delete(card.cardNumber);
    }
  }

  // Account operations
  public saveAccount(account: Account): void {
    this.accounts.set(account.id, account);
    this.accountsByAccountNumber.set(account.accountNumber, account);
  }

  public findAccountById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  public findAccountByAccountNumber(accountNumber: string): Account | undefined {
    return this.accountsByAccountNumber.get(accountNumber);
  }

  public updateAccount(account: Account): void {
    this.accounts.set(account.id, account);
    this.accountsByAccountNumber.set(account.accountNumber, account);
  }

  public deleteAccount(id: string): void {
    const account = this.accounts.get(id);
    if (account) {
      this.accounts.delete(id);
      this.accountsByAccountNumber.delete(account.accountNumber);
    }
  }

  // Transaction operations
  public saveTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);

    const txnsForAccount = this.transactionsByAccountId.get(transaction.accountId) || [];
    txnsForAccount.push(transaction);
    this.transactionsByAccountId.set(transaction.accountId, txnsForAccount);
  }

  public findTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  public findTransactionsByAccountId(accountId: string, limit: number = 10): Transaction[] {
    const transactions = this.transactionsByAccountId.get(accountId) || [];
    return transactions.slice(-limit).reverse();
  }

  // ATM operations
  public saveATM(atm: ATM): void {
    this.atms.set(atm.id, atm);
    this.atmsByAtmId.set(atm.atmId, atm);
  }

  public findATMById(id: string): ATM | undefined {
    return this.atms.get(id);
  }

  public findATMByAtmId(atmId: string): ATM | undefined {
    return this.atmsByAtmId.get(atmId);
  }

  public updateATM(atm: ATM): void {
    this.atms.set(atm.id, atm);
    this.atmsByAtmId.set(atm.atmId, atm);
  }

  public deleteATM(id: string): void {
    const atm = this.atms.get(id);
    if (atm) {
      this.atms.delete(id);
      this.atmsByAtmId.delete(atm.atmId);
    }
  }

  // Utility methods
  public getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  public getAllAccounts(): Account[] {
    return Array.from(this.accounts.values());
  }

  public getAllATMs(): ATM[] {
    return Array.from(this.atms.values());
  }

  public getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values());
  }

  public reset(): void {
    this.cards.clear();
    this.cardsByCardNumber.clear();
    this.accountsByCardId.clear();

    this.accounts.clear();
    this.accountsByAccountNumber.clear();

    this.transactions.clear();
    this.transactionsByAccountId.clear();

    this.atms.clear();
    this.atmsByAtmId.clear();
  }
}
