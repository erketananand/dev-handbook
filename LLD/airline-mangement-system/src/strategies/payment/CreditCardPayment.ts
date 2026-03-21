import { IPaymentMethod, PaymentResult } from './IPaymentMethod';
import { IdGenerator } from '../../utils/IdGenerator';

export class CreditCardPayment implements IPaymentMethod {
  private cardNumber: string;
  private cvv: string;
  private expiryDate: string;
  private cardHolderName: string;

  constructor(cardNumber: string, cvv: string, expiryDate: string, cardHolderName: string) {
    this.cardNumber = cardNumber;
    this.cvv = cvv;
    this.expiryDate = expiryDate;
    this.cardHolderName = cardHolderName;
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validateCard()) {
      return { success: false, transactionId: '', message: 'Invalid card details.' };
    }
    const transactionId = IdGenerator.generateTransactionId();
    console.log(`[PAYMENT] Processing Credit Card payment of ₹${amount}...`);
    return {
      success: true,
      transactionId,
      message: `₹${amount} charged to card ending ${this.cardNumber.slice(-4)}`
    };
  }

  refund(transactionId: string, amount: number): boolean {
    console.log(`[PAYMENT] Refunding ₹${amount} to Credit Card (TXN: ${transactionId})`);
    return true;
  }

  getMethodName(): string {
    return 'Credit Card';
  }

  private validateCard(): boolean {
    return (
      this.cardNumber.replace(/\s/g, '').length === 16 &&
      this.cvv.length === 3 &&
      this.cardHolderName.trim().length > 0
    );
  }
}
