import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { User } from '../models/User';
import { UserRole } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';
import * as crypto from 'crypto';

export class UserService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public register(
    name: string,
    email: string,
    phone: string,
    password: string,
    address: string
  ): User | null {
    if (!ValidationUtil.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (this.db.userRepository.findByEmail(email)) {
      throw new Error('Email already registered');
    }

    if (!ValidationUtil.isValidPhone(phone)) {
      throw new Error('Invalid phone format');
    }

    if (this.db.userRepository.findByPhone(phone)) {
      throw new Error('Phone already registered');
    }

    if (!ValidationUtil.isValidPassword(password)) {
      throw new Error('Password must be 6-100 characters');
    }

    const passwordHash = this.hashPassword(password);
    const user = new User(name, email, phone, passwordHash, address, UserRole.USER);

    if (!user.isValid()) {
      throw new Error('User validation failed');
    }

    this.db.userRepository.save(user);
    return user;
  }

  public authenticate(email: string, password: string): User | null {
    const user = this.db.userRepository.findByEmail(email);
    if (!user) return null;

    const passwordHash = this.hashPassword(password);
    if (user.passwordHash !== passwordHash) return null;

    return user;
  }

  public getUserById(userId: string): User | null {
    return this.db.userRepository.findById(userId);
  }

  public getUserByEmail(email: string): User | null {
    return this.db.userRepository.findByEmail(email);
  }

  public getAllUsers(): User[] {
    return this.db.userRepository.getAllUsers();
  }

  public updateUser(
    userId: string,
    updates: Partial<{ name: string; phone: string; address: string }>
  ): User | null {
    const user = this.db.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.name) user.name = updates.name;
    if (updates.phone) user.phone = updates.phone;
    if (updates.address) user.address = updates.address;

    this.db.userRepository.update(user);
    return user;
  }

  public deleteUser(userId: string): boolean {
    return this.db.userRepository.delete(userId);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
