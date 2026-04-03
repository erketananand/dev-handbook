/**
 * UserRepository - Data access layer for User entities
 */

import { IRepository, UUID } from "../utils";
import { User } from "../models";

export class UserRepository implements IRepository<User> {
  private users: Map<UUID, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.userId, user);
  }

  async findById(id: UUID): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async update(user: User): Promise<void> {
    if (this.users.has(user.userId)) {
      this.users.set(user.userId, user);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.users.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.isActive);
  }
}
