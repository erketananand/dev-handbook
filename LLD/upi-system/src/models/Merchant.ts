import { UUID, Decimal, generateUUID, ValidationError } from "../utils";

/**
 * Merchant - Business account for receiving payments
 */
export class Merchant {
  readonly merchantId: UUID;
  merchantName: string;
  merchantUpiId: string;
  readonly ownerUserId: UUID;
  category: string;
  commissionRate: Decimal;
  totalReceived: Decimal;
  transactionCount: number;
  isActive: boolean;
  createdAt: Date;

  constructor(
    merchantName: string,
    merchantUpiId: string,
    ownerUserId: UUID,
    category: string,
    commissionRate: Decimal = 2 // 2% default
  ) {
    this.merchantId = generateUUID();
    this.merchantName = merchantName;
    this.merchantUpiId = merchantUpiId;
    this.ownerUserId = ownerUserId;
    this.category = category;
    this.commissionRate = commissionRate;
    this.totalReceived = 0;
    this.transactionCount = 0;
    this.isActive = true;
    this.createdAt = new Date();
  }

  public receivePayment(amount: Decimal): void {
    if (amount <= 0) throw new ValidationError("Amount must be positive");
    this.totalReceived += amount;
    this.transactionCount += 1;
  }

  public getCommissionAmount(amount: Decimal): Decimal {
    return (amount * this.commissionRate) / 100;
  }

  public getSettlementAmount(amount: Decimal): Decimal {
    return amount - this.getCommissionAmount(amount);
  }

  public updateCommissionRate(rate: Decimal): void {
    if (rate < 0 || rate > 100) {
      throw new ValidationError("Commission rate must be between 0-100%");
    }
    this.commissionRate = rate;
  }

  public deactivate(): void {
    this.isActive = false;
  }
}
