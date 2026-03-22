import * as readline from 'readline';
import { PassengerService } from '../services/PassengerService';
import { FlightService } from '../services/FlightService';
import { BookingService } from '../services/BookingService';
import { SetupService } from '../services/SetupService';
import { Passenger } from '../models/Passenger';
import { Flight } from '../models/Flight';
import { Booking } from '../models/Booking';
import { SeatClass } from '../enums/SeatClass';
import { FlightStatus } from '../enums/FlightStatus';
import { CreditCardPayment } from '../strategies/payment/CreditCardPayment';
import { UPIPayment } from '../strategies/payment/UPIPayment';
import { NetBankingPayment } from '../strategies/payment/NetBankingPayment';
import { WalletPayment } from '../strategies/payment/WalletPayment';
import { SortByPrice } from '../strategies/sort/SortByPrice';
import { SortByDuration } from '../strategies/sort/SortByDuration';
import { SortByDepartureTime } from '../strategies/sort/SortByDepartureTime';
import { EmailNotifier } from '../observers/EmailNotifier';
import { SMSNotifier } from '../observers/SMSNotifier';
import { BookingNotifier } from '../observers/BookingNotifier';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { Logger } from '../utils/Logger';

export class ConsoleInterface {
  private passengerService = new PassengerService();
  private flightService = new FlightService();
  private bookingService = new BookingService();
  private setupService: SetupService;
  private notifier = BookingNotifier.getInstance();
  private db = InMemoryDatabase.getInstance();

  constructor() {
    this.setupService = new SetupService(this.flightService, this.passengerService);
  }

  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  private currentPassenger: Passenger | null = null;

  public async start(): Promise<void> {
    this.printWelcome();
    this.initializeObservers();
    this.setupService.initializeSystem();
    await this.mainMenu();
  }

  private printWelcome(): void {
    console.clear();
    console.log('\n' + '='.repeat(80));
    console.log(' '.repeat(22) + 'AIRLINE MANAGEMENT SYSTEM');
    console.log('='.repeat(80));
    console.log('  Design Patterns: Singleton, Facade, State, Strategy, Observer, Repository');
    console.log('  Technology     : Node.js + TypeScript + In-Memory Database');
    console.log('='.repeat(80) + '\n');
  }

  private initializeObservers(): void {
    this.notifier.attach(new EmailNotifier());
    this.notifier.attach(new SMSNotifier());
  }

  private async mainMenu(): Promise<void> {
    while (true) {
      console.log('\n' + '='.repeat(80));
      console.log('MAIN MENU');
      console.log('='.repeat(80));

      if (this.currentPassenger) {
        console.log(`Logged in as: ${this.currentPassenger.name} (${this.currentPassenger.email})\n`);
        console.log('1. Search & Book Flights');
        console.log('2. My Bookings');
        console.log('3. Check Booking Status (by Ref)');
        console.log('4. Cancel Booking');
        console.log('5. Reschedule Booking');
        console.log('6. Logout');
        console.log('7. Exit');
      } else {
        console.log('1. Register');
        console.log('2. Login');
        console.log('3. View All Flights');
        console.log('4. Database Statistics');
        console.log('5. Exit');
      }
      console.log('='.repeat(80));

      const choice = await this.prompt('\nEnter your choice: ');

      if (this.currentPassenger) {
        await this.handleAuthenticatedMenu(choice);
      } else {
        await this.handleGuestMenu(choice);
      }
    }
  }

  // ========== GUEST MENU ==========

  private async handleGuestMenu(choice: string): Promise<void> {
    switch (choice) {
      case '1': await this.registerPassenger(); break;
      case '2': await this.loginPassenger(); break;
      case '3': this.flightService.displayAllFlights(); break;
      case '4': this.db.printStats(); break;
      case '5':
        console.log('\nThank you for flying with us!\n');
        this.rl.close();
        process.exit(0);
      default:
        Logger.error('Invalid choice. Please try again.');
    }
  }

  // ========== AUTHENTICATED MENU ==========

  private async handleAuthenticatedMenu(choice: string): Promise<void> {
    switch (choice) {
      case '1': await this.searchAndBookFlights(); break;
      case '2': await this.viewMyBookings(); break;
      case '3': await this.checkBookingStatus(); break;
      case '4': await this.cancelBooking(); break;
      case '5': await this.rescheduleBooking(); break;
      case '6': this.logout(); break;
      case '7':
        console.log('\nThank you for flying with us!\n');
        this.rl.close();
        process.exit(0);
      default:
        Logger.error('Invalid choice. Please try again.');
    }
  }

  // ========== PASSENGER MANAGEMENT ==========

  private async registerPassenger(): Promise<void> {
    Logger.header('PASSENGER REGISTRATION');

    const name     = await this.prompt('Full name    : ');
    const email    = await this.prompt('Email        : ');
    const phone    = await this.prompt('Phone        : ');
    const passport = await this.prompt('Passport No  : (press Enter to skip) ');

    const passenger = this.passengerService.register(
      name, email, phone, passport || undefined
    );

    if (passenger) {
      console.log('\n✓ Registration successful! Please login.');
    }
  }

  private async loginPassenger(): Promise<void> {
    Logger.header('LOGIN');

    const email = await this.prompt('Email: ');
    const passenger = this.passengerService.getByEmail(email);

    if (!passenger) {
      Logger.error('No account found with this email. Please register first.');
      return;
    }

    this.currentPassenger = passenger;
    Logger.success(`Welcome back, ${passenger.name}!`);
  }

  private logout(): void {
    console.log(`\nGoodbye, ${this.currentPassenger?.name}!`);
    this.currentPassenger = null;
  }

  // ========== FLIGHT SEARCH & BOOKING ==========

  private async searchAndBookFlights(): Promise<void> {
    Logger.header('SEARCH FLIGHTS');

    const source      = await this.prompt('From (city): ');
    const destination = await this.prompt('To   (city): ');
    const dateStr     = await this.prompt('Date (YYYY-MM-DD): ');

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      Logger.error('Invalid date format. Please use YYYY-MM-DD.');
      return;
    }

    // Ask sort preference
    console.log('\nSort results by:');
    console.log('1. Price (lowest first)');
    console.log('2. Duration (shortest first)');
    console.log('3. Departure Time (earliest first)');
    const sortChoice = await this.prompt('Sort option (default: 1): ');

    const sortStrategies: Record<string, any> = {
      '1': new SortByPrice(),
      '2': new SortByDuration(),
      '3': new SortByDepartureTime()
    };
    const strategy = sortStrategies[sortChoice] || new SortByPrice();

    const flights = this.flightService.searchFlights(source, destination, date, strategy);

    if (flights.length === 0) {
      console.log(`\nNo flights found from ${source} to ${destination} on ${dateStr}.`);
      return;
    }

    this.displayFlightList(flights);

    const flightChoice = await this.prompt('\nSelect flight number (or 0 to go back): ');
    const idx = parseInt(flightChoice) - 1;

    if (idx < 0 || idx >= flights.length) {
      console.log('Going back...');
      return;
    }

    await this.bookFlight(flights[idx]);
  }

  private displayFlightList(flights: Flight[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('AVAILABLE FLIGHTS');
    console.log('='.repeat(80));
    console.log('No.  ' + 'Flight'.padEnd(10) + 'Route'.padEnd(30) + 'Departure'.padEnd(12) + 'Dur'.padEnd(8) + 'Price');
    console.log('-'.repeat(80));
    flights.forEach((f, i) => {
      const route = `${f.source} → ${f.destination}`;
      const dept = f.departureTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const dur = f.getDurationMinutes();
      const durStr = `${Math.floor(dur / 60)}h${dur % 60}m`;
      console.log(
        `${(i + 1).toString().padEnd(5)}${f.flightNumber.padEnd(10)}${route.padEnd(30)}${dept.padEnd(12)}${durStr.padEnd(8)}₹${f.basePrice}`
      );
    });
    console.log('='.repeat(80));
  }

  private async bookFlight(flight: Flight): Promise<void> {
    Logger.header(`BOOK FLIGHT: ${flight.flightNumber}`);
    this.flightService.displayFlightDetails(flight);

    // Choose seat class
    console.log('Choose seat class:');
    const classes = [SeatClass.FIRST, SeatClass.BUSINESS, SeatClass.ECONOMY];
    classes.forEach((cls, i) => {
      const avail = flight.getAvailableCount(cls);
      const price = flight.getPriceForClass(cls);
      console.log(`${i + 1}. ${cls.padEnd(12)} | ${avail} available | ₹${price}`);
    });

    const clsChoice = await this.prompt('\nSelect class (or 0 to go back): ');
    const clsIdx = parseInt(clsChoice) - 1;

    if (clsIdx < 0 || clsIdx >= classes.length) {
      console.log('Going back...');
      return;
    }

    const selectedClass = classes[clsIdx];
    const availableSeats = flight.getAvailableSeats(selectedClass);

    if (availableSeats.length === 0) {
      Logger.error(`No ${selectedClass} seats available.`);
      return;
    }

    // Show seat options (up to 10)
    console.log(`\nAvailable ${selectedClass} seats:`);
    const display = availableSeats.slice(0, 10);
    display.forEach((fs, i) => {
      console.log(`  ${i + 1}. Seat ${fs.seat.seatNumber}`);
    });
    if (availableSeats.length > 10) {
      console.log(`  ... and ${availableSeats.length - 10} more`);
    }

    const seatChoice = await this.prompt('\nSelect seat number (or 0 to skip seat selection): ');
    const seatIdx = parseInt(seatChoice) - 1;

    let selectedSeatId: string | null = null;
    let totalAmount: number;

    if (seatIdx >= 0 && seatIdx < display.length) {
      const fs = display[seatIdx];
      selectedSeatId = fs.seat.id;
      totalAmount = fs.price;
      console.log(`\nSelected: Seat ${fs.seat.seatNumber} | ₹${totalAmount}`);
    } else {
      totalAmount = flight.getPriceForClass(selectedClass);
      console.log(`\nNo specific seat selected. Amount: ₹${totalAmount}`);
    }

    const confirm = await this.prompt('\nConfirm booking? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Booking cancelled.');
      return;
    }

    const booking = this.bookingService.createBooking(
      this.currentPassenger!.id,
      flight.id,
      selectedSeatId,
      totalAmount
    );

    if (!booking) {
      Logger.error('Failed to create booking. Please try again.');
      return;
    }

    await this.processPayment(booking);
  }

  private async processPayment(booking: Booking): Promise<void> {
    Logger.header('PAYMENT');
    console.log(`Amount to pay: ₹${booking.totalAmount}`);
    console.log('\nPayment Methods:');
    console.log('1. Credit Card');
    console.log('2. UPI');
    console.log('3. Net Banking');
    console.log('4. Wallet');

    const choice = await this.prompt('\nSelect payment method: ');
    let paymentMethod;

    switch (choice) {
      case '1': {
        const cardNumber = await this.prompt('Card number (16 digits): ');
        const cvv        = await this.prompt('CVV (3 digits): ');
        const expiry     = await this.prompt('Expiry (MM/YY): ');
        const holder     = await this.prompt('Cardholder name: ');
        paymentMethod = new CreditCardPayment(cardNumber, cvv, expiry, holder);
        break;
      }
      case '2': {
        const upiId  = await this.prompt('UPI ID (e.g., name@upi): ');
        const app    = await this.prompt('App name (e.g., GPay): ');
        paymentMethod = new UPIPayment(upiId, app || 'UPI');
        break;
      }
      case '3': {
        const bank   = await this.prompt('Bank name: ');
        const acct   = await this.prompt('Account number: ');
        paymentMethod = new NetBankingPayment(bank, acct);
        break;
      }
      case '4': {
        const walletId = await this.prompt('Wallet ID: ');
        const balStr   = await this.prompt('Wallet balance (₹): ');
        paymentMethod = new WalletPayment(walletId, parseFloat(balStr) || 0);
        break;
      }
      default:
        Logger.error('Invalid payment method.');
        this.bookingService.cancelBooking(booking.bookingRef);
        return;
    }

    const success = this.bookingService.processPayment(booking.id, paymentMethod);

    if (success) {
      const confirmed = this.bookingService.getBookingByRef(booking.bookingRef);
      if (confirmed) this.bookingService.displayBookingDetails(confirmed);
    } else {
      Logger.error('Payment failed. Booking has been released.');
    }
  }

  // ========== BOOKING MANAGEMENT ==========

  private async viewMyBookings(): Promise<void> {
    Logger.header('MY BOOKINGS');

    const bookings = this.bookingService.getBookingsByPassenger(this.currentPassenger!.id);

    if (bookings.length === 0) {
      console.log('You have no bookings yet.');
      return;
    }

    console.log('\n' + '='.repeat(80));
    bookings.forEach((b, i) => {
      console.log(`${i + 1}. ${b.getDisplayInfo()}`);
    });
    console.log('='.repeat(80));

    const choice = await this.prompt('\nEnter number to view details (or 0 to go back): ');
    const idx = parseInt(choice) - 1;

    if (idx >= 0 && idx < bookings.length) {
      this.bookingService.displayBookingDetails(bookings[idx]);
    }
  }

  private async checkBookingStatus(): Promise<void> {
    Logger.header('CHECK BOOKING STATUS');

    const ref = await this.prompt('Enter booking reference (e.g., AIR-123456ABCD): ');
    const booking = this.bookingService.getBookingByRef(ref.trim());

    if (!booking) {
      Logger.error('Booking not found.');
      return;
    }

    this.bookingService.displayBookingDetails(booking);
  }

  private async cancelBooking(): Promise<void> {
    Logger.header('CANCEL BOOKING');

    const bookings = this.bookingService
      .getBookingsByPassenger(this.currentPassenger!.id)
      .filter(b => b.getStatus() !== 'CANCELLED' as any);

    if (bookings.length === 0) {
      console.log('No active bookings to cancel.');
      return;
    }

    console.log('\nYour active bookings:');
    bookings.forEach((b, i) => console.log(`${i + 1}. ${b.getDisplayInfo()}`));

    const choice = await this.prompt('\nSelect booking to cancel (or 0 to go back): ');
    const idx = parseInt(choice) - 1;

    if (idx < 0 || idx >= bookings.length) {
      console.log('Going back...');
      return;
    }

    const booking = bookings[idx];
    this.bookingService.displayBookingDetails(booking);

    const confirm = await this.prompt('Are you sure you want to cancel? (yes/no): ');
    if (confirm.toLowerCase() === 'yes') {
      this.bookingService.cancelBooking(booking.bookingRef);
    } else {
      console.log('Cancellation aborted.');
    }
  }

  private async rescheduleBooking(): Promise<void> {
    Logger.header('RESCHEDULE BOOKING');

    const bookings = this.bookingService
      .getBookingsByPassenger(this.currentPassenger!.id)
      .filter(b => b.getStatus() === 'CONFIRMED' as any || b.getStatus() === 'RESCHEDULED' as any);

    if (bookings.length === 0) {
      console.log('No confirmed bookings available to reschedule.');
      return;
    }

    console.log('\nYour confirmed bookings:');
    bookings.forEach((b, i) => console.log(`${i + 1}. ${b.getDisplayInfo()}`));

    const choice = await this.prompt('\nSelect booking to reschedule (or 0 to go back): ');
    const idx = parseInt(choice) - 1;

    if (idx < 0 || idx >= bookings.length) {
      console.log('Going back...');
      return;
    }

    const booking = bookings[idx];

    // Search for new flights
    const source      = await this.prompt('New departure city: ');
    const destination = await this.prompt('New arrival city  : ');
    const dateStr     = await this.prompt('New date (YYYY-MM-DD): ');

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      Logger.error('Invalid date.');
      return;
    }

    const flights = this.flightService.searchFlights(source, destination, date);
    if (flights.length === 0) {
      console.log('No flights found for the new route/date.');
      return;
    }

    this.displayFlightList(flights);

    const flightChoice = await this.prompt('\nSelect new flight (or 0 to go back): ');
    const flightIdx = parseInt(flightChoice) - 1;

    if (flightIdx < 0 || flightIdx >= flights.length) {
      console.log('Going back...');
      return;
    }

    const confirm = await this.prompt('\nConfirm reschedule? (yes/no): ');
    if (confirm.toLowerCase() === 'yes') {
      this.bookingService.rescheduleBooking(booking.bookingRef, flights[flightIdx].id);
    } else {
      console.log('Reschedule cancelled.');
    }
  }

  // ========== UTILITY ==========

  private prompt(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer.trim()));
    });
  }
}

// ========== START APPLICATION ==========
const app = new ConsoleInterface();
app.start().catch(console.error);
