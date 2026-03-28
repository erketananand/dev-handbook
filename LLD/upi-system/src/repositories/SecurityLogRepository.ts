import { UUID, IRepository } from "../utils";
import { SecurityLog } from "../models";

export class SecurityLogRepository implements IRepository<SecurityLog> {
  private store = new Map<UUID, SecurityLog>();

  public async save(log: SecurityLog): Promise<SecurityLog> {
    this.store.set(log.logId, log);
    return log;
  }

  public async findById(id: UUID): Promise<SecurityLog | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<SecurityLog>): Promise<SecurityLog> {
    const log = this.store.get(id);
    if (!log) throw new Error("SecurityLog not found");
    Object.assign(log, data);
    return log;
  }

  public async findByUserId(userId: UUID): Promise<SecurityLog[]> {
    const logs: SecurityLog[] = [];
    for (const log of this.store.values()) {
      if (log.userId === userId) logs.push(log);
    }
    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async findRecentFailedLogins(userId: UUID, minutes: number = 30): Promise<SecurityLog[]> {
    const logs = await this.findByUserId(userId);
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return logs.filter((log) => log.event.includes("Login") && log.createdAt > cutoffTime);
  }
}
