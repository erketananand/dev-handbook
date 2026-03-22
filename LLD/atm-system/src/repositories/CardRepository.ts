import { Card } from '../models/Card';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class CardRepository {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  public save(card: Card): void {
    this.database.saveCard(card);
  }

  public findById(id: string): Card | undefined {
    return this.database.findCardById(id);
  }

  public findByCardNumber(cardNumber: string): Card | undefined {
    return this.database.findCardByCardNumber(cardNumber);
  }

  public findByAccountId(accountId: string): Card[] {
    return this.database.findCardsByAccountId(accountId);
  }

  public update(card: Card): void {
    this.database.updateCard(card);
  }

  public delete(id: string): void {
    this.database.deleteCard(id);
  }

  public getAll(): Card[] {
    return this.database.getAllCards();
  }
}
