import { IRepository } from './IRepository';
import { Payment } from '../models/Payment';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { PaymentStatus } from '../enums/PaymentStatus';

export class PaymentRepository implements IRepository<Payment> {
  private db = InMemoryDatabase.getInstance();

  findById(id: string): Payment | undefined {
    return this.db.payments.get(id);
  }

  findAll(): Payment[] {
    return Array.from(this.db.payments.values());
  }

  save(payment: Payment): Payment {
    this.db.addPayment(payment);
    return payment;
  }

  update(payment: Payment): Payment {
    this.db.payments.set(payment.id, payment);
    return payment;
  }

  delete(id: string): boolean {
    return this.db.payments.delete(id);
  }

  exists(id: string): boolean {
    return this.db.payments.has(id);
  }

  count(): number {
    return this.db.payments.size;
  }

  clear(): void {
    this.db.payments.clear();
  }

  findByBookingId(bookingId: string): Payment | undefined {
    return this.findAll().find(p => p.bookingId === bookingId);
  }

  findByStatus(status: PaymentStatus): Payment[] {
    return this.findAll().filter(p => p.getStatus() === status);
  }
}
