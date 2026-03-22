import * as crypto from 'crypto';

export class IdGenerator {
  public static generateUUID(): string {
    return crypto.randomUUID();
  }

  public static generateLicensePlate(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let plate = '';
    for (let i = 0; i < 10; i++) {
      plate += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return plate;
  }

  public static generateReservationNumber(): string {
    return 'RES' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  public static generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }
}
