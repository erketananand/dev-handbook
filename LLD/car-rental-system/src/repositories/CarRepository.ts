import { Car } from '../models/Car';
import { CarStatus } from '../enums';

export class CarRepository {
  private cars: Map<string, Car> = new Map();

  public save(car: Car): void {
    this.cars.set(car.id, car);
  }

  public findById(id: string): Car | null {
    return this.cars.get(id) || null;
  }

  public findByLicensePlate(licensePlate: string): Car | null {
    for (const car of this.cars.values()) {
      if (car.licensePlate === licensePlate) {
        return car;
      }
    }
    return null;
  }

  public getAllCars(): Car[] {
    return Array.from(this.cars.values());
  }

  public getAvailableCars(): Car[] {
    return Array.from(this.cars.values()).filter(c => c.isAvailable());
  }

  public getCarsByStatus(status: CarStatus): Car[] {
    return Array.from(this.cars.values()).filter(c => c.status === status);
  }

  public getCarsByType(carType: string): Car[] {
    return Array.from(this.cars.values()).filter(c => c.carType === carType);
  }

  public getAvailableCarsInPriceRange(minPrice: number, maxPrice: number): Car[] {
    return Array.from(this.cars.values()).filter(
      c => c.isAvailable() && c.basePrice >= minPrice && c.basePrice <= maxPrice
    );
  }

  public update(car: Car): void {
    if (this.cars.has(car.id)) {
      car.updatedAt = new Date();
      this.cars.set(car.id, car);
    }
  }

  public delete(carId: string): boolean {
    return this.cars.delete(carId);
  }

  public clear(): void {
    this.cars.clear();
  }

  public getCount(): number {
    return this.cars.size;
  }

  public getAvailableCount(): number {
    return this.getAvailableCars().length;
  }
}
