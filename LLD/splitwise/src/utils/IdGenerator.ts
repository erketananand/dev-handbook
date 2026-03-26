import { randomUUID } from "crypto";

export class IdGenerator {
  static generateUUID(): string {
    return randomUUID();
  }

  static generatePaymentCode(): string {
    return `PAY-${Date.now()}`;
  }

  static generateTransactionId(): string {
    return `TXN-${Date.now()}`;
  }

  static generateGroupCode(): string {
    return `GRP-${Date.now()}`;
  }
}
