import { IRepository } from './IRepository';
import { Passenger } from '../models/Passenger';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class PassengerRepository implements IRepository<Passenger> {
  private db = InMemoryDatabase.getInstance();

  findById(id: string): Passenger | undefined {
    return this.db.passengers.get(id);
  }

  findAll(): Passenger[] {
    return Array.from(this.db.passengers.values());
  }

  save(passenger: Passenger): Passenger {
    this.db.addPassenger(passenger);
    return passenger;
  }

  update(passenger: Passenger): Passenger {
    this.db.passengers.set(passenger.id, passenger);
    this.db.passengersByEmail.set(passenger.email, passenger);
    return passenger;
  }

  delete(id: string): boolean {
    const passenger = this.db.passengers.get(id);
    if (!passenger) return false;
    this.db.passengers.delete(id);
    this.db.passengersByEmail.delete(passenger.email);
    return true;
  }

  exists(id: string): boolean {
    return this.db.passengers.has(id);
  }

  count(): number {
    return this.db.passengers.size;
  }

  clear(): void {
    this.db.passengers.clear();
    this.db.passengersByEmail.clear();
  }

  findByEmail(email: string): Passenger | undefined {
    return this.db.passengersByEmail.get(email);
  }
}
