import { UUID, generateUUID } from "../utils";
import { NotificationType } from "../enums";

/**
 * Notification - Sends alerts to users
 */
export class Notification {
  readonly notificationId: UUID;
  readonly userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  transactionId: UUID | null;
  isRead: boolean;
  createdAt: Date;

  constructor(
    userId: UUID,
    type: NotificationType,
    title: string,
    message: string,
    transactionId: UUID | null = null
  ) {
    this.notificationId = generateUUID();
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.transactionId = transactionId;
    this.isRead = false;
    this.createdAt = new Date();
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public getContent(): string {
    return `${this.title}: ${this.message}`;
  }
}
