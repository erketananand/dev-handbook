import { ExpenseSplit } from "../models/ExpenseSplit";

export class ExpenseSplitRepository {
  private splits: Map<string, ExpenseSplit> = new Map();

  save(split: ExpenseSplit): ExpenseSplit {
    this.splits.set(split.splitId, split);
    return split;
  }

  findById(splitId: string): ExpenseSplit | null {
    return this.splits.get(splitId) || null;
  }

  getExpenseSplits(expenseId: string): ExpenseSplit[] {
    return Array.from(this.splits.values()).filter(
      (split) => split.expenseId === expenseId
    );
  }

  getUserSplits(userId: string): ExpenseSplit[] {
    return Array.from(this.splits.values()).filter(
      (split) => split.userId === userId
    );
  }

  update(split: ExpenseSplit): ExpenseSplit {
    this.splits.set(split.splitId, split);
    return split;
  }

  delete(splitId: string): void {
    this.splits.delete(splitId);
  }
}
