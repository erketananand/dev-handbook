import { Screen } from '../models/Screen';

export class ScreenRepository {
  private screens: Map<string, Screen> = new Map();

  public save(screen: Screen): void {
    this.screens.set(screen.id, screen);
  }

  public findById(id: string): Screen | null {
    return this.screens.get(id) || null;
  }

  public findByTheater(theaterId: string): Screen[] {
    return Array.from(this.screens.values()).filter(s => s.theaterId === theaterId);
  }

  public getAllScreens(): Screen[] {
    return Array.from(this.screens.values());
  }

  public update(screen: Screen): void {
    if (this.screens.has(screen.id)) {
      this.screens.set(screen.id, screen);
    }
  }

  public delete(screenId: string): boolean {
    return this.screens.delete(screenId);
  }

  public clear(): void {
    this.screens.clear();
  }

  public getCount(): number {
    return this.screens.size;
  }
}
