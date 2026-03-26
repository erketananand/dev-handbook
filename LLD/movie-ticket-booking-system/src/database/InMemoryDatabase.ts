import { UserRepository } from '../repositories/UserRepository';
import { MovieRepository } from '../repositories/MovieRepository';
import { TheaterRepository } from '../repositories/TheaterRepository';
import { ScreenRepository } from '../repositories/ScreenRepository';
import { SeatRepository } from '../repositories/SeatRepository';
import { ShowRepository } from '../repositories/ShowRepository';
import { ShowSeatRepository } from '../repositories/ShowSeatRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { SeatCategory } from '../models/SeatCategory';

export class InMemoryDatabase {
  private static instance: InMemoryDatabase | null = null;

  public readonly userRepository: UserRepository;
  public readonly movieRepository: MovieRepository;
  public readonly theaterRepository: TheaterRepository;
  public readonly screenRepository: ScreenRepository;
  public readonly seatRepository: SeatRepository;
  public readonly showRepository: ShowRepository;
  public readonly showSeatRepository: ShowSeatRepository;
  public readonly bookingRepository: BookingRepository;
  public readonly paymentRepository: PaymentRepository;

  private seatCategories: Map<string, SeatCategory> = new Map();

  private constructor() {
    this.userRepository = new UserRepository();
    this.movieRepository = new MovieRepository();
    this.theaterRepository = new TheaterRepository();
    this.screenRepository = new ScreenRepository();
    this.seatRepository = new SeatRepository();
    this.showRepository = new ShowRepository();
    this.showSeatRepository = new ShowSeatRepository();
    this.bookingRepository = new BookingRepository();
    this.paymentRepository = new PaymentRepository();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  // Seat Category Methods
  public saveSeatCategory(category: SeatCategory): void {
    this.seatCategories.set(category.id, category);
  }

  public findSeatCategoryById(id: string): SeatCategory | null {
    return this.seatCategories.get(id) || null;
  }

  public getSeatCategoriesByScreen(screenId: string): SeatCategory[] {
    return Array.from(this.seatCategories.values()).filter(
      sc => sc.screenId === screenId
    );
  }

  public getAllSeatCategories(): SeatCategory[] {
    return Array.from(this.seatCategories.values());
  }

  public updateSeatCategory(category: SeatCategory): void {
    if (this.seatCategories.has(category.id)) {
      this.seatCategories.set(category.id, category);
    }
  }

  public deleteSeatCategory(id: string): boolean {
    return this.seatCategories.delete(id);
  }

  // System Methods
  public clearAll(): void {
    this.userRepository.clear();
    this.movieRepository.clear();
    this.theaterRepository.clear();
    this.screenRepository.clear();
    this.seatRepository.clear();
    this.showRepository.clear();
    this.showSeatRepository.clear();
    this.bookingRepository.clear();
    this.paymentRepository.clear();
    this.seatCategories.clear();
  }

  public getSystemStatus(): string {
    return `
=== Movie Ticket Booking System Status ===
Users: ${this.userRepository.getCount()}
Movies: ${this.movieRepository.getCount()}
Theaters: ${this.theaterRepository.getCount()}
Screens: ${this.screenRepository.getCount()}
Shows: ${this.showRepository.getCount()}
Total Seats: ${this.seatRepository.getCount()}
Active Shows: ${this.showSeatRepository.getCount()}
Bookings: ${this.bookingRepository.getCount()}
Total Revenue: ₹${this.paymentRepository.getTotalRevenue().toFixed(2)}
==========================================
    `.trim();
  }
}
