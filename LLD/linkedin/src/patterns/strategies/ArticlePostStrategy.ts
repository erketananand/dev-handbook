/**
 * ArticlePostStrategy - Concrete strategy for article posts
 */

import { PostStrategy } from "./PostStrategy";
import { Post } from "../../models";
import { PostVisibility } from "../../enums";

export class ArticlePostStrategy implements PostStrategy {
  validatePost(content: string): boolean {
    // Articles should have substantial content
    return content.trim().length >= 100;
  }

  getDefaultVisibility(): string {
    return PostVisibility.PUBLIC;
  }

  allowsComments(): boolean {
    return true;
  }

  allowsShares(): boolean {
    return true;
  }

  getDisplayFormat(post: Post): string {
    return `📰 [ARTICLE] ${post.content.substring(0, 50)}...`;
  }
}
