import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Show } from '../models/Show';
import { ShowSeat } from '../models/ShowSeat';
import { ShowStatus } from '../enums';
import { ValidationUtil } from '../utils/ValidationUtil';

export class ShowService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public addShow(
    movieId: string,
    screenId: string,
    showDate: Date,
    showTime: string
  ): Show {
    const movie = this.db.movieRepository.findById(movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }

    const screen = this.db.screenRepository.findById(screenId);
    if (!screen) {
      throw new Error('Screen not found');
    }

    if (!ValidationUtil.isValidShowTime(showTime)) {
      throw new Error('Invalid show time format (HH:MM)');
    }

    const show = new Show(movieId, screenId, showDate, showTime, screen.totalSeats);

    if (!show.isValid()) {
      throw new Error('Show validation failed');
    }

    this.db.showRepository.save(show);

    // Create ShowSeat entries for all seats
    const seats = this.db.seatRepository.findByScreen(screenId);
    for (const seat of seats) {
      const showSeat = new ShowSeat(show.id, seat.id);
      this.db.showSeatRepository.save(showSeat);
    }

    return show;
  }

  public getShowById(showId: string): Show | null {
    return this.db.showRepository.findById(showId);
  }

  public getShowsByMovie(movieId: string): Show[] {
    return this.db.showRepository.findByMovie(movieId);
  }

  public getShowsByScreen(screenId: string): Show[] {
    return this.db.showRepository.findByScreen(screenId);
  }

  public getUpcomingShows(): Show[] {
    return this.db.showRepository.getUpcomingShows();
  }

  public getShowsByDate(date: Date): Show[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.db.showRepository.findByDateRange(startOfDay, endOfDay);
  }

  public getAvailableShowsForMovie(movieId: string, city: string, date: Date): Show[] {
    const theaters = this.db.theaterRepository.findByCity(city);
    const theaterIds = theaters.map(t => t.id);

    const screens = this.db.screenRepository
      .getAllScreens()
      .filter(s => theaterIds.includes(s.theaterId));
    const screenIds = screens.map(s => s.id);

    const shows = this.db.showRepository.findByMovie(movieId);

    return shows.filter(
      s =>
        screenIds.includes(s.screenId) &&
        s.showDate.toDateString() === date.toDateString() &&
        s.status !== ShowStatus.CANCELLED &&
        s.availableSeats > 0
    );
  }

  public getAvailableSeats(showId: string): number {
    const show = this.getShowById(showId);
    return show ? show.availableSeats : 0;
  }

  public updateShowStatus(showId: string): void {
    const show = this.getShowById(showId);
    if (!show) return;

    const availableShowSeats = this.db.showSeatRepository.getAvailableSeats(showId);
    show.updateAvailableSeats(availableShowSeats.length);

    if (availableShowSeats.length === 0) {
      show.status = ShowStatus.HOUSEFUL;
    }

    this.db.showRepository.update(show);
  }

  public cancelShow(showId: string): Show | null {
    const show = this.getShowById(showId);
    if (!show) return null;

    show.status = ShowStatus.CANCELLED;
    this.db.showRepository.update(show);

    return show;
  }

  public getAllShows(): Show[] {
    return this.db.showRepository.getAllShows();
  }
}
