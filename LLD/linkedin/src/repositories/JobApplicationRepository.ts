/**
 * JobApplicationRepository - Data access layer for JobApplication entities
 */

import { IRepository, UUID } from "../utils";
import { JobApplication } from "../models";
import { ApplicationStatus } from "../enums";

export class JobApplicationRepository implements IRepository<JobApplication> {
  private applications: Map<UUID, JobApplication> = new Map();

  async save(application: JobApplication): Promise<void> {
    this.applications.set(application.applicationId, application);
  }

  async findById(id: UUID): Promise<JobApplication | null> {
    return this.applications.get(id) || null;
  }

  async findAll(): Promise<JobApplication[]> {
    return Array.from(this.applications.values());
  }

  async update(application: JobApplication): Promise<void> {
    if (this.applications.has(application.applicationId)) {
      this.applications.set(application.applicationId, application);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.applications.delete(id);
  }

  async findByJobPostingId(jobPostingId: UUID): Promise<JobApplication[]> {
    return Array.from(this.applications.values())
      .filter(a => a.jobPostingId === jobPostingId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async findByUserId(userId: UUID): Promise<JobApplication[]> {
    return Array.from(this.applications.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async findByStatus(status: ApplicationStatus): Promise<JobApplication[]> {
    return Array.from(this.applications.values())
      .filter(a => a.status === status)
      .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
  }

  async findByUserAndJob(userId: UUID, jobPostingId: UUID): Promise<JobApplication | null> {
    for (const app of this.applications.values()) {
      if (app.userId === userId && app.jobPostingId === jobPostingId) {
        return app;
      }
    }
    return null;
  }
}
