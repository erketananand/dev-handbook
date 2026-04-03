/**
 * UserFactory - Factory for creating and validating User instances
 */

import { User } from "../../models";
import { AccountType } from "../../enums";
import { ValidationError } from "../../utils";

export class UserFactory {
  /**
   * Create a new standard user
   */
  static createStandardUser(email: string, firstName: string, lastName: string): User {
    this.validateUserInput(email, firstName, lastName);
    const user = new User(email, firstName, lastName, AccountType.STANDARD);
    return user;
  }

  /**
   * Create a recruiter account
   */
  static createRecruiterUser(email: string, firstName: string, lastName: string, company: string): User {
    this.validateUserInput(email, firstName, lastName);
    if (!company.trim()) {
      throw new ValidationError("Company name is required for recruiter accounts");
    }
    const user = new User(email, firstName, lastName, AccountType.RECRUITER);
    user.headline = `Recruiter at ${company}`;
    return user;
  }

  /**
   * Create an admin account
   */
  static createAdminUser(email: string, firstName: string, lastName: string): User {
    this.validateUserInput(email, firstName, lastName);
    const user = new User(email, firstName, lastName, AccountType.ADMIN);
    return user;
  }

  /**
   * Validate user input
   */
  private static validateUserInput(email: string, firstName: string, lastName: string): void {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      throw new ValidationError("Email, first name, and last name are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }
  }

  /**
   * Clone a user with modifications
   */
  static cloneUser(user: User, updates?: Partial<User>): User {
    const cloned = new User(user.email, user.firstName, user.lastName, user.accountType);
    cloned.headline = user.headline;
    cloned.summary = user.summary;
    cloned.location = user.location;
    cloned.industry = user.industry;

    if (updates) {
      Object.assign(cloned, updates);
    }

    return cloned;
  }
}
