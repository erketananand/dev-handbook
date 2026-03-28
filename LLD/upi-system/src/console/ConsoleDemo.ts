/**
 * ConsoleDemo - Implementation of ConsoleInterface
 * 
 * Orchestrates and runs UPI system demonstrations
 * Supports both automated and interactive modes
 * Follows Single Responsibility Principle - demo management only
 */

import * as readline from "readline";
import { UPIService } from "../UPIService";
import { Decimal } from "../utils";
import { ConsoleInterface } from "./ConsoleInterface";
import { User } from "../models";
import { Merchant } from "../models";

export class ConsoleDemo implements ConsoleInterface {
  private upiService: UPIService;
  private alice: User | null = null;
  private bob: User | null = null;
  private merchant: Merchant | null = null;
  private rl: readline.Interface;

  constructor() {
    this.upiService = new UPIService();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user for input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Display menu and get user choice
   */
  private async displayMenu(): Promise<string> {
    console.log("\n=== UPI SYSTEM - INTERACTIVE DEMO ===\n");
    console.log("Select an option:");
    console.log("1. Run Full Automated Demo");
    console.log("2. User Registration");
    console.log("3. KYC Verification");
    console.log("4. Bank Account Linking");
    console.log("5. Wallet Initialization");
    console.log("6. Money Transfers (P2P)");
    console.log("7. Merchant Operations");
    console.log("8. Money Requests");
    console.log("9. QR Code Operations");
    console.log("10. Transaction History");
    console.log("11. Transaction Reversal");
    console.log("0. Exit");
    console.log();

    return await this.prompt("Enter your choice (0-11): ");
  }

  /**
   * Run in interactive mode - prompts user for input
   */
  async runInteractive(): Promise<void> {
    let shouldContinue = true;

    while (shouldContinue) {
      const choice = await this.displayMenu();

      try {
        switch (choice) {
          case "1":
            await this.runAutoDemo();
            shouldContinue = false; // Exit after full demo
            break;
          case "2":
            await this.displayUserRegistration();
            break;
          case "3":
            await this.displayKYCVerification();
            break;
          case "4":
            await this.displayBankAccountLinking();
            break;
          case "5":
            await this.displayWalletInitialization();
            break;
          case "6":
            await this.displayMoneyTransfers();
            break;
          case "7":
            await this.displayMerchantOperations();
            break;
          case "8":
            await this.displayMoneyRequests();
            break;
          case "9":
            await this.displayQRCodeOperations();
            break;
          case "10":
            await this.displayTransactionHistory();
            break;
          case "11":
            await this.displayTransactionReversal();
            break;
          case "0":
            console.log("\nThank you for using UPI System Demo!\n");
            shouldContinue = false;
            break;
          default:
            console.log("\n❌ Invalid choice. Please try again.\n");
        }
      } catch (error: any) {
        console.error(`\n❌ Error: ${error.message}\n`);
      }
    }

    this.rl.close();
  }

  /**
   * Run the complete UPI demo with all workflows
   */
  async runAutoDemo(): Promise<void> {
    console.log("\n=== UPI SYSTEM AUTOMATED DEMO ===\n");

    await this.displayUserRegistration();
    await this.displayKYCVerification();
    await this.displayBankAccountLinking();
    await this.displayWalletInitialization();
    await this.displayMoneyTransfers();
    await this.displayMerchantOperations();
    await this.displayMoneyRequests();
    await this.displayQRCodeOperations();
    await this.displayTransactionHistory();
    await this.displayTransactionReversal();

    console.log("=== DEMO COMPLETE ===\n");
  }

  /**
   * Display user registration workflow
   */
  async displayUserRegistration(): Promise<void> {
    console.log("Step 1: User Registration\n");

    this.alice = await this.upiService.registerUser(
      "Alice Johnson",
      "alice@example.com",
      "9876543210",
      "alice@hdfc"
    );
    console.log(`✓ Alice registered: ${this.alice.userId}`);
    console.log(`  - UPI ID: ${this.alice.upiId}`);
    console.log(`  - Phone: ${this.alice.phone}\n`);

    this.bob = await this.upiService.registerUser(
      "Bob Smith",
      "bob@example.com",
      "9876543211",
      "bob@icici"
    );
    console.log(`✓ Bob registered: ${this.bob.userId}`);
    console.log(`  - UPI ID: ${this.bob.upiId}\n`);
  }

  /**
   * Display KYC verification workflow
   */
  async displayKYCVerification(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 2: KYC Verification\n");

    await this.upiService.verifyKYC(this.alice.userId);
    console.log("✓ Alice KYC verified\n");

    await this.upiService.verifyKYC(this.bob.userId);
    console.log("✓ Bob KYC verified\n");
  }

  /**
   * Display bank account linking workflow
   */
  async displayBankAccountLinking(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 3: Link Bank Accounts\n");

    const aliceBankAccount = await this.upiService.addBankAccount(
      this.alice.userId,
      "1234567890123",
      "HDFC0001234",
      "HDFC Bank",
      "Alice Johnson"
    );
    console.log(`✓ Alice linked bank account: ${aliceBankAccount.getMaskedAccountNumber()}\n`);

    const bobBankAccount = await this.upiService.addBankAccount(
      this.bob.userId,
      "9876543210987",
      "ICIC0005678",
      "ICICI Bank",
      "Bob Smith"
    );
    console.log(`✓ Bob linked bank account: ${bobBankAccount.getMaskedAccountNumber()}\n`);
  }

  /**
   * Display wallet initialization workflow
   */
  async displayWalletInitialization(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 4: Add Money to Wallets\n");

    await this.upiService.addMoneyToWallet(this.alice.userId, 50000 as Decimal);
    console.log("✓ Added ₹50,000 to Alice's wallet");

    let aliceBalance = await this.upiService.getBalance(this.alice.userId);
    console.log(`  Alice's balance: ₹${aliceBalance}\n`);

    await this.upiService.addMoneyToWallet(this.bob.userId, 30000 as Decimal);
    console.log("✓ Added ₹30,000 to Bob's wallet");

    let bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Bob's balance: ₹${bobBalance}\n`);
  }

  /**
   * Display peer-to-peer money transfer workflows
   */
  async displayMoneyTransfers(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    // Send using UPI ID
    console.log("Step 5: Alice sends ₹500 to Bob\n");

    const tx1 = await this.upiService.sendMoney(
      this.alice.userId,
      this.bob.upiId,
      500 as Decimal,
      "Lunch money"
    );
    console.log(`✓ Transaction completed: ${tx1.transactionId}`);
    console.log(`  Status: ${tx1.status}`);
    console.log(`  Reference: ${tx1.referenceNumber}\n`);

    let aliceBalance = await this.upiService.getBalance(this.alice.userId);
    let bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Alice's balance: ₹${aliceBalance}`);
    console.log(`  Bob's balance: ₹${bobBalance}\n`);

    // Send using phone number
    console.log("Step 6: Bob sends ₹1000 to Alice using phone number\n");

    const tx2 = await this.upiService.sendMoney(
      this.bob.userId,
      this.alice.phone,
      1000 as Decimal,
      "Movie ticket reimbursement"
    );
    console.log(`✓ Transaction completed: ${tx2.transactionId}`);
    console.log(`  Status: ${tx2.status}\n`);

    aliceBalance = await this.upiService.getBalance(this.alice.userId);
    bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Alice's balance: ₹${aliceBalance}`);
    console.log(`  Bob's balance: ₹${bobBalance}\n`);
  }

  /**
   * Display merchant registration and payment workflows
   */
  async displayMerchantOperations(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 7: Register Merchant\n");

    this.merchant = await this.upiService.registerMerchant(
      this.alice.userId,
      "Coffee House Cafe",
      "coffeehouse@upi",
      "F&B",
      1.5 as Decimal
    );
    console.log(`✓ Merchant registered: ${this.merchant.merchantId}`);
    console.log(`  Name: ${this.merchant.merchantName}`);
    console.log(`  UPI ID: ${this.merchant.merchantUpiId}`);
    console.log(`  Commission: ${this.merchant.commissionRate}%\n`);

    console.log("Step 8: Bob pays merchant ₹200\n");

    const tx3 = await this.upiService.payMerchant(
      this.bob.userId,
      this.merchant.merchantUpiId,
      200 as Decimal,
      "Coffee order"
    );
    console.log(`✓ Merchant payment completed: ${tx3.transactionId}`);
    console.log(`  Amount: ₹${tx3.amount}`);
    console.log(`  Status: ${tx3.status}\n`);

    const bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Bob's balance after payment: ₹${bobBalance}\n`);
  }

  /**
   * Display money request workflows
   */
  async displayMoneyRequests(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 9: Alice requests ₹150 from Bob\n");

    const moneyRequest = await this.upiService.requestMoney(
      this.alice.userId,
      this.bob.userId,
      150 as Decimal,
      "Shared dinner expense",
      7
    );
    console.log(`✓ Money request created: ${moneyRequest.requestId}`);
    console.log(`  Amount: ₹${moneyRequest.amount}`);
    console.log(`  Status: ${moneyRequest.status}`);
    console.log(`  Expires at: ${moneyRequest.expiresAt.toLocaleDateString()}\n`);

    console.log("Step 10: Bob approves the money request\n");

    const tx4 = await this.upiService.approveMoneyRequest(moneyRequest.requestId);
    console.log(`✓ Money request approved via transaction: ${tx4.transactionId}`);
    console.log(`  Amount: ₹${tx4.amount}\n`);

    const aliceBalance = await this.upiService.getBalance(this.alice.userId);
    const bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Alice's balance: ₹${aliceBalance}`);
    console.log(`  Bob's balance: ₹${bobBalance}\n`);
  }

  /**
   * Display QR code generation and payment workflows
   */
  async displayQRCodeOperations(): Promise<void> {
    if (!this.merchant || !this.bob) {
      throw new Error("Merchant or Bob not initialized");
    }

    console.log("Step 11: Generate static QR for Coffee House\n");

    const qrCode = await this.upiService.generateQRCode(
      this.merchant.merchantId,
      "Coffee House - Standard",
      100 as Decimal
    );
    console.log(`✓ QR Code generated:`);
    console.log(`  ${qrCode}\n`);

    console.log("Step 12: Bob scans and pays using QR code\n");

    const tx5 = await this.upiService.scanQRCode(
      qrCode,
      this.bob.userId,
      100 as Decimal
    );
    console.log(`✓ QR payment completed: ${tx5.transactionId}`);
    console.log(`  Amount: ₹${tx5.amount}\n`);

    const bobBalance = await this.upiService.getBalance(this.bob.userId);
    console.log(`  Bob's balance after QR payment: ₹${bobBalance}\n`);
  }

  /**
   * Display transaction history and details workflows
   */
  async displayTransactionHistory(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 13: View Transaction History\n");

    const aliceHistory = await this.upiService.getTransactionHistory(
      this.alice.userId
    );
    const bobHistory = await this.upiService.getTransactionHistory(
      this.bob.userId
    );

    console.log(`Alice's Transactions (${aliceHistory.length} total):`);
    aliceHistory.slice(0, 3).forEach((tx, i) => {
      const role = tx.fromUserId === this.alice!.userId ? "Sent" : "Received";
      console.log(
        `  ${i + 1}. ${role} ₹${tx.amount} | Status: ${tx.status} | Time: ${tx.transactionTime.toLocaleTimeString()}`
      );
    });

    console.log(`\nBob's Transactions (${bobHistory.length} total):`);
    bobHistory.slice(0, 3).forEach((tx, i) => {
      const role = tx.fromUserId === this.bob!.userId ? "Sent" : "Received";
      console.log(
        `  ${i + 1}. ${role} ₹${tx.amount} | Status: ${tx.status} | Time: ${tx.transactionTime.toLocaleTimeString()}`
      );
    });

    console.log();

    console.log("Step 14: Get Transaction Details\n");

    const aliceFirstTx = aliceHistory[0];
    const txDetails = await this.upiService.getTransactionDetails(
      aliceFirstTx.transactionId
    );
    console.log(`Transaction Details for: ${aliceFirstTx.transactionId}`);
    console.log(`Status: ${txDetails.status}`);
    console.log(`Amount: ₹${txDetails.amount}`);
    console.log(`Type: ${txDetails.type}\n`);
  }

  /**
   * Display transaction reversal workflow
   */
  async displayTransactionReversal(): Promise<void> {
    if (!this.alice || !this.bob) {
      throw new Error("Users not initialized. Run User Registration first.");
    }

    console.log("Step 15: Reverse Transaction\n");

    const aliceHistory = await this.upiService.getTransactionHistory(
      this.alice.userId
    );

    if (aliceHistory.length > 0) {
      const txToReverse = aliceHistory[0];

      if (txToReverse.canBeReversed()) {
        const reversedTx = await this.upiService.reverseTransaction(
          txToReverse.transactionId
        );
        console.log(`✓ Transaction reversed: ${reversedTx.transactionId}`);
        console.log(`  New Status: ${reversedTx.status}\n`);

        const aliceBalance = await this.upiService.getBalance(this.alice.userId);
        const bobBalance = await this.upiService.getBalance(this.bob.userId);
        console.log(`  Alice's balance after reversal: ₹${aliceBalance}`);
        console.log(`  Bob's balance after reversal: ₹${bobBalance}\n`);
      } else {
        console.log(`✓ Transaction cannot be reversed (outside 24-hour window)\n`);
      }
    }
  }
}
