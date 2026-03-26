import { Show } from '../models/Show';
import { ShowStatus } from '../enums';

export class ShowRepository {
  private shows: Map<string, Show> = new Map();

  public save(show: Show): void {
    this.shows.set(show.id, show);
  }

  public findById(id: string): Show | null {
    return this.shows.get(id) || null;
  }

  public findByMovie(movieId: string): Show[] {
    return Array.from(this.shows.values()).filter(s => s.movieId === movieId && s.status !== ShowStatus.CANCELLED);
  }

  public findByScreen(screenId: string): Show[] {
    return Array.from(this.shows.values()).filter(s => s.screenId === screenId);
  }

  public findByDateRange(startDate: Date, endDate: Date): Show[] {
    return Array.from(this.shows.values()).filter(
      s =>
        s.showDate >= startDate &&
        s.showDate <= endDate &&
        s.status !== ShowStatus.CANCELLED
    );
  }

  public getAllShows(): Show[] {
    return Array.from(this.shows.values());
  }

  public getUpcomingShows(): Show[] {
    const now = new Date();
    return Array.from(this.shows.values()).filter(
      s => s.showDate >= now && s.status !== ShowStatus.CANCELLED
    );
  }

  public getShowsByStatus(status: ShowStatus): Show[] {
    return Array.from(this.shows.values()).filter(s => s.status === status);
  }

  public update(show: Show): void {
    if (this.shows.has(show.id)) {
      show.updatedAt = new Date();
      this.shows.set(show.id, show);
    }
  }

  public delete(showId: string): boolean {
    return this.shows.delete(showId);
  }

  public clear(): void {
    this.shows.clear();
  }

  public getCount(): number {
    return this.shows.size;
  }
}
