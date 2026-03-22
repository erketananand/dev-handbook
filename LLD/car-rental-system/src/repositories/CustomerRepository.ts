import { Customer } from '../models/Customer';

export class CustomerRepository {
  private customers: Map<string, Customer> = new Map();

  public save(customer: Customer): void {
    this.customers.set(customer.id, customer);
  }

  public findById(id: string): Customer | null {
    return this.customers.get(id) || null;
  }

  public findByEmail(email: string): Customer | null {
    for (const customer of this.customers.values()) {
      if (customer.email === email) {
        return customer;
      }
    }
    return null;
  }

  public findByPhone(phone: string): Customer | null {
    for (const customer of this.customers.values()) {
      if (customer.phone === phone) {
        return customer;
      }
    }
    return null;
  }

  public findByLicense(driverLicense: string): Customer | null {
    for (const customer of this.customers.values()) {
      if (customer.driverLicense === driverLicense) {
        return customer;
      }
    }
    return null;
  }

  public getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  public getValidCustomers(): Customer[] {
    return Array.from(this.customers.values()).filter(c => c.isValid() && c.isLicenseValid());
  }

  public update(customer: Customer): void {
    if (this.customers.has(customer.id)) {
      customer.updatedAt = new Date();
      this.customers.set(customer.id, customer);
    }
  }

  public delete(customerId: string): boolean {
    return this.customers.delete(customerId);
  }

  public clear(): void {
    this.customers.clear();
  }
}
