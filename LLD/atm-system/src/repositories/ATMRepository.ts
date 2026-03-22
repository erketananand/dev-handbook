import { ATM } from '../models/ATM';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class ATMRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  public save(atm: ATM): void {
    this.database.saveATM(atm);
  }

  public findById(id: string): ATM | undefined {
    return this.database.findATMById(id);
  }

  public findByAtmId(atmId: string): ATM | undefined {
    return this.database.findATMByAtmId(atmId);
  }

  public update(atm: ATM): void {
    this.database.updateATM(atm);
  }

  public delete(id: string): void {
    this.database.deleteATM(id);
  }

  public getAll(): ATM[] {
    return this.database.getAllATMs();
  }
}
