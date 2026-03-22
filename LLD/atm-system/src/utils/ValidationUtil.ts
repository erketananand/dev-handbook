export class ValidationUtil {
  public static isValidPin(pin: string): boolean {
    // PIN must be 4-6 digits
    return /^\d{4,6}$/.test(pin);
  }

  public static isValidAmount(amount: number): boolean {
    return amount > 0 && amount % 100 === 0; // Amount must be multiple of 100
  }

  public static isValidWithdrawalAmount(amount: number, balance: number): boolean {
    return this.isValidAmount(amount) && amount <= balance;
  }

  public static isValidAccountNumber(accountNumber: string): boolean {
    return accountNumber.startsWith('ACC') && accountNumber.length === 13;
  }

  public static isValidCardNumber(cardNumber: string): boolean {
    // Basic Luhn algorithm check (simplified)
    return /^\d{16}$/.test(cardNumber);
  }

  public static isValidBalance(balance: number): boolean {
    return balance >= 0;
  }

  public static getWithdrawalLimitPerDay(): number {
    return 100000; // Max withdrawal per day
  }

  public static getMaxWithdrawalPerTransaction(): number {
    return 20000; // Max withdrawal per transaction
  }

  public static getMaxDepositPerTransaction(): number {
    return 100000;
  }
}
