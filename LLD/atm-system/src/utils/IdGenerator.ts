import * as crypto from 'crypto';

export class IdGenerator {
  public static generateUUID(): string {
    return crypto.randomUUID();
  }

  public static generateCardNumber(): string {
    const prefix = '4532'; // Visa prefix
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return prefix + random;
  }

  public static generateAccountNumber(): string {
    return 'ACC' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  }

  public static generateAtmId(): string {
    return 'ATM' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }
}
