/**
 * User model - Core entity representing LinkedIn user
 */

import { UUID, generateUUID } from "../utils";
import { AccountType } from "../enums";

export class User {
  readonly userId: UUID;
  email: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  profilePicture: string;
  location: string;
  industry: string;
  accountType: AccountType;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    accountType: AccountType = AccountType.STANDARD
  ) {
    this.userId = generateUUID();
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.headline = "";
    this.summary = "";
    this.profilePicture = "";
    this.location = "";
    this.industry = "";
    this.accountType = accountType;
    this.isVerified = false;
    this.isActive = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public updateProfile(
    firstName?: string,
    lastName?: string,
    headline?: string,
    summary?: string,
    location?: string,
    industry?: string
  ): void {
    if (firstName) this.firstName = firstName;
    if (lastName) this.lastName = lastName;
    if (headline) this.headline = headline;
    if (summary) this.summary = summary;
    if (location) this.location = location;
    if (industry) this.industry = industry;
    this.updatedAt = new Date();
  }

  public verify(): void {
    this.isVerified = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
