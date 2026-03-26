export class ExpenseSplit {
  splitId: string;
  expenseId: string;
  userId: string;
  amount: number;
  percentage: number | null;
  customAmount: number | null;

  constructor(
    splitId: string,
    expenseId: string,
    userId: string,
    amount: number,
    percentage: number | null = null,
    customAmount: number | null = null
  ) {
    this.splitId = splitId;
    this.expenseId = expenseId;
    this.userId = userId;
    this.amount = amount;
    this.percentage = percentage;
    this.customAmount = customAmount;
  }

  getAmount(): number {
    return this.amount;
  }

  validate(): boolean {
    if (this.amount < 0) return false;
    if (this.percentage !== null && (this.percentage < 0 || this.percentage > 100)) {
      return false;
    }
    if (this.customAmount !== null && this.customAmount < 0) {
      return false;
    }
    return true;
  }
}
