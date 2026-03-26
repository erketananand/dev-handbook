import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Theater } from '../models/Theater';
import { Screen } from '../models/Screen';
import { SeatCategory } from '../models/SeatCategory';
import { Seat } from '../models/Seat';
import { ValidationUtil } from '../utils/ValidationUtil';

export class TheaterService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public addTheater(
    name: string,
    city: string,
    address: string,
    phone: string,
    totalScreens: number
  ): Theater {
    const theater = new Theater(name, city, address, phone, totalScreens);

    if (!theater.isValid()) {
      throw new Error('Theater validation failed');
    }

    this.db.theaterRepository.save(theater);
    return theater;
  }

  public getTheaterById(theaterId: string): Theater | null {
    return this.db.theaterRepository.findById(theaterId);
  }

  public getTheatersByCity(city: string): Theater[] {
    return this.db.theaterRepository.findByCity(city);
  }

  public getAllTheaters(): Theater[] {
    return this.db.theaterRepository.getAllTheaters();
  }

  public getCities(): string[] {
    const theaters = this.getAllTheaters();
    const cities = new Set(theaters.map(t => t.city));
    return Array.from(cities).sort();
  }

  public addScreen(theaterId: string, screenNumber: number, totalSeats: number): Screen {
    const theater = this.getTheaterById(theaterId);
    if (!theater) {
      throw new Error('Theater not found');
    }

    const screen = new Screen(theaterId, screenNumber, totalSeats);
    if (!screen.isValid()) {
      throw new Error('Screen validation failed');
    }

    this.db.screenRepository.save(screen);
    return screen;
  }

  public getScreensByTheater(theaterId: string): Screen[] {
    return this.db.screenRepository.findByTheater(theaterId);
  }

  public addSeatCategory(
    screenId: string,
    categoryName: string,
    price: number
  ): SeatCategory {
    const screen = this.db.screenRepository.findById(screenId);
    if (!screen) {
      throw new Error('Screen not found');
    }

    const seatsInCategory = this.calculateSeatsForCategory(categoryName);
    const category = new SeatCategory(screenId, categoryName, price, seatsInCategory);

    if (!category.isValid()) {
      throw new Error('Seat category validation failed');
    }

    this.db.saveSeatCategory(category);
    return category;
  }

  public generateSeatsForScreen(screenId: string): Seat[] {
    const screen = this.db.screenRepository.findById(screenId);
    if (!screen) {
      throw new Error('Screen not found');
    }

    const categories = this.db.getSeatCategoriesByScreen(screenId);
    const seats: Seat[] = [];

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
    let seatIndex = 0;

    for (const category of categories) {
      const seatsPerRow = ValidationUtil.getSeatsPerRow(category.categoryName);
      const rowsNeeded = Math.ceil(category.totalSeats / seatsPerRow);

      for (let i = 0; i < rowsNeeded && seatIndex < rows.length; i++) {
        const seatsInThisRow = Math.min(seatsPerRow, category.totalSeats - i * seatsPerRow);
        for (let j = 1; j <= seatsInThisRow; j++) {
          const seat = new Seat(screenId, category.id, rows[seatIndex], j);
          seats.push(seat);
          this.db.seatRepository.save(seat);
        }
        seatIndex++;
      }
    }

    return seats;
  }

  private calculateSeatsForCategory(categoryName: string): number {
    const categorySeats: { [key: string]: number } = {
      PREMIUM: 50,
      STANDARD: 100,
      ECONOMY: 80
    };
    return categorySeats[categoryName] || 50;
  }

  public deleteTheater(theaterId: string): boolean {
    return this.db.theaterRepository.delete(theaterId);
  }
}
