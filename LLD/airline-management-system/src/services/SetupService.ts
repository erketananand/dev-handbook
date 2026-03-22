import { FlightService } from './FlightService';
import { PassengerService } from './PassengerService';
import { Passenger } from '../models/Passenger';
import { Logger } from '../utils/Logger';

export class SetupService {
  private flightService: FlightService;
  private passengerService: PassengerService;

  constructor(flightService: FlightService, passengerService: PassengerService) {
    this.flightService = flightService;
    this.passengerService = passengerService;
  }

  public initializeSystem(): void {
    console.clear();
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   Airline Management System - Setup             ║');
    console.log('║         Initializing Sample Data                ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    this.setupPassengers();
    this.setupAircraftAndFlights();

    Logger.success('\n✓ System initialized successfully!\n');
    this.displaySummary();
  }

  private setupPassengers(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Setting up sample passengers...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const passenger1 = this.passengerService.register(
      'Rajesh Kumar',
      'rajesh@email.com',
      '+91-9876543210',
      'IN1234567'
    );

    const passenger2 = this.passengerService.register(
      'Priya Singh',
      'priya@email.com',
      '+91-9876543211',
      'IN7654321'
    );

    const passenger3 = this.passengerService.register(
      'Amit Patel',
      'amit@email.com',
      '+91-9876543212',
      'IN4567890'
    );

    if (passenger1) console.log(`✓ Passenger 1: ${passenger1.getDisplayInfo()}`);
    if (passenger2) console.log(`✓ Passenger 2: ${passenger2.getDisplayInfo()}`);
    if (passenger3) console.log(`✓ Passenger 3: ${passenger3.getDisplayInfo()}`);

    const passengerCount = this.passengerService.getAllPassengers().length;
    console.log(`\n✓ ${passengerCount} passengers registered\n`);
  }

  private setupAircraftAndFlights(): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Setting up aircraft...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Aircraft 1: Boeing 737 (180 seats)
    const ac1 = this.flightService.addAircraft('VT-AXB', 'Boeing 737');
    this.flightService.addSeatsToAircraft(ac1, 144, 30, 6);
    console.log(`✓ Aircraft 1: ${ac1.getDisplayInfo()}`);
    console.log(`  - Economy: 144 seats | Business: 30 seats | First: 6 seats`);

    // Aircraft 2: Airbus A320 (195 seats)
    const ac2 = this.flightService.addAircraft('VT-AXC', 'Airbus A320');
    this.flightService.addSeatsToAircraft(ac2, 156, 32, 7);
    console.log(`✓ Aircraft 2: ${ac2.getDisplayInfo()}`);
    console.log(`  - Economy: 156 seats | Business: 32 seats | First: 7 seats`);

    // Aircraft 3: Boeing 777 (350 seats)
    const ac3 = this.flightService.addAircraft('VT-AXD', 'Boeing 777');
    this.flightService.addSeatsToAircraft(ac3, 280, 60, 10);
    console.log(`✓ Aircraft 3: ${ac3.getDisplayInfo()}`);
    console.log(`  - Economy: 280 seats | Business: 60 seats | First: 10 seats`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Setting up flights...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Use current date (2026-03-22 based on context)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dt = (h: number, m: number = 0): Date => {
      const d = new Date(today);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const flight1 = this.flightService.addFlight('AI-202', ac1.id, 'DEL', 'BOM', dt(8, 0), dt(10, 30), 3500);
    console.log(`✓ Flight 1: AI-202 | DEL → BOM | 08:00 - 10:30 | ₹3,500`);

    const flight2 = this.flightService.addFlight('AI-203', ac2.id, 'BOM', 'BLR', dt(11, 0), dt(13, 30), 2800);
    console.log(`✓ Flight 2: AI-203 | BOM → BLR | 11:00 - 13:30 | ₹2,800`);

    const flight3 = this.flightService.addFlight('AI-204', ac3.id, 'DEL', 'NYC', dt(22, 0), dt(9, 0), 50000);
    console.log(`✓ Flight 3: AI-204 | DEL → NYC | 22:00 - 09:00 (next day) | ₹50,000`);

    const flight4 = this.flightService.addFlight('AI-205', ac1.id, 'BLR', 'DEL', dt(14, 0), dt(16, 15), 3200);
    console.log(`✓ Flight 4: AI-205 | BLR → DEL | 14:00 - 16:15 | ₹3,200`);

    const flight5 = this.flightService.addFlight('AI-206', ac2.id, 'BOM', 'DEL', dt(18, 0), dt(20, 30), 4100);
    console.log(`✓ Flight 5: AI-206 | BOM → DEL | 18:00 - 20:30 | ₹4,100`);

    console.log(`\n✓ ${this.flightService.getAllFlights().length} flights scheduled\n`);
  }

  private displaySummary(): void {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║             Test Data Summary                  ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const passengers = this.passengerService.getAllPassengers();
    const flights = this.flightService.getAllFlights();

    console.log(`📊 Total Passengers: ${passengers.length}`);
    console.log(`✈️  Total Flights: ${flights.length}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You can now:');
    console.log('  1. Search flights by route and date');
    console.log('  2. Book flights for registered passengers');
    console.log('  3. View seat availability');
    console.log('  4. Manage bookings (reschedule/cancel)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  public displaySystemSummary(): void {
    Logger.header('SYSTEM SUMMARY');
    console.log(`Total Flights  : ${this.flightService.getAllFlights().length}`);
    Logger.separator();
  }
}
