import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Payment } from '../models/Payment';
import { PaymentMethod, PaymentStatus } from '../enums';
import { Reservation } from '../models/Reservation';

export class PaymentService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public createPayment(
    reservationId: string,
    paymentMethod: PaymentMethod,
    amount: number
  ): Payment {
    const reservation = this.db.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const existingPayment = this.db.paymentRepository.findByReservation(reservationId);
    if (existingPayment && existingPayment.status === PaymentStatus.SUCCESSFUL) {
      throw new Error('Payment already processed for this reservation');
    }

    const payment = new Payment(reservationId, paymentMethod, amount);
    this.db.paymentRepository.save(payment);
    return payment;
  }

  public processPayment(paymentId: string): Payment | null {
    const payment = this.db.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Payment already processed');
    }

    payment.process();
    this.db.paymentRepository.update(payment);
    return payment;
  }

  public failPayment(paymentId: string): Payment | null {
    const payment = this.db.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.fail();
    this.db.paymentRepository.update(payment);
    return payment;
  }

  public refundPayment(paymentId: string, refundAmount: number): Payment | null {
    const payment = this.db.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.isSuccessful()) {
      throw new Error('Only successful payments can be refunded');
    }

    if (refundAmount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const refunded = payment.refund();
    if (refunded) {
      this.db.paymentRepository.update(payment);
    }

    return payment;
  }

  public getPaymentByReservation(reservationId: string): Payment | null {
    return this.db.paymentRepository.findByReservation(reservationId);
  }

  public getAllPayments(): Payment[] {
    return this.db.paymentRepository.getAllPayments();
  }

  public getSuccessfulPayments(): Payment[] {
    return this.db.paymentRepository.getSuccessfulPayments();
  }

  public getTotalRevenue(): number {
    return this.db.paymentRepository.getTotalRevenue();
  }

  public getRevenueByDate(startDate: Date, endDate: Date): number {
    return this.db.paymentRepository.getRevenueByDateRange(startDate, endDate);
  }

  public getPaymentSummary(): string {
    const totalPayments = this.getAllPayments().length;
    const successfulPayments = this.getSuccessfulPayments().length;
    const failedPayments = this.db.paymentRepository.getFailedPayments().length;
    const pendingPayments = this.db.paymentRepository.getPendingPayments().length;
    const totalRevenue = this.getTotalRevenue();

    return `
Payment Summary:
- Total Payments: ${totalPayments}
- Successful: ${successfulPayments}
- Failed: ${failedPayments}
- Pending: ${pendingPayments}
- Total Revenue: ₹${totalRevenue.toFixed(2)}
    `.trim();
  }
}
