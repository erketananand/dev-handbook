/**
 * MessageService - Business logic for direct messaging
 */

import { MessageRepository } from "../repositories";
import { Message } from "../models";
import { UUID, NotFoundError, ValidationError } from "../utils";

export class MessageService {
  constructor(private messageRepository: MessageRepository) {}

  /**
   * Send a message
   */
  async sendMessage(senderId: UUID, receiverId: UUID, content: string, mediaUrl: string = ""): Promise<Message> {
    if (!content.trim() && !mediaUrl) {
      throw new ValidationError("Message cannot be empty");
    }

    if (senderId === receiverId) {
      throw new ValidationError("Cannot send message to yourself");
    }

    const message = new Message(senderId, receiverId, content);
    if (mediaUrl) {
      message.addMedia(mediaUrl);
    }

    await this.messageRepository.save(message);
    return message;
  }

  /**
   * Get a message by ID
   */
  async getMessage(messageId: UUID): Promise<Message> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError(`Message with ID ${messageId} not found`);
    }
    return message;
  }

  /**
   * Get conversation between two users
   */
  async getConversation(userId: UUID, otherUserId: UUID): Promise<Message[]> {
    return this.messageRepository.findConversation(userId, otherUserId);
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: UUID, userId: UUID): Promise<Message> {
    const message = await this.getMessage(messageId);

    if (message.receiverId !== userId) {
      throw new ValidationError("You can only mark your own messages as read");
    }

    message.markAsRead();
    await this.messageRepository.update(message);
    return message;
  }

  /**
   * Get received messages
   */
  async getReceivedMessages(userId: UUID): Promise<Message[]> {
    return this.messageRepository.findReceivedMessages(userId);
  }

  /**
   * Get unread messages
   */
  async getUnreadMessages(userId: UUID): Promise<Message[]> {
    return this.messageRepository.findUnreadMessages(userId);
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(userId: UUID, otherUserId: UUID): Promise<void> {
    const messages = await this.getConversation(userId, otherUserId);

    for (const message of messages) {
      if (message.receiverId === userId && !message.isRead) {
        message.markAsRead();
        await this.messageRepository.update(message);
      }
    }
  }
}
