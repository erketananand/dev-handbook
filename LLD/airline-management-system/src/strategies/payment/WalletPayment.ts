import { IPaymentMethod, PaymentResult } from './IPaymentMethod';
import { IdGenerator } from '../../utils/IdGenerator';

export class WalletPayment implements IPaymentMethod {
  private walletId: string;
  private balance: number;

  constructor(walletId: string, balance: number) {
    this.walletId = walletId;
    this.balance = balance;
  }

  processPayment(amount: number): PaymentResult {
    if (this.balance < amount) {
      return {
        success: false,
        transactionId: '',
        message: `Insufficient wallet balance. Available: ₹${this.balance}, Required: ₹${amount}`
      };
    }
    this.balance -= amount;
    const transactionId = IdGenerator.generateTransactionId();
    console.log(`[PAYMENT] Processing Wallet payment of ₹${amount}. Remaining balance: ₹${this.balance}`);
    return {
      success: true,
      transactionId,
      message: `₹${amount} deducted from wallet ${this.walletId}`
    };
  }

  refund(transactionId: string, amount: number): boolean {
    this.balance += amount;
    console.log(`[PAYMENT] ₹${amount} refunded to wallet ${this.walletId} (TXN: ${transactionId}). New balance: ₹${this.balance}`);
    return true;
  }

  getMethodName(): string {
    return 'Wallet';
  }

  getBalance(): number {
    return this.balance;
  }
}
