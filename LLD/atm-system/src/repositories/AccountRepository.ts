import { Account } from '../models/Account';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class AccountRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  public save(account: Account): void {
    this.database.saveAccount(account);
  }

  public findById(id: string): Account | undefined {
    return this.database.findAccountById(id);
  }

  public findByAccountNumber(accountNumber: string): Account | undefined {
    return this.database.findAccountByAccountNumber(accountNumber);
  }

  public update(account: Account): void {
    this.database.updateAccount(account);
  }

  public delete(id: string): void {
    this.database.deleteAccount(id);
  }

  public getAll(): Account[] {
    return this.database.getAllAccounts();
  }
}
