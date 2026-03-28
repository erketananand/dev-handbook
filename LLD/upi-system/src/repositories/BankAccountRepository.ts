import { UUID, IRepository } from "../utils";
import { BankAccount } from "../models";

export class BankAccountRepository implements IRepository<BankAccount> {
  private store = new Map<UUID, BankAccount>();

  public async save(account: BankAccount): Promise<BankAccount> {
    this.store.set(account.accountId, account);
    return account;
  }

  public async findById(id: UUID): Promise<BankAccount | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<BankAccount>): Promise<BankAccount> {
    const account = this.store.get(id);
    if (!account) throw new Error("BankAccount not found");
    Object.assign(account, data);
    return account;
  }

  public async findByUserId(userId: UUID): Promise<BankAccount[]> {
    const accounts: BankAccount[] = [];
    for (const account of this.store.values()) {
      if (account.userId === userId) accounts.push(account);
    }
    return accounts;
  }

  public async findByAccountNumber(accountNumber: string): Promise<BankAccount | null> {
    for (const account of this.store.values()) {
      if (account.accountNumber === accountNumber) return account;
    }
    return null;
  }
}
