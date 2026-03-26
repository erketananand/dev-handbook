import * as readline from 'readline';
import { UserService } from '../services/UserService';
import { MovieService } from '../services/MovieService';
import { TheaterService } from '../services/TheaterService';
import { ShowService } from '../services/ShowService';
import { SeatService } from '../services/SeatService';
import { BookingService } from '../services/BookingService';
import { PaymentService } from '../services/PaymentService';
import { SetupService } from '../services/SetupService';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { PaymentMethod } from '../enums';

export class ConsoleInterface {
  private rl: readline.Interface;
  private userService: UserService;
  private movieService: MovieService;
  private theaterService: TheaterService;
  private showService: ShowService;
  private seatService: SeatService;
  private bookingService: BookingService;
  private paymentService: PaymentService;
  private currentUser: any = null;
  private db: InMemoryDatabase;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.userService = new UserService();
    this.movieService = new MovieService();
    this.theaterService = new TheaterService();
    this.showService = new ShowService();
    this.seatService = new SeatService();
    this.bookingService = new BookingService();
    this.paymentService = new PaymentService();
    this.db = InMemoryDatabase.getInstance();

    const setupService = new SetupService();
    setupService.initializeSystem();
    setupService.displaySummary();
  }

  public start(): void {
    this.loginMenu();
  }

  private loginMenu(): void {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   MOVIE TICKET BOOKING SYSTEM         ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ 1. Login                              ║');
    console.log('║ 2. Register                           ║');
    console.log('║ 3. Exit                               ║');
    console.log('╚════════════════════════════════════════╝');

    this.prompt('Select option (1-3): ', input => {
      switch (input.trim()) {
        case '1':
          this.login();
          break;
        case '2':
          this.register();
          break;
        case '3':
          this.exit();
          break;
        default:
          console.log('Invalid option.');
          this.loginMenu();
      }
    });
  }

  private login(): void {
    this.prompt('Enter email: ', email => {
      this.prompt('Enter password: ', password => {
        try {
          const user = this.userService.authenticate(email, password);
          if (user) {
            this.currentUser = user;
            console.log(`✓ Welcome, ${user.name}!`);
            this.mainMenu();
          } else {
            console.log('✗ Invalid credentials.');
            this.loginMenu();
          }
        } catch (err) {
          console.log(`✗ Error: ${err instanceof Error ? err.message : 'Login failed'}`);
          this.loginMenu();
        }
      });
    });
  }

  private register(): void {
    this.prompt('Enter name: ', name => {
      this.prompt('Enter email: ', email => {
        this.prompt('Enter phone: ', phone => {
          this.prompt('Enter password: ', password => {
            this.prompt('Enter address: ', address => {
              try {
                const user = this.userService.register(name, email, phone, password, address);
                if (user) {
                  console.log(`✓ Registration successful! Your ID: ${user.id}`);
                }
                this.loginMenu();
              } catch (err) {
                console.log(`✗ Error: ${err instanceof Error ? err.message : 'Registration failed'}`);
                this.register();
              }
            });
          });
        });
      });
    });
  }

  private mainMenu(): void {
    if (!this.currentUser) {
      this.loginMenu();
      return;
    }

    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║ Welcome, ${this.currentUser.name.padEnd(33)}║`);
    console.log('╠════════════════════════════════════════╣');
    console.log('║ 1. Browse & Book Tickets              ║');
    console.log('║ 2. View My Bookings                   ║');
    console.log('║ 3. Cancel Booking                     ║');
    console.log('║ 4. View System Status                 ║');
    console.log('║ 5. Logout                             ║');
    console.log('╚════════════════════════════════════════╝');

    this.prompt('Select option (1-5): ', input => {
      switch (input.trim()) {
        case '1':
          this.browsAndBook();
          break;
        case '2':
          this.viewMyBookings();
          break;
        case '3':
          this.cancelBooking();
          break;
        case '4':
          this.viewSystemStatus();
          this.mainMenu();
          break;
        case '5':
          this.logout();
          break;
        default:
          console.log('Invalid option.');
          this.mainMenu();
      }
    });
  }

  private browsAndBook(): void {
    const cities = this.theaterService.getCities();

    if (cities.length === 0) {
      console.log('No theaters available.');
      this.mainMenu();
      return;
    }

    console.log('\nAvailable Cities:');
    cities.forEach((c, i) => console.log(`${i + 1}. ${c}`));

    this.prompt('Select city (number): ', cityIdx => {
      const idx = parseInt(cityIdx) - 1;
      if (idx < 0 || idx >= cities.length) {
        console.log('Invalid selection.');
        this.mainMenu();
        return;
      }

      const selectedCity = cities[idx];
      const movies = this.movieService.getAllMovies();

      console.log('\nAvailable Movies:');
      movies.forEach((m, i) => console.log(`${i + 1}. ${m.getDisplayInfo()}`));

      this.prompt('Select movie (number): ', movieIdx => {
        const mIdx = parseInt(movieIdx) - 1;
        if (mIdx < 0 || mIdx >= movies.length) {
          console.log('Invalid selection.');
          this.mainMenu();
          return;
        }

        const selectedMovie = movies[mIdx];
        const shows = this.showService.getAvailableShowsForMovie(selectedMovie.id, selectedCity, new Date());

        if (shows.length === 0) {
          console.log('No shows available.');
          this.mainMenu();
          return;
        }

        console.log('\nAvailable Shows:');
        shows.forEach((s, i) => console.log(`${i + 1}. ${s.getDisplayInfo()}`));

        this.prompt('Select show (number): ', showIdx => {
          const sIdx = parseInt(showIdx) - 1;
          if (sIdx < 0 || sIdx >= shows.length) {
            console.log('Invalid selection.');
            this.mainMenu();
            return;
          }

          this.selectSeatsAndBook(shows[sIdx].id);
        });
      });
    });
  }

  private selectSeatsAndBook(showId: string): void {
    const availableSeats = this.seatService.getAvailableSeats(showId);

    if (availableSeats.length === 0) {
      console.log('No seats available for this show.');
      this.mainMenu();
      return;
    }

    console.log(`\nAvailable Seats (${availableSeats.length}):`);
    availableSeats.slice(0, 10).forEach((s, i) => {
      console.log(`${i + 1}. ${s.position} - ${s.category} - ₹${s.price}`);
    });

    this.prompt('Enter number of seats to book: ', numStr => {
      const num = parseInt(numStr);
      if (num <= 0 || num > availableSeats.length) {
        console.log('Invalid number of seats.');
        this.mainMenu();
        return;
      }

      try {
        const selectedSeats = availableSeats.slice(0, num);
        const seatIds = selectedSeats.map(s => s.seatId);
        const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

        // Lock seats
        this.seatService.lockSeats(showId, seatIds);

        // Create booking
        const booking = this.bookingService.createBooking(
          this.currentUser.id,
          showId,
          seatIds,
          totalPrice
        );

        // Book seats
        this.seatService.bookSeats(showId, seatIds);

        // Create payment
        const payment = this.paymentService.createPayment(booking.id, PaymentMethod.CREDIT_CARD, totalPrice);
        this.paymentService.processPayment(payment.id);

        // Confirm booking
        this.bookingService.confirmBooking(booking.id);
        this.bookingService.completeBooking(booking.id);

        console.log(`✓ Booking confirmed! Booking Number: ${booking.bookingNumber}`);
        console.log(`  Seats: ${selectedSeats.map(s => s.position).join(', ')}`);
        console.log(`  Total: ₹${totalPrice.toFixed(2)}`);
      } catch (err) {
        console.log(`✗ Error: ${err instanceof Error ? err.message : 'Booking failed'}`);
      }

      this.mainMenu();
    });
  }

  private viewMyBookings(): void {
    const bookings = this.bookingService.getUserBookings(this.currentUser.id);

    if (bookings.length === 0) {
      console.log('You have no bookings.');
    } else {
      console.log(`\nYour Bookings (${bookings.length}):`);
      bookings.forEach((b, i) => {
        console.log(`${i + 1}. ${b.getDisplayInfo()}`);
      });
    }

    this.mainMenu();
  }

  private cancelBooking(): void {
    const bookings = this.bookingService.getUserBookings(this.currentUser.id);

    if (bookings.length === 0) {
      console.log('No bookings to cancel.');
      this.mainMenu();
      return;
    }

    this.prompt('Enter booking number: ', bookingNumber => {
      try {
        const booking = this.bookingService.getBookingByNumber(bookingNumber);
        if (!booking || booking.userId !== this.currentUser.id) {
          console.log('Booking not found.');
          this.mainMenu();
          return;
        }

        const refundAmount = this.bookingService.getRefundAmount(booking.id);
        console.log(`Refund amount: ₹${refundAmount.toFixed(2)}`);

        this.bookingService.cancelBooking(booking.id);
        console.log('✓ Booking cancelled. Refund will be processed.');
      } catch (err) {
        console.log(`✗ Error: ${err instanceof Error ? err.message : 'Cancellation failed'}`);
      }

      this.mainMenu();
    });
  }

  private viewSystemStatus(): void {
    console.log(`\n${this.db.getSystemStatus()}`);
    console.log(this.paymentService.getPaymentSummary());
  }

  private logout(): void {
    this.currentUser = null;
    console.log('Logged out successfully.');
    this.loginMenu();
  }

  private prompt(question: string, callback: (answer: string) => void): void {
    this.rl.question(question, answer => {
      callback(answer);
    });
  }

  private exit(): void {
    console.log('\nThank you for using Movie Ticket Booking System. Goodbye!');
    this.rl.close();
  }
}
