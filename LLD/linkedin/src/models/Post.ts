/**
 * Post model - User's content/posts
 */

import { UUID, generateUUID } from "../utils";
import { PostType, PostVisibility } from "../enums";

export class Post {
  readonly postId: UUID;
  userId: UUID;
  content: string;
  postType: PostType;
  mediaUrl: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  visibility: PostVisibility;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    userId: UUID,
    content: string,
    postType: PostType = PostType.ARTICLE,
    visibility: PostVisibility = PostVisibility.PUBLIC
  ) {
    this.postId = generateUUID();
    this.userId = userId;
    this.content = content;
    this.postType = postType;
    this.mediaUrl = "";
    this.likeCount = 0;
    this.commentCount = 0;
    this.shareCount = 0;
    this.visibility = visibility;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public like(): void {
    this.likeCount++;
  }

  public unlike(): void {
    if (this.likeCount > 0) this.likeCount--;
  }

  public addComment(): void {
    this.commentCount++;
  }

  public removeComment(): void {
    if (this.commentCount > 0) this.commentCount--;
  }

  public share(): void {
    this.shareCount++;
  }

  public delete(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public updateContent(content: string): void {
    this.content = content;
    this.updatedAt = new Date();
  }
}
