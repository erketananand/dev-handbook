import { IdGenerator } from '../utils/IdGenerator';
import { ATMStatus } from '../enums';

export class ATM {
  public readonly id: string;
  public atmId: string;
  public location: string;
  public status: ATMStatus;
  public cashBalance: number;
  public maxCash: number;
  public cashInventory: Map<number, number>;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    atmId: string,
    location: string,
    maxCash: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.atmId = atmId;
    this.location = location;
    this.status = ATMStatus.OPERATIONAL;
    this.cashBalance = 0;
    this.maxCash = maxCash;
    this.cashInventory = new Map();
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Initialize denominations
    this.initializeDenominations();
  }

  private initializeDenominations(): void {
    const denominations = [2000, 500, 100];
    for (const denom of denominations) {
      this.cashInventory.set(denom, 0);
    }
  }

  public addDenomination(denomination: number, quantity: number): boolean {
    if (quantity <= 0) {
      return false;
    }

    const totalAmount = denomination * quantity;
    if (this.cashBalance + totalAmount > this.maxCash) {
      return false;
    }

    const current = this.cashInventory.get(denomination) || 0;
    this.cashInventory.set(denomination, current + quantity);
    this.cashBalance += totalAmount;
    this.updatedAt = new Date();
    return true;
  }

  public removeDenomination(denomination: number, quantity: number): boolean {
    const current = this.cashInventory.get(denomination);
    if (!current || current < quantity) {
      return false;
    }

    this.cashInventory.set(denomination, current - quantity);
    this.cashBalance -= denomination * quantity;
    this.updatedAt = new Date();
    return true;
  }

  public canDispense(amount: number): boolean {
    if (this.cashBalance < amount || this.status !== ATMStatus.OPERATIONAL) {
      return false;
    }

    // Check if we can make the amount with available denominations
    return this.canMakeAmount(amount);
  }

  private canMakeAmount(amount: number): boolean {
    // Greedy algorithm to check if amount can be dispensed
    let remaining = amount;
    const denominations = Array.from(this.cashInventory.keys()).sort((a, b) => b - a);

    for (const denom of denominations) {
      const available = this.cashInventory.get(denom) || 0;
      const needed = Math.min(Math.floor(remaining / denom), available);
      remaining -= needed * denom;
    }

    return remaining === 0;
  }

  public getCashBalance(): number {
    return this.cashBalance;
  }

  public isOperational(): boolean {
    return this.status === ATMStatus.OPERATIONAL;
  }

  public setMaintenance(): void {
    this.status = ATMStatus.MAINTENANCE;
    this.updatedAt = new Date();
  }

  public setOperational(): void {
    this.status = ATMStatus.OPERATIONAL;
    this.updatedAt = new Date();
  }

  public getDisplayInfo(): string {
    return `ATM ${this.atmId} at ${this.location} | Cash: ₹${this.cashBalance.toFixed(2)} | Status: ${
      this.status
    }`;
  }
}
