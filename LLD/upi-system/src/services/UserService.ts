import { UUID, ValidationError } from "../utils";
import { EventStatus } from "../enums";
import { User, BankAccount, SecurityLog } from "../models";
import {
  UserRepository,
  BankAccountRepository,
  SecurityLogRepository,
} from "../repositories";
import { WalletService } from "./WalletService";

/**
 * UserService - Manages user accounts and profiles
 */
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private bankAccountRepository: BankAccountRepository,
    private walletService: WalletService,
    private securityLogRepository: SecurityLogRepository
  ) {}

  public async registerUser(
    name: string,
    email: string,
    phone: string,
    upiId: string
  ): Promise<User> {
    // Check uniqueness
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new ValidationError("Email already registered");

    const existingPhone = await this.userRepository.findByPhone(phone);
    if (existingPhone) throw new ValidationError("Phone already registered");

    const existingUPI = await this.userRepository.findByUPI(upiId);
    if (existingUPI) throw new ValidationError("UPI ID already registered");

    // Create user
    const user = new User(name, email, phone, upiId);
    const savedUser = await this.userRepository.save(user);

    // Create wallet
    await this.walletService.createWallet(savedUser.userId);

    return savedUser;
  }

  public async getUserByUPI(upiId: string): Promise<User | null> {
    return this.userRepository.findByUPI(upiId);
  }

  public async getUserByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  public async getUserById(userId: UUID): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  public async updateUser(userId: UUID, name: string, email: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.updateProfile(name, email);
    return this.userRepository.save(user);
  }

  public async verifyKYC(userId: UUID): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    user.verifyKYC();
    return this.userRepository.save(user);
  }

  public async addBankAccount(
    userId: UUID,
    accountNumber: string,
    ifscCode: string,
    bankName: string,
    accountHolder: string
  ): Promise<BankAccount> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const bankAccount = new BankAccount(
      userId,
      accountNumber,
      ifscCode,
      bankName,
      accountHolder
    );
    return this.bankAccountRepository.save(bankAccount);
  }

  public async getBankAccounts(userId: UUID): Promise<BankAccount[]> {
    return this.bankAccountRepository.findByUserId(userId);
  }

  public async logSecurityEvent(
    userId: UUID,
    event: string,
    deviceInfo: string,
    ipAddress: string,
    status: EventStatus
  ): Promise<void> {
    const log = new SecurityLog(userId, event, deviceInfo, ipAddress, status);
    await this.securityLogRepository.save(log);
  }
}
