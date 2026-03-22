import { Payment } from '../models/Payment';
import { PaymentStatus } from '../enums';

export class PaymentRepository {
  private payments: Map<string, Payment> = new Map();

  public save(payment: Payment): void {
    this.payments.set(payment.id, payment);
  }

  public findById(id: string): Payment | null {
    return this.payments.get(id) || null;
  }

  public findByReservation(reservationId: string): Payment | null {
    for (const payment of this.payments.values()) {
      if (payment.reservationId === reservationId) {
        return payment;
      }
    }
    return null;
  }

  public getPaymentsByStatus(status: PaymentStatus): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.status === status);
  }

  public getSuccessfulPayments(): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.status === PaymentStatus.SUCCESSFUL);
  }

  public getFailedPayments(): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.status === PaymentStatus.FAILED);
  }

  public getPendingPayments(): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.status === PaymentStatus.PENDING);
  }

  public getRefundedPayments(): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.status === PaymentStatus.REFUNDED);
  }

  public getAllPayments(): Payment[] {
    return Array.from(this.payments.values());
  }

  public getTotalRevenue(): number {
    return this.getSuccessfulPayments().reduce((sum, p) => sum + p.amount, 0);
  }

  public getRevenueByDateRange(startDate: Date, endDate: Date): number {
    return this.getSuccessfulPayments()
      .filter(p => p.processedAt && p.processedAt >= startDate && p.processedAt <= endDate)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  public update(payment: Payment): void {
    if (this.payments.has(payment.id)) {
      this.payments.set(payment.id, payment);
    }
  }

  public delete(paymentId: string): boolean {
    return this.payments.delete(paymentId);
  }

  public clear(): void {
    this.payments.clear();
  }
}
