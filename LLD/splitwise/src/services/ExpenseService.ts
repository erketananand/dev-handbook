import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { Expense } from "../models/Expense";
import { ExpenseSplit } from "../models/ExpenseSplit";
import { SplitType, ExpenseCategory, TransactionType } from "../enums";
import { IdGenerator } from "../utils/IdGenerator";
import { ValidationUtil } from "../utils/ValidationUtil";
import { TransactionHistory } from "../models/TransactionHistory";

export class ExpenseService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  recordExpense(
    groupId: string,
    paidBy: string,
    amount: number,
    description: string,
    splitType: SplitType,
    participants: string[],
    category: ExpenseCategory = ExpenseCategory.OTHER,
    proportions?: number[],
    percentages?: number[],
    exactAmounts?: number[]
  ): Expense {
    if (!ValidationUtil.isValidAmount(amount)) {
      throw new Error("Invalid amount");
    }

    const group = this.database.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const payer = this.database.userRepository.findById(paidBy);
    if (!payer) {
      throw new Error("Payer not found");
    }

    const expenseId = IdGenerator.generateUUID();
    const expense = new Expense(
      expenseId,
      groupId,
      paidBy,
      amount,
      description,
      splitType,
      category
    );

    this.database.expenseRepository.save(expense);

    // Calculate and create splits
    let splits: number[] = [];
    switch (splitType) {
      case SplitType.EQUAL:
        splits = ValidationUtil.validateEqualSplit(amount, participants.length);
        break;
      case SplitType.PROPORTIONAL:
        if (!proportions || proportions.length !== participants.length) {
          throw new Error("Invalid proportions");
        }
        splits = ValidationUtil.validateProportionalSplit(amount, proportions);
        break;
      case SplitType.PERCENTAGE:
        if (!percentages || percentages.length !== participants.length) {
          throw new Error("Invalid percentages");
        }
        splits = ValidationUtil.validatePercentageSplit(amount, percentages);
        break;
      case SplitType.EXACT:
        if (!exactAmounts || exactAmounts.length !== participants.length) {
          throw new Error("Invalid exact amounts");
        }
        if (!ValidationUtil.validateExactSplit(amount, exactAmounts)) {
          throw new Error("Exact amounts must sum to total amount");
        }
        splits = exactAmounts;
        break;
    }

    // Create split records and transaction history
    for (let i = 0; i < participants.length; i++) {
      const userId = participants[i];
      const splitAmount = Math.round(splits[i] * 100) / 100;

      const splitId = IdGenerator.generateUUID();
      const split = new ExpenseSplit(
        splitId,
        expenseId,
        userId,
        splitAmount,
        percentages ? percentages[i] : null,
        exactAmounts ? exactAmounts[i] : null
      );
      this.database.expenseSplitRepository.save(split);

      // Create transaction history record
      const transactionId = IdGenerator.generateUUID();
      const transaction = new TransactionHistory(
        transactionId,
        userId,
        paidBy,
        splitAmount,
        TransactionType.EXPENSE,
        expenseId,
        null
      );
      this.database.transactionHistoryRepository.save(transaction);
    }

    return expense;
  }

  getExpenseDetails(expenseId: string): Expense | null {
    return this.database.expenseRepository.findById(expenseId);
  }

  updateExpense(
    expenseId: string,
    description: string,
    amount: number
  ): Expense {
    const expense = this.database.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    expense.updateDescription(description);
    expense.amount = amount;
    return this.database.expenseRepository.update(expense);
  }

  getGroupExpenses(groupId: string): Expense[] {
    return this.database.expenseRepository.getGroupExpenses(groupId);
  }

  getUserExpenses(userId: string): Expense[] {
    return this.database.expenseRepository.getUserExpenses(userId);
  }

  getExpensesForSettlement(userId: string, withUserId: string): Expense[] {
    // Get all expenses and filter those involving both users
    const user1Expenses = this.database.expenseRepository.getUserExpenses(userId);
    const user2Expenses = this.database.expenseRepository.getUserExpenses(withUserId);
    
    // Return expenses where both users are involved
    return [...user1Expenses, ...user2Expenses].filter(
      (expense, index, self) => self.indexOf(expense) === index
    );
  }

  calculateSplits(
    expense: Expense,
    participants: string[]
  ): ExpenseSplit[] {
    return this.database.expenseSplitRepository.getExpenseSplits(expense.expenseId);
  }

  settleExpense(expenseId: string): void {
    const expense = this.database.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }
    expense.settle();
    this.database.expenseRepository.update(expense);
  }
}
