/**
 * PostFactory - Factory for creating and validating Post instances
 */

import { Post } from "../../models";
import { PostType, PostVisibility } from "../../enums";
import { ValidationError, UUID } from "../../utils";
import { PostStrategy } from "../strategies";

export class PostFactory {
  /**
   * Create a post with strategy validation
   */
  static createPost(
    userId: UUID,
    content: string,
    postType: PostType,
    strategy: PostStrategy,
    visibility?: PostVisibility
  ): Post {
    // Validate using strategy
    if (!strategy.validatePost(content)) {
      throw new ValidationError(`Invalid content for ${postType} post type`);
    }

    const finalVisibility = visibility || (strategy.getDefaultVisibility() as PostVisibility);
    const post = new Post(userId, content, postType, finalVisibility);

    return post;
  }

  /**
   * Create an article post
   */
  static createArticlePost(userId: UUID, content: string, visibility?: PostVisibility): Post {
    if (content.trim().length < 100) {
      throw new ValidationError("Articles must have at least 100 characters");
    }
    return new Post(userId, content, PostType.ARTICLE, visibility || PostVisibility.PUBLIC);
  }

  /**
   * Create an achievement post
   */
  static createAchievementPost(userId: UUID, content: string, visibility?: PostVisibility): Post {
    if (content.trim().length < 20) {
      throw new ValidationError("Achievement description must have at least 20 characters");
    }
    return new Post(userId, content, PostType.ACHIEVEMENT, visibility || PostVisibility.PUBLIC);
  }

  /**
   * Create a research post
   */
  static createResearchPost(userId: UUID, content: string, visibility?: PostVisibility): Post {
    if (content.trim().length < 100) {
      throw new ValidationError("Research posts must have at least 100 characters");
    }
    return new Post(userId, content, PostType.RESEARCH, visibility || PostVisibility.PUBLIC);
  }

  /**
   * Create a job opening post
   */
  static createJobOpeningPost(userId: UUID, jobTitle: string, visibility?: PostVisibility): Post {
    if (jobTitle.trim().length < 10) {
      throw new ValidationError("Job title must have at least 10 characters");
    }
    return new Post(userId, `Job opening: ${jobTitle}`, PostType.JOB_OPENING, visibility || PostVisibility.PUBLIC);
  }
}
