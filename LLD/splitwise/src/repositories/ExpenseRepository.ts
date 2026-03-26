import { Expense } from "../models/Expense";

export class ExpenseRepository {
  private expenses: Map<string, Expense> = new Map();

  save(expense: Expense): Expense {
    this.expenses.set(expense.expenseId, expense);
    return expense;
  }

  findById(expenseId: string): Expense | null {
    return this.expenses.get(expenseId) || null;
  }

  getGroupExpenses(groupId: string): Expense[] {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.groupId === groupId
    );
  }

  getUserExpenses(userId: string): Expense[] {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.paidBy === userId
    );
  }

  update(expense: Expense): Expense {
    this.expenses.set(expense.expenseId, expense);
    return expense;
  }

  getExpensesByStatus(isSettled: boolean): Expense[] {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.isSettled === isSettled
    );
  }

  delete(expenseId: string): void {
    this.expenses.delete(expenseId);
  }
}
