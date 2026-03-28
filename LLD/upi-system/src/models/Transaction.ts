import { UUID, Decimal, generateUUID, ValidationError } from "../utils";
import { TransactionType, TransactionStatus, PaymentMethod } from "../enums";

/**
 * Transaction - Records fund transfers
 */
export class Transaction {
  readonly transactionId: UUID;
  readonly fromUserId: UUID;
  toUserId: UUID | null;
  merchantId: UUID | null;
  amount: Decimal;
  description: string | null;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  transactionTime: Date;
  completedTime: Date | null;
  referenceNumber: string | null;

  constructor(
    fromUserId: UUID,
    toUserId: UUID | null,
    amount: Decimal,
    type: TransactionType,
    paymentMethod: PaymentMethod,
    merchantId: UUID | null = null,
    description: string | null = null
  ) {
    if (amount <= 0) throw new ValidationError("Amount must be positive");

    this.transactionId = generateUUID();
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.merchantId = merchantId;
    this.amount = amount;
    this.description = description;
    this.type = type;
    this.status = TransactionStatus.PENDING;
    this.paymentMethod = paymentMethod;
    this.transactionTime = new Date();
    this.completedTime = null;
    this.referenceNumber = null;
  }

  public complete(referenceNumber: string): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new ValidationError("Transaction already completed or failed");
    }
    this.status = TransactionStatus.COMPLETED;
    this.completedTime = new Date();
    this.referenceNumber = referenceNumber;
  }

  public fail(): void {
    this.status = TransactionStatus.FAILED;
    this.completedTime = new Date();
  }

  public reverse(): void {
    if (this.status !== TransactionStatus.COMPLETED) {
      throw new ValidationError("Only completed transactions can be reversed");
    }
    // 24-hour reversal window
    const hoursElapsed = (Date.now() - this.transactionTime.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      throw new ValidationError("Transaction reversal window (24 hours) has expired");
    }
    this.status = TransactionStatus.REVERSED;
  }

  public isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  public isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  public canBeReversed(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }
}
