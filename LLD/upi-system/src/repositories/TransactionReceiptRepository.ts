import { UUID, IRepository } from "../utils";
import { TransactionReceipt } from "../models";

export class TransactionReceiptRepository implements IRepository<TransactionReceipt> {
  private store = new Map<UUID, TransactionReceipt>();

  public async save(receipt: TransactionReceipt): Promise<TransactionReceipt> {
    this.store.set(receipt.receiptId, receipt);
    return receipt;
  }

  public async findById(id: UUID): Promise<TransactionReceipt | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<TransactionReceipt>): Promise<TransactionReceipt> {
    const receipt = this.store.get(id);
    if (!receipt) throw new Error("TransactionReceipt not found");
    Object.assign(receipt, data);
    return receipt;
  }

  public async findByTransactionId(transactionId: UUID): Promise<TransactionReceipt | null> {
    for (const receipt of this.store.values()) {
      if (receipt.transactionId === transactionId) return receipt;
    }
    return null;
  }
}
