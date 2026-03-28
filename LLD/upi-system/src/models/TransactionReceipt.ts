import { UUID, generateUUID } from "../utils";

/**
 * TransactionReceipt - Proof of payment
 */
export class TransactionReceipt {
  readonly receiptId: UUID;
  readonly transactionId: UUID;
  receiptData: Record<string, any>;
  createdAt: Date;

  constructor(transactionId: UUID, receiptData: Record<string, any>) {
    this.receiptId = generateUUID();
    this.transactionId = transactionId;
    this.receiptData = receiptData;
    this.createdAt = new Date();
  }

  public getReceiptDetails(): Record<string, any> {
    return this.receiptData;
  }

  public generatePDFPath(): string {
    return `receipts/${this.receiptId}.pdf`;
  }
}
