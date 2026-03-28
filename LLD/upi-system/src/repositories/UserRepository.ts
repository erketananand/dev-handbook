import { UUID, IRepository } from "../utils";
import { User } from "../models";

export class UserRepository implements IRepository<User> {
  private store = new Map<UUID, User>();

  public async save(user: User): Promise<User> {
    this.store.set(user.userId, user);
    return user;
  }

  public async findById(id: UUID): Promise<User | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<User>): Promise<User> {
    const user = this.store.get(id);
    if (!user) throw new Error("User not found");
    Object.assign(user, data);
    return user;
  }

  public async findByUPI(upiId: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.upiId === upiId) return user;
    }
    return null;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.phone === phone) return user;
    }
    return null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
}
