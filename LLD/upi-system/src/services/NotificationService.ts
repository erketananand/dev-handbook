import { UUID } from "../utils";
import { Notification } from "../models";
import { NotificationType } from "../enums";
import { NotificationRepository } from "../repositories";

/**
 * NotificationService - Sends alerts and notifications
 */
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  public async sendNotification(
    userId: UUID,
    type: NotificationType,
    title: string,
    message: string,
    transactionId: UUID | null = null
  ): Promise<Notification> {
    const notification = new Notification(userId, type, title, message, transactionId);
    return this.notificationRepository.save(notification);
  }

  public async getNotifications(userId: UUID): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  public async getUnreadNotifications(userId: UUID): Promise<Notification[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  public async markAsRead(notificationId: UUID): Promise<Notification> {
    const notif = await this.notificationRepository.findById(notificationId);
    if (!notif) throw new Error("Notification not found");
    notif.markAsRead();
    return this.notificationRepository.save(notif);
  }

  public async deleteNotification(notificationId: UUID): Promise<boolean> {
    return this.notificationRepository.delete(notificationId);
  }
}
