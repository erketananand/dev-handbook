import { Theater } from '../models/Theater';

export class TheaterRepository {
  private theaters: Map<string, Theater> = new Map();

  public save(theater: Theater): void {
    this.theaters.set(theater.id, theater);
  }

  public findById(id: string): Theater | null {
    return this.theaters.get(id) || null;
  }

  public findByCity(city: string): Theater[] {
    return Array.from(this.theaters.values()).filter(t =>
      t.city.toLowerCase() === city.toLowerCase()
    );
  }

  public getAllTheaters(): Theater[] {
    return Array.from(this.theaters.values());
  }

  public update(theater: Theater): void {
    if (this.theaters.has(theater.id)) {
      this.theaters.set(theater.id, theater);
    }
  }

  public delete(theaterId: string): boolean {
    return this.theaters.delete(theaterId);
  }

  public clear(): void {
    this.theaters.clear();
  }

  public getCount(): number {
    return this.theaters.size;
  }
}
