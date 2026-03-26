import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { User } from "../models/User";
import { IdGenerator } from "../utils/IdGenerator";
import { ValidationUtil } from "../utils/ValidationUtil";

export class UserService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  register(name: string, email: string, phone: string): User {
    if (!ValidationUtil.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!ValidationUtil.isValidPhoneNumber(phone)) {
      throw new Error("Phone number must be 10 digits");
    }

    const existingUser = this.database.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const userId = IdGenerator.generateUUID();
    const user = new User(userId, name, email, phone);
    return this.database.userRepository.save(user);
  }

  getUserProfile(userId: string): User | null {
    return this.database.userRepository.findById(userId);
  }

  updateProfile(userId: string, name: string, phone: string): User {
    if (!ValidationUtil.isValidPhoneNumber(phone)) {
      throw new Error("Phone number must be 10 digits");
    }

    const user = this.database.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.name = name;
    user.phone = phone;
    return this.database.userRepository.update(user);
  }

  getAllUsers(): User[] {
    return this.database.userRepository.getAllUsers();
  }

  authenticate(email: string): User | null {
    return this.database.userRepository.findByEmail(email);
  }

  getUserBalance(userId: string): number {
    let balance = 0;

    // Get all expenses where user is payer (they paid for others)
    const userExpenses = this.database.expenseRepository.getUserExpenses(userId);
    for (const expense of userExpenses) {
      balance += expense.amount;
    }

    // Get all splits where user is participant (they owe share)
    const userSplits = this.database.expenseSplitRepository.getUserSplits(userId);
    for (const split of userSplits) {
      balance -= split.amount;
    }

    // Get all payments sent by user
    const userPayments = this.database.paymentRepository.getOutstandingPayments(userId);
    for (const payment of userPayments) {
      if (payment.fromUserId === userId) {
        balance += payment.amount;
      }
    }

    return Math.round(balance * 100) / 100;
  }
}
