/**
 * PostCommentRepository - Data access layer for PostComment entities
 */

import { IRepository, UUID } from "../utils";
import { PostComment } from "../models";

export class PostCommentRepository implements IRepository<PostComment> {
  private comments: Map<UUID, PostComment> = new Map();

  async save(comment: PostComment): Promise<void> {
    this.comments.set(comment.commentId, comment);
  }

  async findById(id: UUID): Promise<PostComment | null> {
    return this.comments.get(id) || null;
  }

  async findAll(): Promise<PostComment[]> {
    return Array.from(this.comments.values());
  }

  async update(comment: PostComment): Promise<void> {
    if (this.comments.has(comment.commentId)) {
      this.comments.set(comment.commentId, comment);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.comments.delete(id);
  }

  async findByPostId(postId: UUID): Promise<PostComment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByUserId(userId: UUID): Promise<PostComment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
