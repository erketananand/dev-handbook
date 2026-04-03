/**
 * Company model - Organization profiles
 */

import { UUID, generateUUID } from "../utils";

export class Company {
  readonly companyId: UUID;
  companyName: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  logo: string;
  totalEmployees: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(companyName: string, industry: string, location: string) {
    this.companyId = generateUUID();
    this.companyName = companyName;
    this.industry = industry;
    this.location = location;
    this.website = "";
    this.description = "";
    this.logo = "";
    this.totalEmployees = 0;
    this.isVerified = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateInfo(website?: string, description?: string, totalEmployees?: number): void {
    if (website) this.website = website;
    if (description) this.description = description;
    if (totalEmployees) this.totalEmployees = totalEmployees;
    this.updatedAt = new Date();
  }

  public verify(): void {
    this.isVerified = true;
    this.updatedAt = new Date();
  }

  public addLogo(logoUrl: string): void {
    this.logo = logoUrl;
    this.updatedAt = new Date();
  }
}
