import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { Comment } from "../models/Comment";
import { IdGenerator } from "../utils/IdGenerator";

export class CommentService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  addComment(expenseId: string, userId: string, text: string): Comment {
    const expense = this.database.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const user = this.database.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Comment text cannot be empty");
    }

    const commentId = IdGenerator.generateUUID();
    const comment = new Comment(commentId, expenseId, userId, text);
    return this.database.commentRepository.save(comment);
  }

  getExpenseComments(expenseId: string): Comment[] {
    const expense = this.database.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    return this.database.commentRepository.getExpenseComments(expenseId);
  }

  deleteComment(commentId: string): void {
    const comment = this.database.commentRepository.findById(commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    this.database.commentRepository.delete(commentId);
  }

  getCommentDetails(commentId: string): Comment | null {
    return this.database.commentRepository.findById(commentId);
  }
}
