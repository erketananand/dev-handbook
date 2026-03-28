import { UUID, IRepository } from "../utils";
import { MerchantPayment } from "../models";

export class MerchantPaymentRepository implements IRepository<MerchantPayment> {
  private store = new Map<UUID, MerchantPayment>();

  public async save(payment: MerchantPayment): Promise<MerchantPayment> {
    this.store.set(payment.paymentId, payment);
    return payment;
  }

  public async findById(id: UUID): Promise<MerchantPayment | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<MerchantPayment>): Promise<MerchantPayment> {
    const payment = this.store.get(id);
    if (!payment) throw new Error("MerchantPayment not found");
    Object.assign(payment, data);
    return payment;
  }

  public async findByQRCode(qrCode: string): Promise<MerchantPayment | null> {
    for (const payment of this.store.values()) {
      if (payment.qrCode === qrCode) return payment;
    }
    return null;
  }

  public async findByMerchantId(merchantId: UUID): Promise<MerchantPayment[]> {
    const payments: MerchantPayment[] = [];
    for (const payment of this.store.values()) {
      if (payment.merchantId === merchantId) payments.push(payment);
    }
    return payments;
  }
}
