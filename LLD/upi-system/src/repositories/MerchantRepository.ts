import { UUID, IRepository } from "../utils";
import { Merchant } from "../models";

export class MerchantRepository implements IRepository<Merchant> {
  private store = new Map<UUID, Merchant>();

  public async save(merchant: Merchant): Promise<Merchant> {
    this.store.set(merchant.merchantId, merchant);
    return merchant;
  }

  public async findById(id: UUID): Promise<Merchant | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<Merchant>): Promise<Merchant> {
    const merchant = this.store.get(id);
    if (!merchant) throw new Error("Merchant not found");
    Object.assign(merchant, data);
    return merchant;
  }

  public async findByUPI(upiId: string): Promise<Merchant | null> {
    for (const merchant of this.store.values()) {
      if (merchant.merchantUpiId === upiId) return merchant;
    }
    return null;
  }

  public async findByOwnerUserId(userId: UUID): Promise<Merchant[]> {
    const merchants: Merchant[] = [];
    for (const merchant of this.store.values()) {
      if (merchant.ownerUserId === userId) merchants.push(merchant);
    }
    return merchants;
  }
}
