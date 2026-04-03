/**
 * AchievementPostStrategy - Concrete strategy for achievement posts
 */

import { PostStrategy } from "./PostStrategy";
import { Post } from "../../models";
import { PostVisibility } from "../../enums";

export class AchievementPostStrategy implements PostStrategy {
  validatePost(content: string): boolean {
    // Achievements need a clear description
    return content.trim().length >= 20;
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
    return `🏆 [ACHIEVEMENT] ${post.content}`;
  }
}
