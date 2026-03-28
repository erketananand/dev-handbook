import { UUID, Decimal, TransactionError } from "../utils";
import { Transaction, TransactionReceipt } from "../models";
import { TransactionType, PaymentMethod, NotificationType } from "../enums";
import {
  TransactionRepository,
  TransactionReceiptRepository,
} from "../repositories";
import { WalletService } from "./WalletService";
import { NotificationService } from "./NotificationService";

/**
 * TransactionService - Handles transaction lifecycle
 */
export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private receiptRepository: TransactionReceiptRepository
  ) {}

  public async createTransaction(
    fromUserId: UUID,
    toUserId: UUID | null,
    amount: Decimal,
    type: TransactionType,
    paymentMethod: PaymentMethod,
    merchantId: UUID | null = null,
    description: string | null = null
  ): Promise<Transaction> {
    // Validate sender can perform transaction
    await this.walletService.validateTransaction(fromUserId, amount);

    // Create transaction
    const transaction = new Transaction(
      fromUserId,
      toUserId,
      amount,
      type,
      paymentMethod,
      merchantId,
      description
    );

    return this.transactionRepository.save(transaction);
  }

  public async completeTransaction(
    transactionId: UUID,
    referenceNumber: string
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    try {
      // Deduct from sender
      await this.walletService.deductBalance(transaction.fromUserId, transaction.amount);

      // Add to receiver
      if (transaction.toUserId) {
        await this.walletService.addBalance(transaction.toUserId, transaction.amount);
      } else if (transaction.merchantId) {
        // Merchant receives after commission deduction
        // Commission or settlement handled separately
        await this.walletService.addBalance(
          transaction.merchantId as any,
          transaction.amount
        );
      }

      transaction.complete(referenceNumber);
      const saved = await this.transactionRepository.save(transaction);

      // Generate receipt
      const receipt = new TransactionReceipt(transactionId, {
        transactionId: transaction.transactionId,
        from: transaction.fromUserId,
        to: transaction.toUserId || transaction.merchantId,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        completedTime: transaction.completedTime,
        referenceNumber,
      });
      await this.receiptRepository.save(receipt);

      // Send notifications
      await this.notificationService.sendNotification(
        transaction.fromUserId,
        NotificationType.TRANSACTION,
        "Money Sent",
        `Successfully sent ₹${transaction.amount} to recipient`,
        transactionId
      );

      if (transaction.toUserId) {
        await this.notificationService.sendNotification(
          transaction.toUserId,
          NotificationType.TRANSACTION,
          "Money Received",
          `Received ₹${transaction.amount} from sender`,
          transactionId
        );
      }

      return saved;
    } catch (error) {
      await this.failTransaction(transactionId, (error as Error).message);
      throw error;
    }
  }

  public async failTransaction(transactionId: UUID, reason: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    transaction.fail();
    const saved = await this.transactionRepository.save(transaction);

    // Notify sender
    await this.notificationService.sendNotification(
      transaction.fromUserId,
      NotificationType.TRANSACTION,
      "Transaction Failed",
      `Transaction failed: ${reason}`,
      transactionId
    );

    return saved;
  }

  public async reverseTransaction(transactionId: UUID): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    if (!transaction.canBeReversed()) {
      throw new TransactionError("Transaction cannot be reversed");
    }

    try {
      transaction.reverse();

      // Reverse amounts
      await this.walletService.addBalance(transaction.fromUserId, transaction.amount);
      if (transaction.toUserId) {
        await this.walletService.deductBalance(transaction.toUserId, transaction.amount);
      }

      const saved = await this.transactionRepository.save(transaction);

      // Send notifications
      await this.notificationService.sendNotification(
        transaction.fromUserId,
        NotificationType.TRANSACTION,
        "Transaction Reversed",
        `Transaction of ₹${transaction.amount} has been reversed`,
        transactionId
      );

      return saved;
    } catch (error) {
      throw new TransactionError(
        `Failed to reverse transaction: ${(error as Error).message}`
      );
    }
  }

  public async getTransactionHistory(userId: UUID): Promise<Transaction[]> {
    return this.transactionRepository.findByUserId(userId);
  }

  public async getTransactionDetails(transactionId: UUID): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  }

  public async getTransactionReceipt(transactionId: UUID): Promise<TransactionReceipt | null> {
    return this.receiptRepository.findByTransactionId(transactionId);
  }
}
