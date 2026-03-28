import { UUID, Decimal, generateUUID } from "../utils";

/**
 * MerchantPayment - QR code for merchant payments
 */
export class MerchantPayment {
  readonly paymentId: UUID;
  readonly merchantId: UUID;
  qrCode: string;
  amount: Decimal | null;
  description: string;
  isActive: boolean;
  createdAt: Date;

  constructor(
    merchantId: UUID,
    qrCode: string,
    description: string,
    amount: Decimal | null = null
  ) {
    this.paymentId = generateUUID();
    this.merchantId = merchantId;
    this.qrCode = qrCode;
    this.amount = amount;
    this.description = description;
    this.isActive = true;
    this.createdAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public isStatic(): boolean {
    return this.amount !== null;
  }

  public isDynamic(): boolean {
    return this.amount === null;
  }
}
