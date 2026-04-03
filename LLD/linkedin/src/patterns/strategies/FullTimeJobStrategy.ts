/**
 * FullTimeJobStrategy - Concrete strategy for full-time jobs
 */

import { JobStrategy } from "./JobStrategy";

export class FullTimeJobStrategy implements JobStrategy {
  validateJobPosting(title: string, description: string): boolean {
    return title.trim().length >= 10 && description.trim().length >= 50;
  }

  getDefaultDuration(): number {
    return 0; // No fixed duration for full-time
  }

  requiresBenefits(): boolean {
    return true;
  }

  getPostingDuration(): number {
    return 60; // Full-time jobs posted for 60 days
  }

  getPriority(): number {
    return 1; // Highest priority
  }
}
