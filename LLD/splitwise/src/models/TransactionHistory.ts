import { TransactionType } from "../enums";

export class TransactionHistory {
  transactionId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: TransactionType;
  expenseId: string | null;
  paymentId: string | null;
  createdAt: Date;

  constructor(
    transactionId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: TransactionType,
    expenseId: string | null = null,
    paymentId: string | null = null,
    createdAt: Date = new Date()
  ) {
    this.transactionId = transactionId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.amount = amount;
    this.type = type;
    this.expenseId = expenseId;
    this.paymentId = paymentId;
    this.createdAt = createdAt;
  }

  getTransactionDetails() {
    return {
      transactionId: this.transactionId,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      amount: this.amount,
      type: this.type,
      expenseId: this.expenseId,
      paymentId: this.paymentId,
      createdAt: this.createdAt,
    };
  }
}
