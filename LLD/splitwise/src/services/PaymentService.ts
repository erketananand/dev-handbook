import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { Payment } from "../models/Payment";
import { PaymentStatus, TransactionType } from "../enums";
import { IdGenerator } from "../utils/IdGenerator";
import { TransactionHistory } from "../models/TransactionHistory";

export class PaymentService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  recordPayment(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Payment {
    const fromUser = this.database.userRepository.findById(fromUserId);
    if (!fromUser) {
      throw new Error("From user not found");
    }

    const toUser = this.database.userRepository.findById(toUserId);
    if (!toUser) {
      throw new Error("To user not found");
    }

    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const paymentId = IdGenerator.generatePaymentCode();
    const payment = new Payment(paymentId, fromUserId, toUserId, amount);
    const saved = this.database.paymentRepository.save(payment);

    return saved;
  }

  completePayment(paymentId: string): Payment {
    const payment = this.database.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.complete();
    const completed = this.database.paymentRepository.update(payment);

    // Create transaction history record
    const transactionId = IdGenerator.generateTransactionId();
    const transaction = new TransactionHistory(
      transactionId,
      payment.fromUserId,
      payment.toUserId,
      payment.amount,
      TransactionType.PAYMENT,
      null,
      paymentId
    );
    this.database.transactionHistoryRepository.save(transaction);

    return completed;
  }

  refundPayment(paymentId: string): void {
    const payment = this.database.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    this.database.paymentRepository.delete(paymentId);
  }

  getPaymentHistory(userId: string): Payment[] {
    const user = this.database.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const payments = this.database.paymentRepository.getOutstandingPayments(userId);
    return payments;
  }

  getOutstandingPayments(userId: string): Payment[] {
    return this.database.paymentRepository.getOutstandingPayments(userId);
  }

  settlePayment(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Payment {
    const payment = this.recordPayment(fromUserId, toUserId, amount);
    this.completePayment(payment.paymentId);
    return this.database.paymentRepository.findById(payment.paymentId)!;
  }
}
