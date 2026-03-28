import { UUID, Decimal, ValidationError, TransactionError } from "../utils";
import { Merchant, MerchantPayment, Transaction } from "../models";
import { TransactionType, PaymentMethod } from "../enums";
import {
  MerchantRepository,
  MerchantPaymentRepository,
} from "../repositories";
import { TransactionService } from "./TransactionService";
import { UserService } from "./UserService";

/**
 * MerchantService - Manages merchant accounts and QR codes
 */
export class MerchantService {
  constructor(
    private merchantRepository: MerchantRepository,
    private merchantPaymentRepository: MerchantPaymentRepository,
    private transactionService: TransactionService,
    private userService: UserService
  ) {}

  public async registerMerchant(
    ownerUserId: UUID,
    merchantName: string,
    merchantUpiId: string,
    category: string,
    commissionRate: Decimal = 2
  ): Promise<Merchant> {
    // Verify owner exists and is KYC verified
    const owner = await this.userService.getUserById(ownerUserId);
    if (!owner || !owner.isVerified) {
      throw new ValidationError("Owner must be KYC verified");
    }

    // Check UPI uniqueness
    const existingMerchant = await this.merchantRepository.findByUPI(merchantUpiId);
    if (existingMerchant) {
      throw new ValidationError("Merchant UPI already registered");
    }

    const merchant = new Merchant(
      merchantName,
      merchantUpiId,
      ownerUserId,
      category,
      commissionRate
    );
    return this.merchantRepository.save(merchant);
  }

  public async getMerchantByUPI(upiId: string): Promise<Merchant | null> {
    return this.merchantRepository.findByUPI(upiId);
  }

  public async generateQRCode(
    merchantId: UUID,
    description: string,
    amount: Decimal | null = null
  ): Promise<MerchantPayment> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) throw new Error("Merchant not found");

    const qrCode = `UPI://PAY?pa=${merchant.merchantUpiId}&am=${amount || 0}&tn=${description}`;
    const payment = new MerchantPayment(merchantId, qrCode, description, amount);
    return this.merchantPaymentRepository.save(payment);
  }

  public async processQRPayment(
    qrCode: string,
    userId: UUID,
    amount: Decimal
  ): Promise<Transaction> {
    const payment = await this.merchantPaymentRepository.findByQRCode(qrCode);
    if (!payment || !payment.isActive) {
      throw new TransactionError("Invalid or inactive QR code");
    }

    const merchant = await this.merchantRepository.findById(payment.merchantId);
    if (!merchant) throw new Error("Merchant not found");

    // If static QR, amount must match
    if (payment.isStatic() && payment.amount !== amount) {
      throw new ValidationError("Amount mismatch with QR code");
    }

    // Create transaction
    const transaction = await this.transactionService.createTransaction(
      userId,
      null,
      amount,
      TransactionType.PAYMENT,
      PaymentMethod.UPI_ID,
      merchant.merchantId,
      `Payment to ${merchant.merchantName}`
    );

    // Complete transaction
    const completed = await this.transactionService.completeTransaction(
      transaction.transactionId,
      `QR-${Date.now()}`
    );

    // Update merchant stats
    merchant.receivePayment(amount);
    await this.merchantRepository.save(merchant);

    return completed;
  }

  public async getMerchantTransactions(_merchantId: UUID): Promise<Transaction[]> {
    // This would be implemented in TransactionService to filter by merchantId
    return [];
  }
}
