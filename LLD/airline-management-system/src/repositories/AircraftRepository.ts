import { IRepository } from './IRepository';
import { Aircraft } from '../models/Aircraft';
import { InMemoryDatabase } from '../database/InMemoryDatabase';

export class AircraftRepository implements IRepository<Aircraft> {
  private db = InMemoryDatabase.getInstance();

  findById(id: string): Aircraft | undefined {
    return this.db.aircraft.get(id);
  }

  findAll(): Aircraft[] {
    return Array.from(this.db.aircraft.values());
  }

  save(aircraft: Aircraft): Aircraft {
    this.db.addAircraft(aircraft);
    return aircraft;
  }

  update(aircraft: Aircraft): Aircraft {
    this.db.aircraft.set(aircraft.id, aircraft);
    return aircraft;
  }

  delete(id: string): boolean {
    return this.db.aircraft.delete(id);
  }

  exists(id: string): boolean {
    return this.db.aircraft.has(id);
  }

  count(): number {
    return this.db.aircraft.size;
  }

  clear(): void {
    this.db.aircraft.clear();
  }

  findByRegistration(registration: string): Aircraft | undefined {
    return this.findAll().find(a => a.registration === registration);
  }
}
