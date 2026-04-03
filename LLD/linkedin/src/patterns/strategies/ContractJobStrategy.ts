/**
 * ContractJobStrategy - Concrete strategy for contract jobs
 */

import { JobStrategy } from "./JobStrategy";

export class ContractJobStrategy implements JobStrategy {
  validateJobPosting(title: string, description: string): boolean {
    return title.trim().length >= 10 && description.trim().length >= 50;
  }

  getDefaultDuration(): number {
    return 6; // Default 6-month contract
  }

  requiresBenefits(): boolean {
    return false;
  }

  getPostingDuration(): number {
    return 30; // Contract jobs posted for 30 days
  }

  getPriority(): number {
    return 2; // Medium priority
  }
}
