/**
 * CompanyRepository - Data access layer for Company entities
 */

import { IRepository, UUID } from "../utils";
import { Company } from "../models";

export class CompanyRepository implements IRepository<Company> {
  private companies: Map<UUID, Company> = new Map();

  async save(company: Company): Promise<void> {
    this.companies.set(company.companyId, company);
  }

  async findById(id: UUID): Promise<Company | null> {
    return this.companies.get(id) || null;
  }

  async findAll(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async update(company: Company): Promise<void> {
    if (this.companies.has(company.companyId)) {
      this.companies.set(company.companyId, company);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.companies.delete(id);
  }

  async findByName(name: string): Promise<Company | null> {
    for (const company of this.companies.values()) {
      if (company.companyName.toLowerCase() === name.toLowerCase()) {
        return company;
      }
    }
    return null;
  }

  async findByIndustry(industry: string): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(
      c => c.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  async findVerifiedCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(c => c.isVerified);
  }

  async searchByLocation(location: string): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(c =>
      c.location.toLowerCase().includes(location.toLowerCase())
    );
  }
}
