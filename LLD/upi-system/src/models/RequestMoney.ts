import { UUID, Decimal, generateUUID, ValidationError } from "../utils";
import { RequestStatus } from "../enums";

/**
 * RequestMoney - Money request from another user
 */
export class RequestMoney {
  readonly requestId: UUID;
  readonly fromUserId: UUID;
  readonly toUserId: UUID;
  amount: Decimal;
  description: string | null;
  status: RequestStatus;
  createdAt: Date;
  expiresAt: Date;
  paidAt: Date | null;
  transactionId: UUID | null;

  constructor(
    fromUserId: UUID,
    toUserId: UUID,
    amount: Decimal,
    expirationDays: number = 7,
    description: string | null = null
  ) {
    if (amount <= 0) throw new ValidationError("Amount must be positive");
    if (expirationDays <= 0) throw new ValidationError("Expiration days must be positive");

    this.requestId = generateUUID();
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.amount = amount;
    this.description = description;
    this.status = RequestStatus.PENDING;
    this.createdAt = new Date();
    this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    this.paidAt = null;
    this.transactionId = null;
  }

  public approve(transactionId: UUID): void {
    if (this.isExpired()) {
      throw new ValidationError("Request has expired");
    }
    this.status = RequestStatus.PAID;
    this.paidAt = new Date();
    this.transactionId = transactionId;
  }

  public cancel(): void {
    this.status = RequestStatus.CANCELLED;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isPending(): boolean {
    return this.status === RequestStatus.PENDING;
  }
}
