import { IdGenerator } from '../utils/IdGenerator';
import { CarType, FuelType, CarStatus } from '../enums';

export class Car {
  public readonly id: string;
  public licensePlate: string;
  public brand: string;
  public model: string;
  public year: number;
  public carType: CarType;
  public fuelType: FuelType;
  public seatCapacity: number;
  public color: string;
  public basePrice: number; // per day
  public mileage: number;
  public status: CarStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    licensePlate: string,
    brand: string,
    model: string,
    year: number,
    carType: CarType,
    fuelType: FuelType,
    seatCapacity: number,
    color: string,
    basePrice: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.licensePlate = licensePlate;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.carType = carType;
    this.fuelType = fuelType;
    this.seatCapacity = seatCapacity;
    this.color = color;
    this.basePrice = basePrice;
    this.mileage = 0;
    this.status = CarStatus.AVAILABLE;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public isAvailable(): boolean {
    return this.status === CarStatus.AVAILABLE;
  }

  public markAsBooked(): void {
    this.status = CarStatus.BOOKED;
    this.updatedAt = new Date();
  }

  public markAsAvailable(): void {
    this.status = CarStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  public markForMaintenance(): void {
    this.status = CarStatus.MAINTENANCE;
    this.updatedAt = new Date();
  }

  public retire(): void {
    this.status = CarStatus.RETIRED;
    this.updatedAt = new Date();
  }

  public updateMileage(distance: number): void {
    if (distance > 0) {
      this.mileage += distance;
      this.updatedAt = new Date();
    }
  }

  public isValid(): boolean {
    return (
      this.licensePlate.length > 0 &&
      this.brand.length > 0 &&
      this.model.length > 0 &&
      this.year >= 2000 &&
      this.seatCapacity >= 1 &&
      this.basePrice > 0
    );
  }

  public getDisplayInfo(): string {
    return `${this.brand} ${this.model} (${this.year}) | ${this.licensePlate} | ₹${this.basePrice}/day | ${this.status}`;
  }
}
