import { Transaction } from '../models/Transaction';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class TransactionRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  public save(transaction: Transaction): void {
    this.database.saveTransaction(transaction);
  }

  public findById(id: string): Transaction | undefined {
    return this.database.findTransactionById(id);
  }

  public findByAccountId(accountId: string, limit: number = 10): Transaction[] {
    return this.database.findTransactionsByAccountId(accountId, limit);
  }

  public getAll(): Transaction[] {
    return this.database.getAllTransactions();
  }
}
