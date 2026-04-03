/**
 * MessageRepository - Data access layer for Message entities
 */

import { IRepository, UUID } from "../utils";
import { Message } from "../models";

export class MessageRepository implements IRepository<Message> {
  private messages: Map<UUID, Message> = new Map();

  async save(message: Message): Promise<void> {
    this.messages.set(message.messageId, message);
  }

  async findById(id: UUID): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async findAll(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async update(message: Message): Promise<void> {
    if (this.messages.has(message.messageId)) {
      this.messages.set(message.messageId, message);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.messages.delete(id);
  }

  async findConversation(userId: UUID, otherUserId: UUID): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        m =>
          (m.senderId === userId && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === userId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findReceivedMessages(userId: UUID): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findUnreadMessages(userId: UUID): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.receiverId === userId && !m.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
