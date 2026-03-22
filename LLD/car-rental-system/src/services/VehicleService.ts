import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Car } from '../models/Car';
import { VehicleMaintenance } from '../models/VehicleMaintenance';
import { CarType, FuelType, CarStatus, MaintenanceType, MaintenanceStatus } from '../enums';
import { IdGenerator } from '../utils/IdGenerator';

export class VehicleService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public addCar(
    licensePlate: string,
    brand: string,
    model: string,
    year: number,
    carType: CarType,
    fuelType: FuelType,
    seatCapacity: number,
    color: string,
    basePrice: number
  ): Car {
    const existingCar = this.db.carRepository.findByLicensePlate(licensePlate);
    if (existingCar) {
      throw new Error('Car with this license plate already exists');
    }

    const car = new Car(
      licensePlate,
      brand,
      model,
      year,
      carType,
      fuelType,
      seatCapacity,
      color,
      basePrice
    );

    if (!car.isValid()) {
      throw new Error('Car data validation failed');
    }

    this.db.carRepository.save(car);
    return car;
  }

  public getCarById(carId: string): Car | null {
    return this.db.carRepository.findById(carId);
  }

  public getAvailableCars(): Car[] {
    return this.db.carRepository.getAvailableCars();
  }

  public getAvailableCarsByType(carType: CarType): Car[] {
    return this.getAvailableCars().filter(car => car.carType === carType);
  }

  public getAvailableCarsByPrice(minPrice: number, maxPrice: number): Car[] {
    return this.db.carRepository.getAvailableCarsInPriceRange(minPrice, maxPrice);
  }

  public getAllCars(): Car[] {
    return this.db.carRepository.getAllCars();
  }

  public getFleetStatus(): string {
    const cars = this.getAllCars();
    const available = this.getAvailableCars();
    const booked = this.db.carRepository.getCarsByStatus(CarStatus.BOOKED);
    const maintenance = this.db.carRepository.getCarsByStatus(CarStatus.MAINTENANCE);

    return `Fleet Status: Total=${cars.length}, Available=${available.length}, Booked=${booked.length}, Maintenance=${maintenance.length}`;
  }

  public scheduleMaintenance(
    carId: string,
    maintenanceType: MaintenanceType,
    description: string,
    cost: number
  ): VehicleMaintenance {
    const car = this.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const maintenance = new VehicleMaintenance(carId, maintenanceType, description, cost);
    this.db.saveMaintenance(maintenance);

    if (car.status !== CarStatus.MAINTENANCE) {
      car.markForMaintenance();
      this.db.carRepository.update(car);
    }

    return maintenance;
  }

  public completeMaintenance(maintenanceId: string): VehicleMaintenance | null {
    const maintenance = this.db.findMaintenanceById(maintenanceId);
    if (!maintenance) {
      throw new Error('Maintenance record not found');
    }

    maintenance.complete();
    this.db.updateMaintenance(maintenance);

    // Check if all maintenance completed for the car
    const carMaintenanceRecords = this.db.getMaintenanceByCarId(maintenance.carId);
    const hasActiveMaintenanceNeeded = carMaintenanceRecords.some(m => m.status !== MaintenanceStatus.COMPLETED);

    if (!hasActiveMaintenanceNeeded) {
      const car = this.getCarById(maintenance.carId);
      if (car) {
        car.markAsAvailable();
        this.db.carRepository.update(car);
      }
    }

    return maintenance;
  }

  public getMaintenanceHistory(carId: string): VehicleMaintenance[] {
    return this.db.getMaintenanceByCarId(carId);
  }

  public updateCarMileage(carId: string, distance: number): Car | null {
    const car = this.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    car.updateMileage(distance);
    this.db.carRepository.update(car);
    return car;
  }

  public retieCar(carId: string): Car | null {
    const car = this.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    car.retire();
    this.db.carRepository.update(car);
    return car;
  }

  public deleteCar(carId: string): boolean {
    return this.db.carRepository.delete(carId);
  }
}
