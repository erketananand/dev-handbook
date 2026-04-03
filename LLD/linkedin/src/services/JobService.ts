/**
 * JobService - Business logic for job postings and applications
 */

import { JobPostingRepository, JobApplicationRepository } from "../repositories";
import { JobPosting, JobApplication } from "../models";
import { UUID, NotFoundError, ValidationError } from "../utils";
import { JobType, ApplicationStatus } from "../enums";

export class JobService {
  constructor(
    private jobPostingRepository: JobPostingRepository,
    private jobApplicationRepository: JobApplicationRepository
  ) {}

  /**
   * Post a new job
   */
  async postJob(
    recruiterId: UUID,
    companyId: UUID,
    jobTitle: string,
    description: string,
    jobType: JobType,
    location: string,
    minSalary: number,
    maxSalary: number
  ): Promise<JobPosting> {
    if (!jobTitle.trim() || !description.trim()) {
      throw new ValidationError("Job title and description cannot be empty");
    }

    if (minSalary < 0 || maxSalary < 0 || minSalary > maxSalary) {
      throw new ValidationError("Invalid salary range");
    }

    const job = new JobPosting(recruiterId, companyId, jobTitle, description, location, jobType);
    job.setSalaryRange(minSalary, maxSalary);
    await this.jobPostingRepository.save(job);
    return job;
  }

  /**
   * Get job posting by ID
   */
  async getJobPosting(jobId: UUID): Promise<JobPosting> {
    const job = await this.jobPostingRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job posting with ID ${jobId} not found`);
    }
    return job;
  }

  /**
   * Apply for a job
   */
  async applyForJob(jobId: UUID, userId: UUID, resumeUrl: string, coverLetter?: string): Promise<JobApplication> {
    const job = await this.getJobPosting(jobId);

    if (!job.isActive) {
      throw new ValidationError("This job posting is no longer active");
    }

    const existingApplication = await this.jobApplicationRepository.findByUserAndJob(userId, jobId);
    if (existingApplication) {
      throw new ValidationError("You have already applied for this job");
    }

    const application = new JobApplication(jobId, userId, resumeUrl);
    if (coverLetter) {
      application.coverLetter = coverLetter;
    }

    await this.jobApplicationRepository.save(application);
    job.incrementApplicationCount();
    await this.jobPostingRepository.update(job);

    return application;
  }

  /**
   * Get applications for a job
   */
  async getJobApplications(jobId: UUID): Promise<JobApplication[]> {
    return this.jobApplicationRepository.findByJobPostingId(jobId);
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(applicationId: UUID, status: ApplicationStatus): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError(`Application with ID ${applicationId} not found`);
    }

    application.updateStatus(status);
    await this.jobApplicationRepository.update(application);
    return application;
  }

  /**
   * Get user's applications
   */
  async getUserApplications(userId: UUID): Promise<JobApplication[]> {
    return this.jobApplicationRepository.findByUserId(userId);
  }

  /**
   * Close a job posting
   */
  async closeJobPosting(jobId: UUID, recruiterId: UUID): Promise<JobPosting> {
    const job = await this.getJobPosting(jobId);

    if (job.recruiterId !== recruiterId) {
      throw new ValidationError("Only the recruiter can close this job posting");
    }

    job.close();
    await this.jobPostingRepository.update(job);
    return job;
  }

  /**
   * Search jobs by location
   */
  async searchJobsByLocation(location: string): Promise<JobPosting[]> {
    return this.jobPostingRepository.searchByLocation(location);
  }

  /**
   * Get jobs by type
   */
  async getJobsByType(jobType: JobType): Promise<JobPosting[]> {
    return this.jobPostingRepository.findByJobType(jobType);
  }

  /**
   * Get active job postings
   */
  async getActiveJobs(): Promise<JobPosting[]> {
    return this.jobPostingRepository.findActivePostings();
  }
}
