/**
 * JobApplication model - Applications to job postings
 */

import { UUID, generateUUID } from "../utils";
import { ApplicationStatus } from "../enums";

export class JobApplication {
  readonly applicationId: UUID;
  jobPostingId: UUID;
  userId: UUID;
  resumeUrl: string;
  coverLetter: string;
  status: ApplicationStatus;
  rating: number;
  feedback: string;
  appliedAt: Date;
  updatedAt: Date;

  constructor(jobPostingId: UUID, userId: UUID, resumeUrl: string) {
    this.applicationId = generateUUID();
    this.jobPostingId = jobPostingId;
    this.userId = userId;
    this.resumeUrl = resumeUrl;
    this.coverLetter = "";
    this.status = ApplicationStatus.APPLIED;
    this.rating = 0;
    this.feedback = "";
    this.appliedAt = new Date();
    this.updatedAt = new Date();
  }

  public updateStatus(status: ApplicationStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public addRating(rating: number, feedback: string): void {
    if (rating >= 0 && rating <= 5) {
      this.rating = rating;
      this.feedback = feedback;
      this.updatedAt = new Date();
    }
  }

  public canWithdraw(): boolean {
    return this.status === ApplicationStatus.APPLIED;
  }
}
