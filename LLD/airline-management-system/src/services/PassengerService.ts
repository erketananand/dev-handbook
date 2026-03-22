import { Passenger } from '../models/Passenger';
import { PassengerRepository } from '../repositories/PassengerRepository';
import { Logger } from '../utils/Logger';

export class PassengerService {
  private passengerRepo = new PassengerRepository();

  public register(
    name: string,
    email: string,
    phone: string,
    passportNumber?: string
  ): Passenger | null {
    if (this.passengerRepo.findByEmail(email)) {
      Logger.error(`Passenger with email ${email} already exists.`);
      return null;
    }

    const passenger = new Passenger(name, email, phone, passportNumber || null);

    if (!passenger.isValid()) {
      Logger.error('Invalid passenger details.');
      return null;
    }

    this.passengerRepo.save(passenger);
    Logger.success(`Passenger registered: ${passenger.name} (${passenger.email})`);
    return passenger;
  }

  public getByEmail(email: string): Passenger | undefined {
    return this.passengerRepo.findByEmail(email);
  }

  public getById(id: string): Passenger | undefined {
    return this.passengerRepo.findById(id);
  }

  public getAllPassengers(): Passenger[] {
    return this.passengerRepo.findAll();
  }

  public displayAllPassengers(): void {
    const all = this.passengerRepo.findAll();
    if (all.length === 0) {
      console.log('No passengers registered.');
      return;
    }
    console.log('\nRegistered Passengers:');
    all.forEach((p, i) => console.log(`  ${i + 1}. ${p.getDisplayInfo()}`));
  }
}
