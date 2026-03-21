import { IPaymentMethod, PaymentResult } from './IPaymentMethod';
import { IdGenerator } from '../../utils/IdGenerator';

export class NetBankingPayment implements IPaymentMethod {
  private bankName: string;
  private accountNumber: string;

  constructor(bankName: string, accountNumber: string) {
    this.bankName = bankName;
    this.accountNumber = accountNumber;
  }

  processPayment(amount: number): PaymentResult {
    const transactionId = IdGenerator.generateTransactionId();
    console.log(`[PAYMENT] Processing Net Banking payment of ₹${amount} via ${this.bankName}...`);
    return {
      success: true,
      transactionId,
      message: `₹${amount} debited from ${this.bankName} account ending ${this.accountNumber.slice(-4)}`
    };
  }

  refund(transactionId: string, amount: number): boolean {
    console.log(`[PAYMENT] Refunding ₹${amount} to ${this.bankName} account (TXN: ${transactionId})`);
    return true;
  }

  getMethodName(): string {
    return `Net Banking (${this.bankName})`;
  }
}
