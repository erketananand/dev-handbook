export type UUID = string & { readonly __uuid: unique symbol };
export type Decimal = number;

export function generateUUID(): UUID {
  return (Math.random().toString(36).substr(2) + Date.now().toString(36)) as UUID;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidUPIId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidAccountNumber(account: string): boolean {
  return account.length >= 9 && account.length <= 18;
}

export function isValidIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}
