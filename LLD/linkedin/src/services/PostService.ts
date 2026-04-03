/**
 * PostService - Business logic for social posts
 */

import { PostRepository, PostCommentRepository } from "../repositories";
import { Post, PostComment } from "../models";
import { UUID, NotFoundError, ValidationError } from "../utils";
import { PostType, PostVisibility } from "../enums";

export class PostService {
  constructor(private postRepository: PostRepository, private commentRepository: PostCommentRepository) {}

  /**
   * Create a new post
   */
  async createPost(
    userId: UUID,
    content: string,
    postType: PostType,
    visibility: PostVisibility = PostVisibility.PUBLIC
  ): Promise<Post> {
    if (!content.trim()) {
      throw new ValidationError("Post content cannot be empty");
    }

    const post = new Post(userId, content, postType, visibility);
    await this.postRepository.save(post);
    return post;
  }

  /**
   * Get post by ID
   */
  async getPost(postId: UUID): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError(`Post with ID ${postId} not found`);
    }
    return post;
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: UUID): Promise<Post[]> {
    return this.postRepository.findByUserId(userId);
  }

  /**
   * Like a post
   */
  async likePost(postId: UUID): Promise<void> {
    const post = await this.getPost(postId);
    post.like();
    await this.postRepository.update(post);
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: UUID): Promise<void> {
    const post = await this.getPost(postId);
    post.unlike();
    await this.postRepository.update(post);
  }

  /**
   * Add comment to post
   */
  async addComment(postId: UUID, userId: UUID, comment: string): Promise<PostComment> {
    if (!comment.trim()) {
      throw new ValidationError("Comment cannot be empty");
    }

    const post = await this.getPost(postId);
    const postComment = new PostComment(postId, userId, comment);
    
    await this.commentRepository.save(postComment);
    post.addComment();
    await this.postRepository.update(post);

    return postComment;
  }

  /**
   * Get post comments
   */
  async getPostComments(postId: UUID): Promise<PostComment[]> {
    return this.commentRepository.findByPostId(postId);
  }

  /**
   * Delete post
   */
  async deletePost(postId: UUID, userId: UUID): Promise<void> {
    const post = await this.getPost(postId);

    if (post.userId !== userId) {
      throw new ValidationError("You can only delete your own posts");
    }

    // Set inactive instead of deleting
    post.isActive = false;
    await this.postRepository.update(post);
  }

  /**
   * Get posts by type
   */
  async getPostsByType(postType: PostType): Promise<Post[]> {
    return this.postRepository.findByType(postType);
  }

  /**
   * Get feed (active posts)
   */
  async getFeed(): Promise<Post[]> {
    return this.postRepository.findActivePosts();
  }
}
