export class ValidationUtil {
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  public static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  public static isValidPassword(password: string): boolean {
    return password.length >= 6 && password.length <= 100;
  }

  public static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate < endDate && startDate >= new Date();
  }

  public static isValidShowTime(showTime: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(showTime);
  }

  public static isValidSeatPosition(rowLabel: string, seatNumber: number): boolean {
    return /^[A-Z]$/.test(rowLabel) && seatNumber > 0 && seatNumber <= 30;
  }

  public static isValidPrice(price: number): boolean {
    return price > 0 && price <= 10000 && !isNaN(price);
  }

  public static isValidRating(rating: number): boolean {
    return rating >= 0 && rating <= 10;
  }

  public static isValidDuration(minutes: number): boolean {
    return minutes > 30 && minutes <= 300;
  }

  public static calculateRefundPercentage(bookingTime: Date, showTime: Date): number {
    const timeDiff = showTime.getTime() - bookingTime.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);

    if (hoursRemaining >= 24) return 100; // Full refund if cancelled 24+ hours before
    if (hoursRemaining >= 12) return 80; // 80% if 12-24 hours before
    if (hoursRemaining >= 6) return 50; // 50% if 6-12 hours before
    if (hoursRemaining >= 2) return 25; // 25% if 2-6 hours before
    return 0; // No refund if less than 2 hours
  }

  public static calculateRefundAmount(totalAmount: number, refundPercentage: number): number {
    return (totalAmount * refundPercentage) / 100;
  }

  public static isShowExpired(showDate: Date, showTime: string): boolean {
    const [hours, minutes] = showTime.split(':').map(Number);
    const showDateTime = new Date(showDate);
    showDateTime.setHours(hours, minutes, 0);
    return new Date() > showDateTime;
  }

  public static getSeatsPerRow(categoryType: string): number {
    const seatsPerRowMap: { [key: string]: number } = {
      PREMIUM: 12,
      STANDARD: 14,
      ECONOMY: 16
    };
    return seatsPerRowMap[categoryType] || 14;
  }
}
