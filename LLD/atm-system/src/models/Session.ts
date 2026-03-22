import { IdGenerator } from '../utils/IdGenerator';
import { SessionStatus } from '../enums';
import { Card } from './Card';
import { Account } from './Account';
import { ATM } from './ATM';

export class Session {
  public readonly id: string;
  public card: Card;
  public account: Account;
  public atm: ATM;
  public loginTime: Date;
  public logoutTime: Date | null;
  public status: SessionStatus;

  constructor(card: Card, account: Account, atm: ATM, id?: string) {
    this.id = id || IdGenerator.generateUUID();
    this.card = card;
    this.account = account;
    this.atm = atm;
    this.loginTime = new Date();
    this.logoutTime = null;
    this.status = SessionStatus.ACTIVE;
  }

  public close(): void {
    this.logoutTime = new Date();
    this.status = SessionStatus.CLOSED;
  }

  public isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  public getDuration(): number {
    const endTime = this.logoutTime || new Date();
    return (endTime.getTime() - this.loginTime.getTime()) / 1000; // Duration in seconds
  }

  public getDisplayInfo(): string {
    return `Session: ${this.id} | Card: ${this.card.cardNumber} | ATM: ${this.atm.atmId} | Status: ${
      this.status
    }`;
  }
}
