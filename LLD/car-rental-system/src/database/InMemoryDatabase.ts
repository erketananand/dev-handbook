import { CustomerRepository } from '../repositories/CustomerRepository';
import { CarRepository } from '../repositories/CarRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { VehicleMaintenance } from '../models/VehicleMaintenance';
import { RentalLocation } from '../models/RentalLocation';
import { Insurance } from '../models/Insurance';

export class InMemoryDatabase {
  private static instance: InMemoryDatabase | null = null;

  public readonly customerRepository: CustomerRepository;
  public readonly carRepository: CarRepository;
  public readonly reservationRepository: ReservationRepository;
  public readonly paymentRepository: PaymentRepository;

  private maintenanceRecords: Map<string, VehicleMaintenance> = new Map();
  private rentalLocations: Map<string, RentalLocation> = new Map();
  private insurancePolicies: Map<string, Insurance> = new Map();

  private constructor() {
    this.customerRepository = new CustomerRepository();
    this.carRepository = new CarRepository();
    this.reservationRepository = new ReservationRepository();
    this.paymentRepository = new PaymentRepository();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  // Maintenance Methods
  public saveMaintenance(maintenance: VehicleMaintenance): void {
    this.maintenanceRecords.set(maintenance.id, maintenance);
  }

  public findMaintenanceById(id: string): VehicleMaintenance | null {
    return this.maintenanceRecords.get(id) || null;
  }

  public getMaintenanceByCarId(carId: string): VehicleMaintenance[] {
    return Array.from(this.maintenanceRecords.values()).filter(m => m.carId === carId);
  }

  public getAllMaintenance(): VehicleMaintenance[] {
    return Array.from(this.maintenanceRecords.values());
  }

  public updateMaintenance(maintenance: VehicleMaintenance): void {
    if (this.maintenanceRecords.has(maintenance.id)) {
      this.maintenanceRecords.set(maintenance.id, maintenance);
    }
  }

  public deleteMaintenance(id: string): boolean {
    return this.maintenanceRecords.delete(id);
  }

  // Rental Location Methods
  public saveLocation(location: RentalLocation): void {
    this.rentalLocations.set(location.id, location);
  }

  public findLocationById(id: string): RentalLocation | null {
    return this.rentalLocations.get(id) || null;
  }

  public findLocationByName(name: string): RentalLocation | null {
    for (const location of this.rentalLocations.values()) {
      if (location.name === name) {
        return location;
      }
    }
    return null;
  }

  public getLocationsByCity(city: string): RentalLocation[] {
    return Array.from(this.rentalLocations.values()).filter(l => l.city === city);
  }

  public getAllLocations(): RentalLocation[] {
    return Array.from(this.rentalLocations.values());
  }

  public updateLocation(location: RentalLocation): void {
    if (this.rentalLocations.has(location.id)) {
      this.rentalLocations.set(location.id, location);
    }
  }

  public deleteLocation(id: string): boolean {
    return this.rentalLocations.delete(id);
  }

  // Insurance Methods
  public saveInsurance(insurance: Insurance): void {
    this.insurancePolicies.set(insurance.id, insurance);
  }

  public findInsuranceById(id: string): Insurance | null {
    return this.insurancePolicies.get(id) || null;
  }

  public findInsuranceByReservation(reservationId: string): Insurance | null {
    for (const insurance of this.insurancePolicies.values()) {
      if (insurance.reservationId === reservationId) {
        return insurance;
      }
    }
    return null;
  }

  public getAllInsurance(): Insurance[] {
    return Array.from(this.insurancePolicies.values());
  }

  public updateInsurance(insurance: Insurance): void {
    if (this.insurancePolicies.has(insurance.id)) {
      this.insurancePolicies.set(insurance.id, insurance);
    }
  }

  public deleteInsurance(id: string): boolean {
    return this.insurancePolicies.delete(id);
  }

  // System Methods
  public clearAll(): void {
    this.customerRepository.clear();
    this.carRepository.clear();
    this.reservationRepository.clear();
    this.paymentRepository.clear();
    this.maintenanceRecords.clear();
    this.rentalLocations.clear();
    this.insurancePolicies.clear();
  }

  public getSystemStatus(): string {
    return `
=== Car Rental System Status ===
Customers: ${this.customerRepository.getAllCustomers().length}
Cars: ${this.carRepository.getAllCars().length}
Total Reservations: ${this.reservationRepository.getAllReservations().length}
Locations: ${this.rentalLocations.size}
Maintenance Records: ${this.maintenanceRecords.size}
Insurance Policies: ${this.insurancePolicies.size}
Total Revenue: ₹${this.paymentRepository.getTotalRevenue().toFixed(2)}
===================================
    `.trim();
  }
}
