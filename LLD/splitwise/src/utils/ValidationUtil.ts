export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  static isValidAmount(amount: number): boolean {
    return amount > 0 && !isNaN(amount);
  }

  static validateEqualSplit(
    amount: number,
    participantCount: number
  ): number[] {
    if (participantCount <= 0) {
      throw new Error("Participant count must be greater than 0");
    }
    const splitAmount = amount / participantCount;
    return Array(participantCount).fill(splitAmount);
  }

  static validateProportionalSplit(
    amount: number,
    proportions: number[]
  ): number[] {
    const totalProportion = proportions.reduce((a, b) => a + b, 0);
    if (totalProportion === 0) {
      throw new Error("Total proportion must be greater than 0");
    }

    return proportions.map(
      (proportion) => (proportion / totalProportion) * amount
    );
  }

  static validatePercentageSplit(
    amount: number,
    percentages: number[]
  ): number[] {
    const totalPercentage = percentages.reduce((a, b) => a + b, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error("Percentages must sum to 100%");
    }

    return percentages.map((percentage) => (percentage / 100) * amount);
  }

  static validateExactSplit(amount: number, exactAmounts: number[]): boolean {
    const totalExact = exactAmounts.reduce((a, b) => a + b, 0);
    return Math.abs(totalExact - amount) < 0.01;
  }

  static calculateBalance(
    totalAmount: number,
    participantShare: number
  ): number {
    return Math.round((participantShare - totalAmount / 2) * 100) / 100;
  }

  static formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  static roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
