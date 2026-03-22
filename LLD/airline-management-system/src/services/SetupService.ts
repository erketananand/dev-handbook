import { FlightService } from './FlightService';
import { Logger } from '../utils/Logger';

export class SetupService {
  private flightService: FlightService;

  constructor(flightService: FlightService) {
    this.flightService = flightService;
  }

  public initializeSystem(): void {
    Logger.header('INITIALIZING AIRLINE MANAGEMENT SYSTEM');
    this.setupAircraftAndFlights();
    Logger.success('System initialized successfully.\n');
  }

  private setupAircraftAndFlights(): void {
    console.log('Setting up aircraft...');

    const ac1 = this.flightService.addAircraft('VT-AXB', 'Boeing 737');
    this.flightService.addSeatsToAircraft(ac1, 120, 20, 8);

    const ac2 = this.flightService.addAircraft('VT-CDF', 'Airbus A320');
    this.flightService.addSeatsToAircraft(ac2, 150, 24, 0);

    const ac3 = this.flightService.addAircraft('VT-EFG', 'Boeing 777');
    this.flightService.addSeatsToAircraft(ac3, 300, 50, 12);

    console.log(`✓ 3 aircraft configured\n`);
    console.log('Setting up flights...');

    // Use a fixed date (tomorrow at various hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dt = (h: number, m: number = 0): Date => {
      const d = new Date(tomorrow);
      d.setHours(h, m, 0, 0);
      return d;
    };

    this.flightService.addFlight('AI-101', ac1.id, 'Mumbai',    'Delhi',     dt(6,  0),  dt(8,  15), 4500);
    this.flightService.addFlight('AI-202', ac2.id, 'Delhi',     'Bangalore', dt(9,  0),  dt(11, 45), 5200);
    this.flightService.addFlight('AI-303', ac1.id, 'Mumbai',    'Chennai',   dt(14, 0),  dt(16, 10), 4800);
    this.flightService.addFlight('AI-404', ac3.id, 'Delhi',     'Mumbai',    dt(7,  30), dt(9,  45), 4200);
    this.flightService.addFlight('AI-505', ac2.id, 'Bangalore', 'Hyderabad', dt(11, 0),  dt(12, 15), 2800);
    this.flightService.addFlight('AI-606', ac3.id, 'Mumbai',    'Delhi',     dt(18, 0),  dt(20, 15), 4900);

    console.log(`✓ ${this.flightService.getAllFlights().length} flights scheduled\n`);
  }

  public displaySystemSummary(): void {
    Logger.header('SYSTEM SUMMARY');
    console.log(`Total Flights  : ${this.flightService.getAllFlights().length}`);
    Logger.separator();
  }
}
