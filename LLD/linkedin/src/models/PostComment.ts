/**
 * PostComment model - Comments on posts
 */

import { UUID, generateUUID } from "../utils";

export class PostComment {
  readonly commentId: UUID;
  postId: UUID;
  userId: UUID;
  content: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(postId: UUID, userId: UUID, content: string) {
    this.commentId = generateUUID();
    this.postId = postId;
    this.userId = userId;
    this.content = content;
    this.likeCount = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public like(): void {
    this.likeCount++;
  }

  public unlike(): void {
    if (this.likeCount > 0) this.likeCount--;
  }

  public updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }
}
