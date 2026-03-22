import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { CustomerService } from './CustomerService';
import { VehicleService } from './VehicleService';
import { RentalService } from './RentalService';
import { PaymentService } from './PaymentService';
import { CarType, FuelType, InsuranceType, PaymentMethod } from '../enums';
import { RentalLocation } from '../models/RentalLocation';
import { Insurance } from '../models/Insurance';

export class SetupService {
  private db: InMemoryDatabase;
  private customerService: CustomerService;
  private vehicleService: VehicleService;
  private rentalService: RentalService;
  private paymentService: PaymentService;

  constructor() {
    this.db = InMemoryDatabase.getInstance();
    this.customerService = new CustomerService();
    this.vehicleService = new VehicleService();
    this.rentalService = new RentalService();
    this.paymentService = new PaymentService();
  }

  public initializeSystem(): void {
    this.clearData();
    this.createLocations();
    this.createCustomers();
    this.createVehicles();
    this.createReservationsAndPayments();
  }

  private clearData(): void {
    this.db.clearAll();
  }

  private createLocations(): void {
    const locations = [
      {
        name: 'Downtown Branch',
        address: '123 Main Street',
        city: 'New Delhi',
        phone: '011-2345-6789',
        operatingHours: '9:00 AM - 9:00 PM'
      },
      {
        name: 'Airport Branch',
        address: 'Terminal 3, Indira Gandhi International Airport',
        city: 'New Delhi',
        phone: '011-5678-9012',
        operatingHours: '24/7'
      },
      {
        name: 'Bangalore Branch',
        address: '456 MG Road',
        city: 'Bangalore',
        phone: '080-1234-5678',
        operatingHours: '8:00 AM - 8:00 PM'
      }
    ];

    locations.forEach(locData => {
      const location = new RentalLocation(
        locData.name,
        locData.address,
        locData.city,
        locData.phone,
        locData.operatingHours
      );
      this.db.saveLocation(location);
    });
  }

  private createCustomers(): void {
    const customers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '9876543210',
        driverLicense: 'DL5K9BX2FM',
        licenseExpiry: new Date(2027, 11, 31),
        address: '42 Elm Street, New Delhi'
      },
      {
        name: 'Priya Singh',
        email: 'priya.singh@email.com',
        phone: '9876543211',
        driverLicense: 'DL7M2KL9QR',
        licenseExpiry: new Date(2026, 5, 15),
        address: 'Bangalore Tech Park, Bangalore'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@email.com',
        phone: '9876543212',
        driverLicense: 'DL3N8XY1WS',
        licenseExpiry: new Date(2028, 3, 20),
        address: '789 Oak Avenue, Mumbai'
      }
    ];

    customers.forEach(custData => {
      this.customerService.register(
        custData.name,
        custData.email,
        custData.phone,
        custData.driverLicense,
        custData.licenseExpiry,
        custData.address
      );
    });
  }

  private createVehicles(): void {
    const vehicles = [
      {
        licensePlate: 'DL01AB1234',
        brand: 'Toyota',
        model: 'Innova Crysta',
        year: 2023,
        carType: CarType.VAN,
        fuelType: FuelType.DIESEL,
        seatCapacity: 7,
        color: 'Silver',
        basePrice: 3500
      },
      {
        licensePlate: 'DL01AB1235',
        brand: 'Hyundai',
        model: 'Creta',
        year: 2023,
        carType: CarType.SUV,
        fuelType: FuelType.PETROL,
        seatCapacity: 5,
        color: 'White',
        basePrice: 2500
      },
      {
        licensePlate: 'DL01AB1236',
        brand: 'Maruti',
        model: 'Swift',
        year: 2022,
        carType: CarType.HATCHBACK,
        fuelType: FuelType.PETROL,
        seatCapacity: 5,
        color: 'Red',
        basePrice: 1500
      },
      {
        licensePlate: 'DL01AB1237',
        brand: 'Honda',
        model: 'Accord',
        year: 2023,
        carType: CarType.SEDAN,
        fuelType: FuelType.PETROL,
        seatCapacity: 5,
        color: 'Black',
        basePrice: 2800
      },
      {
        licensePlate: 'DL01AB1238',
        brand: 'Mahindra',
        model: 'XUV700',
        year: 2023,
        carType: CarType.SUV,
        fuelType: FuelType.DIESEL,
        seatCapacity: 7,
        color: 'Blue',
        basePrice: 3200
      }
    ];

    vehicles.forEach(vehData => {
      this.vehicleService.addCar(
        vehData.licensePlate,
        vehData.brand,
        vehData.model,
        vehData.year,
        vehData.carType,
        vehData.fuelType,
        vehData.seatCapacity,
        vehData.color,
        vehData.basePrice
      );
    });
  }

  private createReservationsAndPayments(): void {
    const customers = this.customerService.getAllCustomers();
    const cars = this.vehicleService.getAllCars();

    if (customers.length >= 2 && cars.length >= 2) {
      // Reservation 1
      const startDate1 = new Date();
      startDate1.setDate(startDate1.getDate() + 5);
      const endDate1 = new Date(startDate1);
      endDate1.setDate(endDate1.getDate() + 3);

      const reservation1 = this.rentalService.createReservation(
        customers[0].id,
        cars[0].id,
        startDate1,
        endDate1,
        'Downtown Branch',
        'Airport Branch',
        cars[0].basePrice
      );

      if (reservation1) {
        this.rentalService.confirmReservation(reservation1.id);

        const payment1 = this.paymentService.createPayment(
          reservation1.id,
          PaymentMethod.CREDIT_CARD,
          reservation1.totalPrice
        );
        this.paymentService.processPayment(payment1.id);

        const insurance1 = new Insurance(reservation1.id, InsuranceType.PREMIUM, reservation1.totalPrice);
        this.db.saveInsurance(insurance1);
      }

      // Reservation 2
      const startDate2 = new Date();
      startDate2.setDate(startDate2.getDate() + 7);
      const endDate2 = new Date(startDate2);
      endDate2.setDate(endDate2.getDate() + 5);

      const reservation2 = this.rentalService.createReservation(
        customers[1].id,
        cars[1].id,
        startDate2,
        endDate2,
        'Airport Branch',
        'Downtown Branch',
        cars[1].basePrice
      );

      if (reservation2) {
        this.rentalService.confirmReservation(reservation2.id);

        const payment2 = this.paymentService.createPayment(
          reservation2.id,
          PaymentMethod.DEBIT_CARD,
          reservation2.totalPrice
        );
        this.paymentService.processPayment(payment2.id);

        const insurance2 = new Insurance(reservation2.id, InsuranceType.BASIC, reservation2.totalPrice);
        this.db.saveInsurance(insurance2);
      }
    }
  }

  public displaySummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('SYSTEM INITIALIZED - SAMPLE DATA LOADED');
    console.log('='.repeat(50));

    const customers = this.customerService.getAllCustomers();
    console.log(`\nCustomers (${customers.length}):`);
    customers.forEach(c => console.log(`  • ${c.getDisplayInfo()}`));

    const cars = this.vehicleService.getAllCars();
    console.log(`\nVehicles (${cars.length}):`);
    cars.forEach(car => console.log(`  • ${car.getDisplayInfo()}`));

    const locations = this.db.getAllLocations();
    console.log(`\nLocations (${locations.length}):`);
    locations.forEach(loc => console.log(`  • ${loc.getDisplayInfo()}`));

    const reservations = this.db.reservationRepository.getAllReservations();
    console.log(`\nReservations (${reservations.length}):`);
    reservations.forEach(res => console.log(`  • ${res.getDisplayInfo()}`));

    const payments = this.paymentService.getAllPayments();
    console.log(`\nPayments (${payments.length}):`);
    payments.forEach(pay => console.log(`  • ${pay.getDisplayInfo()}`));

    console.log('\n' + this.paymentService.getPaymentSummary());
    console.log('\n' + this.vehicleService.getFleetStatus());
    console.log('='.repeat(50) + '\n');
  }
}
