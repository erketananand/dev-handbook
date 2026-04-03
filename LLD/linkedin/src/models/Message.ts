/**
 * Message model - Direct messages between users
 */

import { UUID, generateUUID } from "../utils";

export class Message {
  readonly messageId: UUID;
  senderId: UUID;
  receiverId: UUID;
  content: string;
  mediaUrl: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;

  constructor(senderId: UUID, receiverId: UUID, content: string) {
    this.messageId = generateUUID();
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.mediaUrl = "";
    this.isRead = false;
    this.readAt = null;
    this.createdAt = new Date();
  }

  public markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }

  public addMedia(mediaUrl: string): void {
    this.mediaUrl = mediaUrl;
  }
}
