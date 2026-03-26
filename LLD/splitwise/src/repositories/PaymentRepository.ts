import { Payment } from "../models/Payment";

export class PaymentRepository {
  private payments: Map<string, Payment> = new Map();

  save(payment: Payment): Payment {
    this.payments.set(payment.paymentId, payment);
    return payment;
  }

  findById(paymentId: string): Payment | null {
    return this.payments.get(paymentId) || null;
  }

  getPaymentsBetween(fromUserId: string, toUserId: string): Payment[] {
    return Array.from(this.payments.values()).filter(
      (payment) =>
        (payment.fromUserId === fromUserId && payment.toUserId === toUserId) ||
        (payment.fromUserId === toUserId && payment.toUserId === fromUserId)
    );
  }

  getOutstandingPayments(userId: string): Payment[] {
    return Array.from(this.payments.values()).filter(
      (payment) =>
        (payment.fromUserId === userId || payment.toUserId === userId) &&
        !payment.isSettled()
    );
  }

  update(payment: Payment): Payment {
    this.payments.set(payment.paymentId, payment);
    return payment;
  }

  delete(paymentId: string): void {
    this.payments.delete(paymentId);
  }
}
