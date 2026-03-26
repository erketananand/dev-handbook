export class Comment {
  commentId: string;
  expenseId: string;
  userId: string;
  text: string;
  createdAt: Date;

  constructor(
    commentId: string,
    expenseId: string,
    userId: string,
    text: string,
    createdAt: Date = new Date()
  ) {
    this.commentId = commentId;
    this.expenseId = expenseId;
    this.userId = userId;
    this.text = text;
    this.createdAt = createdAt;
  }

  getCommentDetails() {
    return {
      commentId: this.commentId,
      expenseId: this.expenseId,
      userId: this.userId,
      text: this.text,
      createdAt: this.createdAt,
    };
  }
}
