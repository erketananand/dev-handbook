import { Comment } from "../models/Comment";

export class CommentRepository {
  private comments: Map<string, Comment> = new Map();

  save(comment: Comment): Comment {
    this.comments.set(comment.commentId, comment);
    return comment;
  }

  findById(commentId: string): Comment | null {
    return this.comments.get(commentId) || null;
  }

  getExpenseComments(expenseId: string): Comment[] {
    return Array.from(this.comments.values())
      .filter((comment) => comment.expenseId === expenseId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  update(comment: Comment): Comment {
    this.comments.set(comment.commentId, comment);
    return comment;
  }

  delete(commentId: string): void {
    this.comments.delete(commentId);
  }
}
