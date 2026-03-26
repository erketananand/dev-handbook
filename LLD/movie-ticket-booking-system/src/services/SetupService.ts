import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { UserService } from './UserService';
import { MovieService } from './MovieService';
import { TheaterService } from './TheaterService';
import { ShowService } from './ShowService';
import { SeatService } from './SeatService';
import { BookingService } from './BookingService';
import { PaymentService } from './PaymentService';
import { PaymentMethod, UserRole } from '../enums';
import { Payment } from '../models/Payment';

export class SetupService {
  private db: InMemoryDatabase;
  private userService: UserService;
  private movieService: MovieService;
  private theaterService: TheaterService;
  private showService: ShowService;
  private seatService: SeatService;
  private bookingService: BookingService;
  private paymentService: PaymentService;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
    this.userService = new UserService();
    this.movieService = new MovieService();
    this.theaterService = new TheaterService();
    this.showService = new ShowService();
    this.seatService = new SeatService();
    this.bookingService = new BookingService();
    this.paymentService = new PaymentService();
  }

  public initializeSystem(): void {
    this.clearData();
    this.createUsers();
    this.createMovies();
    this.createTheatersAndScreens();
    this.createShows();
    this.createSampleBookings();
  }

  private clearData(): void {
    this.db.clearAll();
  }

  private createUsers(): void {
    const users = [
      { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', password: 'pass123', address: 'New Delhi' },
      { name: 'Priya Singh', email: 'priya@email.com', phone: '9876543211', password: 'pass123', address: 'Mumbai' },
      { name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', password: 'pass123', address: 'Bangalore' }
    ];

    users.forEach(u => {
      try {
        this.userService.register(u.name, u.email, u.phone, u.password, u.address);
      } catch (err) {
        console.log(`User creation skipped: ${u.email}`);
      }
    });
  }

  private createMovies(): void {
    const movies = [
      {
        title: 'Avatar: The Way of Water',
        description: 'Epic sci-fi adventure',
        genre: 'Sci-Fi',
        duration: 192,
        language: 'English',
        rating: 8.5,
        releaseDate: new Date(2024, 0, 15)
      },
      {
        title: 'Pathaan',
        description: 'Action thriller',
        genre: 'Action',
        duration: 146,
        language: 'Hindi',
        rating: 8.0,
        releaseDate: new Date(2024, 0, 25)
      },
      {
        title: 'Oppenheimer',
        description: 'Biographical drama',
        genre: 'Drama',
        duration: 180,
        language: 'English',
        rating: 8.4,
        releaseDate: new Date(2023, 6, 21)
      }
    ];

    movies.forEach(m => {
      try {
        this.movieService.addMovie(m.title, m.description, m.genre, m.duration, m.language, m.rating, m.releaseDate);
      } catch (err) {
        console.log(`Movie creation skipped: ${m.title}`);
      }
    });
  }

  private createTheatersAndScreens(): void {
    const theaters = [
      { name: 'PVR Cinemas', city: 'New Delhi', address: 'Sector 14, Gurgaon', phone: '011-1234-5678', screens: 6 },
      { name: 'INOX', city: 'Mumbai', address: 'Marine Drive', phone: '022-9876-5432', screens: 5 },
      { name: 'Cinemax', city: 'Bangalore', address: 'MG Road', phone: '080-1111-2222', screens: 4 }
    ];

    theaters.forEach(t => {
      try {
        const theater = this.theaterService.addTheater(t.name, t.city, t.address, t.phone, t.screens);

        // Add screens
        for (let i = 1; i <= 2; i++) {
          try {
            const screen = this.theaterService.addScreen(theater.id, i, 150);

            // Add seat categories
            this.theaterService.addSeatCategory(screen.id, 'PREMIUM', 300);
            this.theaterService.addSeatCategory(screen.id, 'STANDARD', 200);
            this.theaterService.addSeatCategory(screen.id, 'ECONOMY', 100);

            // Generate seats
            this.theaterService.generateSeatsForScreen(screen.id);
          } catch (err) {
            console.log(`Screen creation skipped for screen ${i}`);
          }
        }
      } catch (err) {
        console.log(`Theater creation skipped: ${t.name}`);
      }
    });
  }

  private createShows(): void {
    const movies = this.movieService.getAllMovies();
    const theaters = this.theaterService.getAllTheaters();

    if (movies.length > 0 && theaters.length > 0) {
      const screens = this.db.screenRepository.getAllScreens();

      movies.slice(0, 2).forEach(movie => {
        screens.slice(0, 2).forEach(screen => {
          const showDate = new Date();
          showDate.setDate(showDate.getDate() + 3);

          try {
            this.showService.addShow(movie.id, screen.id, showDate, '18:00');
            this.showService.addShow(movie.id, screen.id, showDate, '21:00');
          } catch (err) {
            console.log(`Show creation skipped`);
          }
        });
      });
    }
  }

  private createSampleBookings(): void {
    const users = this.userService.getAllUsers();
    const shows = this.showService.getUpcomingShows();

    if (users.length >= 2 && shows.length >= 1) {
      const show = shows[0];
      const seats = this.seatService.getAvailableSeats(show.id).slice(0, 3);

      if (seats.length >= 2) {
        try {
          // Lock seats
          this.seatService.lockSeats(show.id, [seats[0].seatId, seats[1].seatId]);

          // Create booking
          const totalPrice = (seats[0].price || 0) + (seats[1].price || 0);
          const booking = this.bookingService.createBooking(
            users[0].id,
            show.id,
            [seats[0].seatId, seats[1].seatId],
            totalPrice
          );

          // Book seats
          this.seatService.bookSeats(show.id, [seats[0].seatId, seats[1].seatId]);

          // Create and process payment
          const payment = this.paymentService.createPayment(booking.id, PaymentMethod.CREDIT_CARD, totalPrice);
          this.paymentService.processPayment(payment.id);

          // Confirm booking
          this.bookingService.confirmBooking(booking.id);
          this.bookingService.completeBooking(booking.id);
        } catch (err) {
          console.log(`Sample booking creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    }
  }

  public displaySummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('MOVIE TICKET BOOKING SYSTEM - INITIALIZED WITH SAMPLE DATA');
    console.log('='.repeat(60));

    const users = this.userService.getAllUsers();
    console.log(`\nUsers (${users.length}):`);
    users.forEach(u => console.log(`  • ${u.getDisplayInfo()}`));

    const movies = this.movieService.getAllMovies();
    console.log(`\nMovies (${movies.length}):`);
    movies.forEach(m => console.log(`  • ${m.getDisplayInfo()}`));

    const theaters = this.theaterService.getAllTheaters();
    console.log(`\nTheaters (${theaters.length}):`);
    theaters.forEach(t => console.log(`  • ${t.getDisplayInfo()}`));

    const shows = this.showService.getUpcomingShows();
    console.log(`\nUpcoming Shows (${shows.length}):`);
    shows.slice(0, 5).forEach(s => console.log(`  • ${s.getDisplayInfo()}`));

    const bookings = this.bookingService.getAllBookings();
    console.log(`\nBookings (${bookings.length}):`);
    bookings.forEach(b => console.log(`  • ${b.getDisplayInfo()}`));

    console.log('\n' + this.paymentService.getPaymentSummary());
    console.log('\n' + this.db.getSystemStatus());
    console.log('='.repeat(60) + '\n');
  }
}
