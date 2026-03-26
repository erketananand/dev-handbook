import { User } from "../models/User";

export class UserRepository {
  private users: Map<string, User> = new Map();

  save(user: User): User {
    this.users.set(user.userId, user);
    return user;
  }

  findById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  update(user: User): User {
    this.users.set(user.userId, user);
    return user;
  }

  delete(userId: string): void {
    this.users.delete(userId);
  }
}
