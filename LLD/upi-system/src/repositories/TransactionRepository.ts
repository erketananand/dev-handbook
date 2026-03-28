import { UUID, IRepository } from "../utils";
import { Transaction } from "../models";

export class TransactionRepository implements IRepository<Transaction> {
  private store = new Map<UUID, Transaction>();

  public async save(transaction: Transaction): Promise<Transaction> {
    this.store.set(transaction.transactionId, transaction);
    return transaction;
  }

  public async findById(id: UUID): Promise<Transaction | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.store.get(id);
    if (!transaction) throw new Error("Transaction not found");
    Object.assign(transaction, data);
    return transaction;
  }

  public async findByUserId(userId: UUID): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    for (const tx of this.store.values()) {
      if (tx.fromUserId === userId || tx.toUserId === userId) {
        transactions.push(tx);
      }
    }
    return transactions.sort((a, b) => b.transactionTime.getTime() - a.transactionTime.getTime());
  }

  public async findByStatus(status: string): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    for (const tx of this.store.values()) {
      if (tx.status === status) transactions.push(tx);
    }
    return transactions;
  }

  public async findByReferenceNumber(referenceNumber: string): Promise<Transaction | null> {
    for (const tx of this.store.values()) {
      if (tx.referenceNumber === referenceNumber) return tx;
    }
    return null;
  }
}
