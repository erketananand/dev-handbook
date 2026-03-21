export class IdGenerator {
  private static counter = 0;

  static generateUUID(): string {
    this.counter++;
    return `${Date.now()}-${this.counter}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateId(prefix: string = 'ID'): string {
    this.counter++;
    return `${prefix}-${Date.now()}-${this.counter}`;
  }

  static generateBookingRef(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `AIR-${timestamp}${random}`;
  }

  static generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  static resetCounter(): void {
    this.counter = 0;
  }
}
