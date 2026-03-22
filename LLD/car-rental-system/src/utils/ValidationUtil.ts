export class ValidationUtil {
  public static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  public static isValidPhone(phone: string): boolean {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
  }

  public static isValidDriverLicense(license: string): boolean {
    return license.length >= 10;
  }

  public static isValidNumberPlate(plate: string): boolean {
    return plate.length >= 6 && plate.length <= 20;
  }

  public static isValidPrice(price: number): boolean {
    return price > 0;
  }

  public static isValidSeatCapacity(seats: number): boolean {
    return seats >= 1 && seats <= 15;
  }

  public static isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
  }

  public static isLicenseExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  public static isDateInPast(date: Date): boolean {
    return new Date() > date;
  }

  public static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate < endDate;
  }

  public static calculateRentalDays(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  public static getMaxRefundPercentage(cancellationHours: number): number {
    if (cancellationHours > 24) return 100;
    if (cancellationHours > 12) return 75;
    if (cancellationHours > 6) return 50;
    return 25;
  }

  public static getInsurancePremium(insuranceType: string, rentalPrice: number): number {
    const premiumPercentage: { [key: string]: number } = {
      BASIC: 0.05, // 5%
      PREMIUM: 0.10, // 10%
      FULL_COVERAGE: 0.15 // 15%
    };
    return rentalPrice * (premiumPercentage[insuranceType] || 0.05);
  }
}
