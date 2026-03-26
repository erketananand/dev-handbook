import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { SeatStatus } from '../enums';

export class SeatService {
  private db: InMemoryDatabase;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
  }

  public getAvailableSeats(showId: string): any[] {
    const showSeats = this.db.showSeatRepository.getAvailableSeats(showId);
    const seats = showSeats.map(ss => {
      const seat = this.db.seatRepository.findById(ss.seatId);
      const category = this.db.findSeatCategoryById(seat?.seatCategoryId || '');
      return {
        seatId: ss.seatId,
        showSeatId: ss.id,
        position: `${seat?.rowLabel}${seat?.seatNumber}`,
        category: category?.categoryName,
        price: category?.price
      };
    });
    return seats;
  }

  public getBookedSeats(showId: string): any[] {
    const showSeats = this.db.showSeatRepository.getBookedSeats(showId);
    return showSeats.map(ss => ({
      seatId: ss.seatId,
      status: ss.status
    }));
  }

  public lockSeats(showId: string, seatIds: string[]): boolean {
    try {
      for (const seatId of seatIds) {
        const showSeat = this.db.showSeatRepository.findByShowAndSeat(showId, seatId);
        if (!showSeat || showSeat.status !== SeatStatus.AVAILABLE) {
          throw new Error(`Seat ${seatId} is not available`);
        }
        showSeat.lock(15);
        this.db.showSeatRepository.update(showSeat);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  public bookSeats(showId: string, seatIds: string[]): boolean {
    try {
      for (const seatId of seatIds) {
        const showSeat = this.db.showSeatRepository.findByShowAndSeat(showId, seatId);
        if (!showSeat || showSeat.status === SeatStatus.BOOKED) {
          throw new Error(`Seat ${seatId} is not available for booking`);
        }
        showSeat.book();
        this.db.showSeatRepository.update(showSeat);
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  public releaseSeats(showId: string, seatIds: string[]): boolean {
    try {
      for (const seatId of seatIds) {
        const showSeat = this.db.showSeatRepository.findByShowAndSeat(showId, seatId);
        if (showSeat) {
          showSeat.release();
          this.db.showSeatRepository.update(showSeat);
        }
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  public releaseExpiredLocks(): void {
    this.db.showSeatRepository.releaseExpiredLocks();
  }

  public getSeatDetails(seatId: string): any {
    const seat = this.db.seatRepository.findById(seatId);
    if (!seat) return null;

    const category = this.db.findSeatCategoryById(seat.seatCategoryId);
    return {
      seatId: seat.id,
      position: `${seat.rowLabel}${seat.seatNumber}`,
      category: category?.categoryName,
      price: category?.price,
      status: seat.status
    };
  }

  public getSeatsLayout(screenId: string): any {
    const seats = this.db.seatRepository.findByScreen(screenId);
    const categories = this.db.getSeatCategoriesByScreen(screenId);

    const layout: { [key: string]: any[] } = {};

    for (const category of categories) {
      layout[category.categoryName] = seats
        .filter(s => s.seatCategoryId === category.id)
        .map(s => ({
          seatId: s.id,
          position: `${s.rowLabel}${s.seatNumber}`,
          price: category.price
        }));
    }

    return layout;
  }
}
