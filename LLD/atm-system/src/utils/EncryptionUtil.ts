import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly SECRET_KEY = crypto.scryptSync('atm-system-secret', 'salt', 32);

  public static hashPin(pin: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.SECRET_KEY, iv);
    let encrypted = cipher.update(pin, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  public static verifyPin(pin: string, hash: string): boolean {
    try {
      const parts = hash.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.SECRET_KEY, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');
      return decrypted === pin;
    } catch (error) {
      return false;
    }
  }

  public static maskCardNumber(cardNumber: string): string {
    return '**** **** **** ' + cardNumber.slice(-4);
  }
}
