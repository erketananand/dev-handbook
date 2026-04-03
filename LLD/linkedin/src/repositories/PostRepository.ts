/**
 * PostRepository - Data access layer for Post entities
 */

import { IRepository, UUID } from "../utils";
import { Post } from "../models";
import { PostType } from "../enums";

export class PostRepository implements IRepository<Post> {
  private posts: Map<UUID, Post> = new Map();

  async save(post: Post): Promise<void> {
    this.posts.set(post.postId, post);
  }

  async findById(id: UUID): Promise<Post | null> {
    return this.posts.get(id) || null;
  }

  async findAll(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async update(post: Post): Promise<void> {
    if (this.posts.has(post.postId)) {
      this.posts.set(post.postId, post);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.posts.delete(id);
  }

  async findByUserId(userId: UUID): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(p => p.userId === userId && p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByType(postType: PostType): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(p => p.postType === postType && p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findActivePosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
