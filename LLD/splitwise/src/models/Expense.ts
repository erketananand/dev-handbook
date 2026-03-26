import { SplitType, ExpenseCategory } from "../enums";

export class Expense {
  expenseId: string;
  groupId: string;
  paidBy: string;
  amount: number;
  description: string;
  splitType: SplitType;
  category: ExpenseCategory;
  createdAt: Date;
  updatedAt: Date | null;
  isSettled: boolean;

  constructor(
    expenseId: string,
    groupId: string,
    paidBy: string,
    amount: number,
    description: string,
    splitType: SplitType,
    category: ExpenseCategory = ExpenseCategory.OTHER,
    createdAt: Date = new Date(),
    updatedAt: Date | null = null,
    isSettled: boolean = false
  ) {
    this.expenseId = expenseId;
    this.groupId = groupId;
    this.paidBy = paidBy;
    this.amount = amount;
    this.description = description;
    this.splitType = splitType;
    this.category = category;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isSettled = isSettled;
  }

  getTotalAmount(): number {
    return this.amount;
  }

  updateDescription(newDescription: string): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  settle(): void {
    this.isSettled = true;
  }
}
