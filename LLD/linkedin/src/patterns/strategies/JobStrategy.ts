/**
 * JobStrategy - Strategy interface for different job type behaviors
 */

export interface JobStrategy {
  /**
   * Validate job posting
   */
  validateJobPosting(title: string, description: string): boolean;

  /**
   * Get default contract duration in months
   */
  getDefaultDuration(): number;

  /**
   * Check if this job type requires benefits
   */
  requiresBenefits(): boolean;

  /**
   * Get typical posting duration in days
   */
  getPostingDuration(): number;

  /**
   * Get priority level for this job type
   */
  getPriority(): number;
}
