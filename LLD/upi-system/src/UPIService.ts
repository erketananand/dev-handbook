import { UUID, Decimal, ValidationError } from "./utils";
import { PaymentMethod, TransactionType } from "./enums";
import {
  UserService,
  WalletService,
  TransactionService,
  MerchantService,
  NotificationService,
} from "./services";
import {
  UserRepository,
  WalletRepository,
  TransactionRepository,
  BankAccountRepository,
  RequestMoneyRepository,
  MerchantRepository,
  MerchantPaymentRepository,
  NotificationRepository,
  SecurityLogRepository,
  TransactionReceiptRepository,
} from "./repositories";
import { RequestMoney, Transaction } from "./models";
import { NotificationType } from "./enums";

/**
 * UPIService - Main facade coordinating all UPI operations
 */
export class UPIService {
  private userService: UserService;
  private walletService: WalletService;
  private transactionService: TransactionService;
  private merchantService: MerchantService;
  private notificationService: NotificationService;
  private requestMoneyRepository: RequestMoneyRepository;

  constructor() {
    // Initialize repositories
    const userRepository = new UserRepository();
    const walletRepository = new WalletRepository();
    const transactionRepository = new TransactionRepository();
    const bankAccountRepository = new BankAccountRepository();
    const requestMoneyRepository = new RequestMoneyRepository();
    const merchantRepository = new MerchantRepository();
    const merchantPaymentRepository = new MerchantPaymentRepository();
    const notificationRepository = new NotificationRepository();
    const securityLogRepository = new SecurityLogRepository();
    const receiptRepository = new TransactionReceiptRepository();

    // Initialize services
    this.walletService = new WalletService(walletRepository);
    this.notificationService = new NotificationService(notificationRepository);
    this.transactionService = new TransactionService(
      transactionRepository,
      this.walletService,
      this.notificationService,
      receiptRepository
    );
    this.userService = new UserService(
      userRepository,
      bankAccountRepository,
      this.walletService,
      securityLogRepository
    );
    this.merchantService = new MerchantService(
      merchantRepository,
      merchantPaymentRepository,
      this.transactionService,
      this.userService
    );

    this.requestMoneyRepository = requestMoneyRepository;
  }

  /**
   * Send money from one user to another
   */
  public async sendMoney(
    senderId: UUID,
    recipientIdentifier: string, // UPI ID or Phone number
    amount: Decimal,
    description?: string
  ): Promise<Transaction> {
    // Verify sender
    const sender = await this.userService.getUserById(senderId);
    if (!sender || !sender.canPerformTransaction()) {
      throw new ValidationError("Sender is not verified for transactions");
    }
    if (sender.upiId === recipientIdentifier) {
      throw new ValidationError("Cannot send money to own account");
    }

    // Resolve recipient
    let recipientId: UUID;
    let paymentMethod: PaymentMethod;

    if (recipientIdentifier.includes("@")) {
      // UPI ID format
      const recipient = await this.userService.getUserByUPI(recipientIdentifier);
      if (!recipient) throw new ValidationError("Recipient UPI ID not found");
      recipientId = recipient.userId;
      paymentMethod = PaymentMethod.UPI_ID;
    } else if (/^[0-9]{10}$/.test(recipientIdentifier)) {
      // Phone format
      const recipient = await this.userService.getUserByPhone(recipientIdentifier);
      if (!recipient) throw new ValidationError("Recipient phone number not found");
      recipientId = recipient.userId;
      paymentMethod = PaymentMethod.PHONE;
    } else {
      throw new ValidationError("Invalid recipient identifier format");
    }

    // Create transaction
    const transaction = await this.transactionService.createTransaction(
      senderId,
      recipientId,
      amount,
      TransactionType.SEND,
      paymentMethod,
      null,
      description || "UPI Transfer"
    );

    // Complete transaction
    return this.transactionService.completeTransaction(
      transaction.transactionId,
      `TXN-${Date.now()}`
    );
  }

  /**
   * Request money from another user
   */
  public async requestMoney(
    fromUserId: UUID,
    toUserId: UUID,
    amount: Decimal,
    description?: string,
    expirationDays: number = 7
  ): Promise<RequestMoney> {
    // Verify both users exist
    const fromUser = await this.userService.getUserById(fromUserId);
    const toUser = await this.userService.getUserById(toUserId);

    if (!fromUser || !toUser) {
      throw new ValidationError("One or both users not found");
    }

    const request = new RequestMoney(
      fromUserId,
      toUserId,
      amount,
      expirationDays,
      description
    );

    await this.requestMoneyRepository.save(request);

    // Notify receiver
    await this.notificationService.sendNotification(
      toUserId,
      NotificationType.REQUEST,
      "Money Request",
      `${fromUser.name} requested ₹${amount}`,
      null
    );

    return request;
  }

  /**
   * Approve a money request
   */
  public async approveMoneyRequest(requestId: UUID): Promise<Transaction> {
    const request = await this.requestMoneyRepository.findById(requestId);
    if (!request) throw new ValidationError("Request not found");

    if (!request.isPending()) {
      throw new ValidationError("Request is not pending");
    }

    // Send money as per request
    const toUser = await this.userService.getUserById(request.fromUserId);
    if (!toUser) throw new ValidationError("Recipient user not found");

    const transaction = await this.sendMoney(
      request.toUserId,
      toUser.upiId,
      request.amount,
      request.description || "Payment for money request"
    );

    // Mark request as paid
    request.approve(transaction.transactionId);
    await this.requestMoneyRepository.save(request);

    return transaction;
  }

  /**
   * Pay a merchant using UPI ID
   */
  public async payMerchant(
    buyerId: UUID,
    merchantUpiId: string,
    amount: Decimal,
    description?: string
  ): Promise<Transaction> {
    // Verify buyer
    const buyer = await this.userService.getUserById(buyerId);
    if (!buyer || !buyer.canPerformTransaction()) {
      throw new ValidationError("Buyer is not verified for transactions");
    }

    // Resolve merchant
    const merchant = await this.merchantService.getMerchantByUPI(merchantUpiId);
    if (!merchant || !merchant.isActive) {
      throw new ValidationError("Merchant not found or inactive");
    }

    // Create and complete transaction
    const transaction = await this.transactionService.createTransaction(
      buyerId,
      null,
      amount,
      TransactionType.PAYMENT,
      PaymentMethod.UPI_ID,
      merchant.merchantId,
      description || `Payment to ${merchant.merchantName}`
    );

    const completed = await this.transactionService.completeTransaction(
      transaction.transactionId,
      `MER-${Date.now()}`
    );

    // Update merchant stats
    merchant.receivePayment(amount);

    return completed;
  }

  /**
   * Generate QR code for merchant payments
   */
  public async generateQRCode(
    merchantId: UUID,
    description: string,
    amount?: Decimal
  ): Promise<string> {
    const payment = await this.merchantService.generateQRCode(merchantId, description, amount);
    return payment.qrCode;
  }

  /**
   * Scan and process QR code payment
   */
  public async scanQRCode(qrCodeData: string, buyerId: UUID, amount: Decimal): Promise<Transaction> {
    return this.merchantService.processQRPayment(qrCodeData, buyerId, amount);
  }

  /**
   * Get transaction history for a user
   */
  public async getTransactionHistory(userId: UUID): Promise<Transaction[]> {
    return this.transactionService.getTransactionHistory(userId);
  }

  /**
   * Get wallet balance
   */
  public async getBalance(userId: UUID): Promise<Decimal> {
    const wallet = await this.walletService.getWallet(userId);
    return wallet.getBalance();
  }

  /**
   * Add money to wallet (via bank transfer)
   */
  public async addMoneyToWallet(userId: UUID, amount: Decimal): Promise<void> {
    await this.walletService.addBalance(userId, amount);
    await this.notificationService.sendNotification(
      userId,
      NotificationType.TRANSACTION,
      "Money Added",
      `₹${amount} added to your wallet`,
      null
    );
  }

  /**
   * Register a new user
   */
  public async registerUser(name: string, email: string, phone: string, upiId: string) {
    return this.userService.registerUser(name, email, phone, upiId);
  }

  /**
   * Verify user KYC
   */
  public async verifyKYC(userId: UUID) {
    return this.userService.verifyKYC(userId);
  }

  /**
   * Add bank account for a user
   */
  public async addBankAccount(
    userId: UUID,
    accountNumber: string,
    ifscCode: string,
    bankName: string,
    accountHolder: string
  ) {
    return this.userService.addBankAccount(userId, accountNumber, ifscCode, bankName, accountHolder);
  }

  /**
   * Register a merchant
   */
  public async registerMerchant(
    ownerUserId: UUID,
    merchantName: string,
    merchantUpiId: string,
    category: string,
    commissionRate?: Decimal
  ) {
    return this.merchantService.registerMerchant(
      ownerUserId,
      merchantName,
      merchantUpiId,
      category,
      commissionRate
    );
  }

  /**
   * Get user by UPI ID
   */
  public async getUserByUPI(upiId: string) {
    return this.userService.getUserByUPI(upiId);
  }

  /**
   * Get user by phone
   */
  public async getUserByPhone(phone: string) {
    return this.userService.getUserByPhone(phone);
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: UUID) {
    return this.userService.getUserById(userId);
  }

  /**
   * Get transaction details
   */
  public async getTransactionDetails(transactionId: UUID) {
    return this.transactionService.getTransactionDetails(transactionId);
  }

  /**
   * Reverse a transaction
   */
  public async reverseTransaction(transactionId: UUID) {
    return this.transactionService.reverseTransaction(transactionId);
  }
}
