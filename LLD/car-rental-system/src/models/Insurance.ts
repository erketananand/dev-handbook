import { IdGenerator } from '../utils/IdGenerator';
import { InsuranceType, InsuranceStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class Insurance {
  public readonly id: string;
  public reservationId: string;
  public insuranceType: InsuranceType;
  public premiumAmount: number;
  public coverageLimit: number;
  public deductible: number;
  public status: InsuranceStatus;
  public readonly createdAt: Date;

  constructor(
    reservationId: string,
    insuranceType: InsuranceType,
    rentalPrice: number,
    id?: string
  ) {
    this.id = id || IdGenerator.generateUUID();
    this.reservationId = reservationId;
    this.insuranceType = insuranceType;
    this.premiumAmount = ValidationUtil.getInsurancePremium(insuranceType, rentalPrice);
    this.coverageLimit = this.calculateCoverageLimit(insuranceType, rentalPrice);
    this.deductible = this.calculateDeductible(insuranceType);
    this.status = InsuranceStatus.ACTIVE;
    this.createdAt = new Date();
  }

  private calculateCoverageLimit(type: InsuranceType, rentalPrice: number): number {
    const multiplier: { [key in InsuranceType]: number } = {
      [InsuranceType.BASIC]: 50000,
      [InsuranceType.PREMIUM]: 100000,
      [InsuranceType.FULL_COVERAGE]: 200000
    };
    return multiplier[type] || 50000;
  }

  private calculateDeductible(type: InsuranceType): number {
    const deductibles: { [key in InsuranceType]: number } = {
      [InsuranceType.BASIC]: 5000,
      [InsuranceType.PREMIUM]: 2500,
      [InsuranceType.FULL_COVERAGE]: 1000
    };
    return deductibles[type] || 5000;
  }

  public activate(): void {
    this.status = InsuranceStatus.ACTIVE;
  }

  public claim(): void {
    if (this.status === InsuranceStatus.ACTIVE) {
      this.status = InsuranceStatus.CLAIMED;
    }
  }

  public expire(): void {
    this.status = InsuranceStatus.EXPIRED;
  }

  public getDisplayInfo(): string {
    return `${this.insuranceType} | Premium: ₹${this.premiumAmount.toFixed(2)} | Coverage: ₹${this.coverageLimit.toFixed(2)} | Deductible: ₹${this.deductible.toFixed(2)}`;
  }
}
