import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Customer } from '../models/Customer';
import { ValidationUtil } from '../utils/ValidationUtil';

export class CustomerService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public register(
    name: string,
    email: string,
    phone: string,
    driverLicense: string,
    licenseExpiry: Date,
    address: string
  ): Customer | null {
    if (!ValidationUtil.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (this.db.customerRepository.findByEmail(email)) {
      throw new Error('Customer with this email already exists');
    }

    if (!ValidationUtil.isValidPhone(phone)) {
      throw new Error('Invalid phone format');
    }

    if (!ValidationUtil.isValidDriverLicense(driverLicense)) {
      throw new Error('Invalid driver license format');
    }

    if (ValidationUtil.isLicenseExpired(licenseExpiry)) {
      throw new Error('Driver license is expired');
    }

    const customer = new Customer(
      name,
      email,
      phone,
      driverLicense,
      licenseExpiry,
      address
    );

    if (!customer.isValid()) {
      throw new Error('Customer data validation failed');
    }

    this.db.customerRepository.save(customer);
    return customer;
  }

  public getCustomerById(customerId: string): Customer | null {
    return this.db.customerRepository.findById(customerId);
  }

  public getCustomerByEmail(email: string): Customer | null {
    return this.db.customerRepository.findByEmail(email);
  }

  public getAllCustomers(): Customer[] {
    return this.db.customerRepository.getAllCustomers();
  }

  public getValidCustomers(): Customer[] {
    return this.db.customerRepository.getValidCustomers();
  }

  public updateCustomer(
    customerId: string,
    updates: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
    }>
  ): Customer | null {
    const customer = this.db.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (updates.email && updates.email !== customer.email) {
      if (!ValidationUtil.isValidEmail(updates.email)) {
        throw new Error('Invalid email format');
      }
      if (this.db.customerRepository.findByEmail(updates.email)) {
        throw new Error('Email already in use');
      }
      customer.email = updates.email;
    }

    if (updates.phone && updates.phone !== customer.phone) {
      if (!ValidationUtil.isValidPhone(updates.phone)) {
        throw new Error('Invalid phone format');
      }
      customer.phone = updates.phone;
    }

    if (updates.name) customer.name = updates.name;
    if (updates.address) customer.address = updates.address;

    this.db.customerRepository.update(customer);
    return customer;
  }

  public deleteCustomer(customerId: string): boolean {
    return this.db.customerRepository.delete(customerId);
  }

  public canRent(customerId: string): boolean {
    const customer = this.getCustomerById(customerId);
    if (!customer) return false;
    return customer.isValid() && customer.isLicenseValid();
  }
}
