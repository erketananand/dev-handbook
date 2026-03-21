export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

/**
 * Strategy Pattern interface for payment processing.
 * New payment methods can be added without modifying existing code.
 */
export interface IPaymentMethod {
  processPayment(amount: number): PaymentResult;
  refund(transactionId: string, amount: number): boolean;
  getMethodName(): string;
}
