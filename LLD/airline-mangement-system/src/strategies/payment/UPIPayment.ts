import { IPaymentMethod, PaymentResult } from './IPaymentMethod';
import { IdGenerator } from '../../utils/IdGenerator';

export class UPIPayment implements IPaymentMethod {
  private upiId: string;
  private appName: string;

  constructor(upiId: string, appName: string = 'UPI') {
    this.upiId = upiId;
    this.appName = appName;
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validateUpiId()) {
      return { success: false, transactionId: '', message: 'Invalid UPI ID.' };
    }
    const transactionId = IdGenerator.generateTransactionId();
    console.log(`[PAYMENT] Processing UPI payment of ₹${amount} via ${this.appName}...`);
    return {
      success: true,
      transactionId,
      message: `₹${amount} debited from ${this.upiId}`
    };
  }

  refund(transactionId: string, amount: number): boolean {
    console.log(`[PAYMENT] Refunding ₹${amount} to UPI ID ${this.upiId} (TXN: ${transactionId})`);
    return true;
  }

  getMethodName(): string {
    return `UPI (${this.appName})`;
  }

  private validateUpiId(): boolean {
    return this.upiId.includes('@') && this.upiId.trim().length > 3;
  }
}
