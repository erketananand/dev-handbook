/**
 * IConsoleDemo - Interface for console/demo operations
 * 
 * Defines the contract for running UPI system demonstrations
 * Follows Interface Segregation Principle - focused interface
 */
export interface IConsoleDemo {
  /**
   * Run the complete UPI demo with all workflows
   */
  run(): Promise<void>;

  /**
   * Display user registration workflow
   */
  displayUserRegistration(): Promise<void>;

  /**
   * Display KYC verification workflow
   */
  displayKYCVerification(): Promise<void>;

  /**
   * Display bank account linking workflow
   */
  displayBankAccountLinking(): Promise<void>;

  /**
   * Display wallet initialization workflow
   */
  displayWalletInitialization(): Promise<void>;

  /**
   * Display peer-to-peer money transfer workflows
   */
  displayMoneyTransfers(): Promise<void>;

  /**
   * Display merchant registration and payments
   */
  displayMerchantOperations(): Promise<void>;

  /**
   * Display money request workflows
   */
  displayMoneyRequests(): Promise<void>;

  /**
   * Display QR code generation and payments
   */
  displayQRCodeOperations(): Promise<void>;

  /**
   * Display transaction history and details
   */
  displayTransactionHistory(): Promise<void>;

  /**
   * Display transaction reversal workflow
   */
  displayTransactionReversal(): Promise<void>;
}
