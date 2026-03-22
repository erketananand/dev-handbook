import { IdGenerator } from '../utils/IdGenerator';
import { IPaymentMethod, PaymentResult } from '../strategies/payment/IPaymentMethod';
import { PaymentStatus } from '../enums/PaymentStatus';

export class Payment {
  public readonly id: string;
  public readonly bookingId: string;
  public amount: number;
  public paymentMethod: IPaymentMethod;
  public status: PaymentStatus;
  public transactionId: string | null;
  public processedAt: Date | null;
  public readonly createdAt: Date;

  constructor(
    bookingId: string,
    amount: number,
    paymentMethod: IPaymentMethod,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.bookingId = bookingId;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.status = PaymentStatus.PENDING;
    this.transactionId = null;
    this.processedAt = null;
    this.createdAt = new Date();
  }

  public process(): boolean {
    const result: PaymentResult = this.paymentMethod.processPayment(this.amount);
    if (result.success) {
      this.markSuccess(result.transactionId);
      return true;
    }
    this.markFailed();
    return false;
  }

  public refund(refundAmount: number): boolean {
    if (this.status !== PaymentStatus.SUCCESS || !this.transactionId) return false;
    const success = this.paymentMethod.refund(this.transactionId, refundAmount);
    if (success) this.status = PaymentStatus.REFUNDED;
    return success;
  }

  public markSuccess(transactionId: string): void {
    this.status = PaymentStatus.SUCCESS;
    this.transactionId = transactionId;
    this.processedAt = new Date();
  }

  public markFailed(): void {
    this.status = PaymentStatus.FAILED;
    this.processedAt = new Date();
  }

  public getStatus(): PaymentStatus {
    return this.status;
  }

  public getDisplayInfo(): string {
    return `Payment ${this.id} | ₹${this.amount} | ${this.status} | ${this.paymentMethod.getMethodName()}`;
  }
}
