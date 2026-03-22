import { IRepository } from './IRepository';
import { Flight } from '../models/Flight';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { FlightStatus } from '../enums/FlightStatus';

export class FlightRepository implements IRepository<Flight> {
  private db = InMemoryDatabase.getInstance();

  findById(id: string): Flight | undefined {
    return this.db.flights.get(id);
  }

  findAll(): Flight[] {
    return Array.from(this.db.flights.values());
  }

  save(flight: Flight): Flight {
    this.db.addFlight(flight);
    return flight;
  }

  update(flight: Flight): Flight {
    this.db.flights.set(flight.id, flight);
    this.db.flightsByNumber.set(flight.flightNumber, flight);
    return flight;
  }

  delete(id: string): boolean {
    const flight = this.db.flights.get(id);
    if (!flight) return false;
    this.db.flights.delete(id);
    this.db.flightsByNumber.delete(flight.flightNumber);
    return true;
  }

  exists(id: string): boolean {
    return this.db.flights.has(id);
  }

  count(): number {
    return this.db.flights.size;
  }

  clear(): void {
    this.db.flights.clear();
    this.db.flightsByNumber.clear();
  }

  findByFlightNumber(flightNumber: string): Flight | undefined {
    return this.db.flightsByNumber.get(flightNumber);
  }

  findByRoute(source: string, destination: string): Flight[] {
    return this.findAll().filter(
      f => f.source.toLowerCase() === source.toLowerCase() &&
           f.destination.toLowerCase() === destination.toLowerCase()
    );
  }

  findByStatus(status: FlightStatus): Flight[] {
    return this.findAll().filter(f => f.status === status);
  }

  findScheduledFlights(): Flight[] {
    return this.findByStatus(FlightStatus.SCHEDULED);
  }
}
