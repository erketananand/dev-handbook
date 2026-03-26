import { TransactionHistory } from "../models/TransactionHistory";

export class TransactionHistoryRepository {
  private transactions: Map<string, TransactionHistory> = new Map();

  save(transaction: TransactionHistory): TransactionHistory {
    this.transactions.set(transaction.transactionId, transaction);
    return transaction;
  }

  findById(transactionId: string): TransactionHistory | null {
    return this.transactions.get(transactionId) || null;
  }

  getUserTransactions(userId: string): TransactionHistory[] {
    return Array.from(this.transactions.values())
      .filter(
        (transaction) =>
          transaction.fromUserId === userId || transaction.toUserId === userId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getGroupTransactions(groupId: string): TransactionHistory[] {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.expenseId !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  update(transaction: TransactionHistory): TransactionHistory {
    this.transactions.set(transaction.transactionId, transaction);
    return transaction;
  }

  delete(transactionId: string): void {
    this.transactions.delete(transactionId);
  }
}
