import * as crypto from 'crypto';

export class IdGenerator {
  public static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public static generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BKG-${timestamp}-${random}`;
  }

  public static generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `TXN${timestamp}${random}`;
  }

  public static generateScreenCode(theaterName: string, screenNumber: number): string {
    const theaterCode = theaterName.substring(0, 3).toUpperCase();
    return `${theaterCode}-S${screenNumber}`;
  }
}
