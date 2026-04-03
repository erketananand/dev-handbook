/**
 * PostStrategy - Strategy interface for different post type behaviors
 */

import { Post } from "../../models";

export interface PostStrategy {
  /**
   * Validate post creation
   */
  validatePost(content: string): boolean;

  /**
   * Get default visibility for this post type
   */
  getDefaultVisibility(): string;

  /**
   * Check if this post type allows comments
   */
  allowsComments(): boolean;

  /**
   * Check if this post type allows shares
   */
  allowsShares(): boolean;

  /**
   * Get display format for this post type
   */
  getDisplayFormat(post: Post): string;
}
