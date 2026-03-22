import { IdGenerator } from '../utils/IdGenerator';
import { PaymentMethod, PaymentStatus } from '../enums';

export class Payment {
  public readonly id: string;
  public reservationId: string;
  public paymentMethod: PaymentMethod;
  public amount: number;
  public status: PaymentStatus;
  public transactionId: string | null;
  public readonly createdAt: Date;
  public processedAt: Date | null;

  constructor(
    reservationId: string,
    paymentMethod: PaymentMethod,
    amount: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.reservationId = reservationId;
    this.paymentMethod = paymentMethod;
    this.amount = amount;
    this.status = PaymentStatus.PENDING;
    this.transactionId = null;
    this.createdAt = new Date();
    this.processedAt = null;
  }

  public process(): boolean {
    // Simulate payment processing
    if (this.status === PaymentStatus.PENDING) {
      this.transactionId = IdGenerator.generateTransactionId();
      this.status = PaymentStatus.SUCCESSFUL;
      this.processedAt = new Date();
      return true;
    }
    return false;
  }

  public fail(): void {
    if (this.status === PaymentStatus.PENDING) {
      this.status = PaymentStatus.FAILED;
      this.processedAt = new Date();
    }
  }

  public refund(): boolean {
    if (this.status === PaymentStatus.SUCCESSFUL) {
      this.status = PaymentStatus.REFUNDED;
      this.processedAt = new Date();
      return true;
    }
    return false;
  }

  public isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  public isSuccessful(): boolean {
    return this.status === PaymentStatus.SUCCESSFUL;
  }

  public getDisplayInfo(): string {
    return `${this.paymentMethod} | ₹${this.amount.toFixed(2)} | ${this.status} | TXN: ${this.transactionId || 'N/A'}`;
  }
}
