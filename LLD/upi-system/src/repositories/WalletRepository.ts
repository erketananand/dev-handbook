import { UUID, IRepository } from "../utils";
import { Wallet } from "../models";

export class WalletRepository implements IRepository<Wallet> {
  private store = new Map<UUID, Wallet>();

  public async save(wallet: Wallet): Promise<Wallet> {
    this.store.set(wallet.walletId, wallet);
    return wallet;
  }

  public async findById(id: UUID): Promise<Wallet | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.store.get(id);
    if (!wallet) throw new Error("Wallet not found");
    Object.assign(wallet, data);
    return wallet;
  }

  public async findByUserId(userId: UUID): Promise<Wallet | null> {
    for (const wallet of this.store.values()) {
      if (wallet.userId === userId) return wallet;
    }
    return null;
  }
}
