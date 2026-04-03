/**
 * JobPostingRepository - Data access layer for JobPosting entities
 */

import { IRepository, UUID } from "../utils";
import { JobPosting } from "../models";
import { JobType } from "../enums";

export class JobPostingRepository implements IRepository<JobPosting> {
  private postings: Map<UUID, JobPosting> = new Map();

  async save(posting: JobPosting): Promise<void> {
    this.postings.set(posting.jobPostingId, posting);
  }

  async findById(id: UUID): Promise<JobPosting | null> {
    return this.postings.get(id) || null;
  }

  async findAll(): Promise<JobPosting[]> {
    return Array.from(this.postings.values());
  }

  async update(posting: JobPosting): Promise<void> {
    if (this.postings.has(posting.jobPostingId)) {
      this.postings.set(posting.jobPostingId, posting);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.postings.delete(id);
  }

  async findByRecruiterId(recruiterId: UUID): Promise<JobPosting[]> {
    return Array.from(this.postings.values())
      .filter(p => p.recruiterId === recruiterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByCompanyId(companyId: UUID): Promise<JobPosting[]> {
    return Array.from(this.postings.values())
      .filter(p => p.companyId === companyId && p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByJobType(jobType: JobType): Promise<JobPosting[]> {
    return Array.from(this.postings.values())
      .filter(p => p.jobType === jobType && p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findActivePostings(): Promise<JobPosting[]> {
    return Array.from(this.postings.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async searchByLocation(location: string): Promise<JobPosting[]> {
    return Array.from(this.postings.values()).filter(
      p => p.location.toLowerCase().includes(location.toLowerCase()) && p.isActive
    );
  }
}
