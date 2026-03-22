import { Flight } from '../models/Flight';
import { Aircraft } from '../models/Aircraft';
import { Seat } from '../models/Seat';
import { FlightRepository } from '../repositories/FlightRepository';
import { AircraftRepository } from '../repositories/AircraftRepository';
import { SeatClass } from '../enums/SeatClass';
import { FlightStatus } from '../enums/FlightStatus';
import { IFlightSortStrategy } from '../strategies/sort/IFlightSortStrategy';
import { SortByPrice } from '../strategies/sort/SortByPrice';
import { BookingNotifier } from '../observers/BookingNotifier';
import { Logger } from '../utils/Logger';

export class FlightService {
  private flightRepo = new FlightRepository();
  private aircraftRepo = new AircraftRepository();
  private notifier = BookingNotifier.getInstance();

  // ========== AIRCRAFT ==========

  public addAircraft(registration: string, model: string): Aircraft {
    const aircraft = new Aircraft(registration, model);
    this.aircraftRepo.save(aircraft);
    Logger.success(`Aircraft added: ${aircraft.getDisplayInfo()}`);
    return aircraft;
  }

  public addSeatsToAircraft(
    aircraft: Aircraft,
    economyCount: number,
    businessCount: number,
    firstCount: number
  ): void {
    let seatNum = 1;

    for (let i = 0; i < firstCount; i++, seatNum++) {
      aircraft.addSeat(new Seat(`F${seatNum}`, SeatClass.FIRST, aircraft.id));
    }
    for (let i = 0; i < businessCount; i++, seatNum++) {
      aircraft.addSeat(new Seat(`B${seatNum}`, SeatClass.BUSINESS, aircraft.id));
    }
    for (let i = 0; i < economyCount; i++, seatNum++) {
      aircraft.addSeat(new Seat(`E${seatNum}`, SeatClass.ECONOMY, aircraft.id));
    }

    this.aircraftRepo.update(aircraft);
  }

  public getAircraftById(id: string): Aircraft | undefined {
    return this.aircraftRepo.findById(id);
  }

  // ========== FLIGHTS ==========

  public addFlight(
    flightNumber: string,
    aircraftId: string,
    source: string,
    destination: string,
    departureTime: Date,
    arrivalTime: Date,
    basePrice: number
  ): Flight | null {
    const aircraft = this.aircraftRepo.findById(aircraftId);
    if (!aircraft) {
      Logger.error(`Aircraft ${aircraftId} not found.`);
      return null;
    }

    const flight = new Flight(
      flightNumber, aircraft, source, destination,
      departureTime, arrivalTime, basePrice
    );

    this.flightRepo.save(flight);
    Logger.success(`Flight ${flightNumber} added: ${source} → ${destination}`);
    return flight;
  }

  public searchFlights(
    source: string,
    destination: string,
    date: Date,
    sortStrategy?: IFlightSortStrategy
  ): Flight[] {
    const dateKey = date.toISOString().split('T')[0];
    const flights = this.flightRepo
      .findByRoute(source, destination)
      .filter(f => {
        const flightDate = f.departureTime.toISOString().split('T')[0];
        return flightDate === dateKey && f.status !== FlightStatus.CANCELLED;
      });

    const strategy = sortStrategy || new SortByPrice();
    return strategy.sort(flights);
  }

  public getFlightById(id: string): Flight | undefined {
    return this.flightRepo.findById(id);
  }

  public getFlightByNumber(flightNumber: string): Flight | undefined {
    return this.flightRepo.findByFlightNumber(flightNumber);
  }

  public getAllFlights(): Flight[] {
    return this.flightRepo.findAll();
  }

  public updateFlightStatus(flightId: string, status: FlightStatus): boolean {
    const flight = this.flightRepo.findById(flightId);
    if (!flight) return false;
    flight.updateStatus(status);
    this.flightRepo.update(flight);
    this.notifier.notifyFlightStatusChanged(flight);
    return true;
  }

  // ========== DISPLAY ==========

  public displayAllFlights(): void {
    const flights = this.getAllFlights();
    if (flights.length === 0) {
      console.log('No flights available.');
      return;
    }
    console.log('\n' + '='.repeat(80));
    console.log('No.  ' + 'Flight'.padEnd(10) + 'Route'.padEnd(30) + 'Departure'.padEnd(22) + 'Price');
    console.log('-'.repeat(80));
    flights.forEach((f, i) => {
      const route = `${f.source} → ${f.destination}`;
      const dept = f.departureTime.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
      console.log(`${(i + 1).toString().padEnd(5)}${f.flightNumber.padEnd(10)}${route.padEnd(30)}${dept.padEnd(22)}₹${f.basePrice}`);
    });
    console.log('='.repeat(80));
  }

  public displayFlightDetails(flight: Flight): void {
    console.log('\n' + '='.repeat(80));
    console.log(`FLIGHT DETAILS: ${flight.flightNumber}`);
    console.log('='.repeat(80));
    console.log(`Aircraft : ${flight.aircraft.model} (${flight.aircraft.registration})`);
    console.log(`Route    : ${flight.source} → ${flight.destination}`);
    console.log(`Departure: ${flight.departureTime.toLocaleString()}`);
    console.log(`Arrival  : ${flight.arrivalTime.toLocaleString()}`);
    const dur = flight.getDurationMinutes();
    console.log(`Duration : ${Math.floor(dur / 60)}h ${dur % 60}m`);
    console.log(`Status   : ${flight.status}`);
    console.log('\nSeat Availability:');
    for (const cls of [SeatClass.FIRST, SeatClass.BUSINESS, SeatClass.ECONOMY]) {
      const avail = flight.getAvailableCount(cls);
      const price = flight.getPriceForClass(cls);
      console.log(`  ${cls.padEnd(12)}: ${avail.toString().padEnd(4)} available | ₹${price}`);
    }
    console.log('='.repeat(80) + '\n');
  }
}
