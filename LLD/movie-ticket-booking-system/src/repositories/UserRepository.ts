import { User } from '../models/User';

export class UserRepository {
  private users: Map<string, User> = new Map();

  public save(user: User): void {
    this.users.set(user.id, user);
  }

  public findById(id: string): User | null {
    return this.users.get(id) || null;
  }

  public findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  public findByPhone(phone: string): User | null {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public update(user: User): void {
    if (this.users.has(user.id)) {
      user.updatedAt = new Date();
      this.users.set(user.id, user);
    }
  }

  public delete(userId: string): boolean {
    return this.users.delete(userId);
  }

  public clear(): void {
    this.users.clear();
  }

  public getCount(): number {
    return this.users.size;
  }
}
