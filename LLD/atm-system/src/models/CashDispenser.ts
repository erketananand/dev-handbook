import { ATM } from './ATM';

export class CashDispenser {
  private atm: ATM;

  constructor(atm: ATM) {
    this.atm = atm;
  }

  public dispenseCash(amount: number): boolean {
    if (!this.canDispense(amount)) {
      return false;
    }

    // Greedy algorithm to dispense cash with available denominations
    const denominations = Array.from(this.atm['cashInventory'].keys()).sort(
      (a, b) => b - a
    );
    let remaining = amount;

    for (const denom of denominations) {
      const available = this.atm['cashInventory'].get(denom) || 0;
      const toDispense = Math.min(Math.floor(remaining / denom), available);

      if (toDispense > 0) {
        this.atm.removeDenomination(denom, toDispense);
        remaining -= toDispense * denom;
      }
    }

    return remaining === 0;
  }

  public depositCash(amount: number): void {
    if (amount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    // For simplicity, deposit all as 100 denomination
    const noteCount = Math.floor(amount / 100);
    this.atm.addDenomination(100, noteCount);
  }

  public canDispense(amount: number): boolean {
    return this.atm.canDispense(amount);
  }

  public getCashBalance(): number {
    return this.atm.getCashBalance();
  }

  public getAtm(): ATM {
    return this.atm;
  }
}
