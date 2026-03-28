import { UUID, IRepository } from "../utils";
import { Notification } from "../models";

export class NotificationRepository implements IRepository<Notification> {
  private store = new Map<UUID, Notification>();

  public async save(notification: Notification): Promise<Notification> {
    this.store.set(notification.notificationId, notification);
    return notification;
  }

  public async findById(id: UUID): Promise<Notification | null> {
    return this.store.get(id) || null;
  }

  public async delete(id: UUID): Promise<boolean> {
    return this.store.delete(id);
  }

  public async update(id: UUID, data: Partial<Notification>): Promise<Notification> {
    const notification = this.store.get(id);
    if (!notification) throw new Error("Notification not found");
    Object.assign(notification, data);
    return notification;
  }

  public async findByUserId(userId: UUID): Promise<Notification[]> {
    const notifications: Notification[] = [];
    for (const notif of this.store.values()) {
      if (notif.userId === userId) notifications.push(notif);
    }
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async findUnreadByUserId(userId: UUID): Promise<Notification[]> {
    const notifications = await this.findByUserId(userId);
    return notifications.filter((n) => !n.isRead);
  }
}
