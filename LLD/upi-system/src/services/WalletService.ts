import { UUID, Decimal, InsufficientBalanceError } from "../utils";
import { Wallet } from "../models";
import { WalletRepository } from "../repositories";

/**
 * WalletService - Manages user balance and transaction limits
 */
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  public async getWallet(userId: UUID): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) throw new Error("Wallet not found for user");
    return wallet;
  }

  public async createWallet(userId: UUID): Promise<Wallet> {
    const wallet = new Wallet(userId);
    return this.walletRepository.save(wallet);
  }

  public async addBalance(userId: UUID, amount: Decimal): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    wallet.addBalance(amount);
    return this.walletRepository.save(wallet);
  }

  public async deductBalance(userId: UUID, amount: Decimal): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    wallet.deductBalance(amount);
    return this.walletRepository.save(wallet);
  }

  public async validateTransaction(userId: UUID, amount: Decimal): Promise<void> {
    const wallet = await this.getWallet(userId);
    if (!wallet.canTransaction(amount)) {
      throw new InsufficientBalanceError("Insufficient balance or transaction limit exceeded");
    }
  }

  public async updateLimits(userId: UUID, daily: Decimal, monthly: Decimal): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    wallet.setLimits(daily, monthly);
    return this.walletRepository.save(wallet);
  }

  public async resetDailyLimits(): Promise<void> {
    // Called by scheduler at midnight for all wallets
    // Implementation would iterate over all wallets and call resetDailySpent()
  }
}
