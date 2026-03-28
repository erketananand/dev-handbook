import { UUID, Decimal, generateUUID, ValidationError } from "../utils";

/**
 * Wallet - Manages balance and transaction limits
 */
export class Wallet {
  readonly walletId: UUID;
  readonly userId: UUID;
  balance: Decimal;
  dailyLimit: Decimal;
  monthlyLimit: Decimal;
  dailySpent: Decimal;
  monthlySpent: Decimal;
  lastUpdated: Date;

  constructor(userId: UUID) {
    this.walletId = generateUUID();
    this.userId = userId;
    this.balance = 0;
    this.dailyLimit = 100000; // ₹1,00,000
    this.monthlyLimit = 1000000; // ₹10,00,000
    this.dailySpent = 0;
    this.monthlySpent = 0;
    this.lastUpdated = new Date();
  }

  public getBalance(): Decimal {
    return this.balance;
  }

  public canTransaction(amount: Decimal): boolean {
    if (amount <= 0) return false;
    if (this.balance < amount) return false;
    if (this.dailySpent + amount > this.dailyLimit) return false;
    if (this.monthlySpent + amount > this.monthlyLimit) return false;
    return true;
  }

  public addBalance(amount: Decimal): void {
    if (amount <= 0) throw new ValidationError("Amount must be positive");
    this.balance += amount;
    this.lastUpdated = new Date();
  }

  public deductBalance(amount: Decimal): void {
    if (!this.canTransaction(amount)) {
      throw new ValidationError("Insufficient balance or limit exceeded");
    }
    this.balance -= amount;
    this.dailySpent += amount;
    this.monthlySpent += amount;
    this.lastUpdated = new Date();
  }

  public getDailyLimitRemaining(): Decimal {
    return Math.max(0, this.dailyLimit - this.dailySpent);
  }

  public getMonthlyLimitRemaining(): Decimal {
    return Math.max(0, this.monthlyLimit - this.monthlySpent);
  }

  public resetDailySpent(): void {
    this.dailySpent = 0;
  }

  public resetMonthlySpent(): void {
    this.monthlySpent = 0;
  }

  public setLimits(daily: Decimal, monthly: Decimal): void {
    if (daily <= 0 || monthly <= 0) throw new ValidationError("Limits must be positive");
    this.dailyLimit = daily;
    this.monthlyLimit = monthly;
  }
}
