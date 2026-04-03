/**
 * JobPosting model - Job openings by recruiters
 */

import { UUID, generateUUID } from "../utils";
import { JobType } from "../enums";

export class JobPosting {
  readonly jobPostingId: UUID;
  recruiterId: UUID;
  companyId: UUID;
  jobTitle: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  applicationCount: number;
  isActive: boolean;
  createdAt: Date;
  closedAt: Date | null;

  constructor(
    recruiterId: UUID,
    companyId: UUID,
    jobTitle: string,
    description: string,
    location: string,
    jobType: JobType
  ) {
    this.jobPostingId = generateUUID();
    this.recruiterId = recruiterId;
    this.companyId = companyId;
    this.jobTitle = jobTitle;
    this.description = description;
    this.requirements = "";
    this.location = location;
    this.jobType = jobType;
    this.salaryMin = 0;
    this.salaryMax = 0;
    this.currency = "USD";
    this.applicationCount = 0;
    this.isActive = true;
    this.createdAt = new Date();
    this.closedAt = null;
  }

  public close(): void {
    this.isActive = false;
    this.closedAt = new Date();
  }

  public incrementApplicationCount(): void {
    this.applicationCount++;
  }

  public setSalaryRange(min: number, max: number): void {
    this.salaryMin = min;
    this.salaryMax = max;
  }
}
