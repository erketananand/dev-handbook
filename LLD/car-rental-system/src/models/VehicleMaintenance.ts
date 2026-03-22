import { IdGenerator } from '../utils/IdGenerator';
import { MaintenanceType, MaintenanceStatus } from '../enums';

export class VehicleMaintenance {
  public readonly id: string;
  public carId: string;
  public maintenanceType: MaintenanceType;
  public description: string;
  public cost: number;
  public startDate: Date;
  public endDate: Date | null;
  public status: MaintenanceStatus;

  constructor(
    carId: string,
    maintenanceType: MaintenanceType,
    description: string,
    cost: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.carId = carId;
    this.maintenanceType = maintenanceType;
    this.description = description;
    this.cost = cost;
    this.startDate = new Date();
    this.endDate = null;
    this.status = MaintenanceStatus.SCHEDULED;
  }

  public start(): void {
    if (this.status === MaintenanceStatus.SCHEDULED) {
      this.startDate = new Date();
      this.status = MaintenanceStatus.IN_PROGRESS;
    }
  }

  public complete(): void {
    if (this.status === MaintenanceStatus.IN_PROGRESS) {
      this.endDate = new Date();
      this.status = MaintenanceStatus.COMPLETED;
    }
  }

  public getDuration(): number | null {
    if (this.endDate) {
      return (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60); // minutes
    }
    return null;
  }

  public getDisplayInfo(): string {
    return `${this.maintenanceType} | ₹${this.cost.toFixed(2)} | ${this.status}`;
  }
}
