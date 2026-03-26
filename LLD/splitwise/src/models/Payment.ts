import { PaymentStatus } from "../enums";

export class Payment {
  paymentId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  createdAt: Date;
  completedAt: Date | null;

  constructor(
    paymentId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    status: PaymentStatus = PaymentStatus.PENDING,
    method: string = "CASH",
    createdAt: Date = new Date(),
    completedAt: Date | null = null
  ) {
    this.paymentId = paymentId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.amount = amount;
    this.status = status;
    this.method = method;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
  }

  complete(): void {
    this.status = PaymentStatus.COMPLETED;
    this.completedAt = new Date();
  }

  isSettled(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }
}
