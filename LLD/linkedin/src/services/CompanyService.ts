/**
 * CompanyService - Business logic for company management
 */

import { CompanyRepository } from "../repositories";
import { Company } from "../models";
import { UUID, NotFoundError, ValidationError } from "../utils";

export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  /**
   * Register a new company
   */
  async registerCompany(
    companyName: string,
    industry: string,
    location: string,
    website?: string,
    description?: string
  ): Promise<Company> {
    if (!companyName.trim() || !industry.trim()) {
      throw new ValidationError("Company name and industry cannot be empty");
    }

    const existingCompany = await this.companyRepository.findByName(companyName);
    if (existingCompany) {
      throw new ValidationError("Company already registered");
    }

    const company = new Company(companyName, industry, location);
    if (website) company.website = website;
    if (description) company.description = description;

    await this.companyRepository.save(company);
    return company;
  }

  /**
   * Get company by ID
   */
  async getCompany(companyId: UUID): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
    return company;
  }

  /**
   * Update company information
   */
  async updateCompanyInfo(
    companyId: UUID,
    website?: string,
    description?: string,
    totalEmployees?: number
  ): Promise<Company> {
    const company = await this.getCompany(companyId);
    company.updateInfo(website, description, totalEmployees);
    await this.companyRepository.update(company);
    return company;
  }

  /**
   * Verify company
   */
  async verifyCompany(companyId: UUID): Promise<Company> {
    const company = await this.getCompany(companyId);
    company.verify();
    await this.companyRepository.update(company);
    return company;
  }

  /**
   * Search companies by name
   */
  async searchCompanies(query: string): Promise<Company[]> {
    const allCompanies = await this.companyRepository.findAll();
    const lowerQuery = query.toLowerCase();

    return allCompanies.filter(
      company =>
        company.companyName.toLowerCase().includes(lowerQuery) ||
        company.industry.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get companies by industry
   */
  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    return this.companyRepository.findByIndustry(industry);
  }

  /**
   * Get verified companies
   */
  async getVerifiedCompanies(): Promise<Company[]> {
    return this.companyRepository.findVerifiedCompanies();
  }

  /**
   * Search companies by location
   */
  async searchCompaniesByLocation(location: string): Promise<Company[]> {
    return this.companyRepository.searchByLocation(location);
  }
}
