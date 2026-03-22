import * as readline from 'readline';
import { CustomerService } from '../services/CustomerService';
import { VehicleService } from '../services/VehicleService';
import { RentalService } from '../services/RentalService';
import { PaymentService } from '../services/PaymentService';
import { SetupService } from '../services/SetupService';
import { InMemoryDatabase } from '../database/InMemoryDatabase';
import { CarType, FuelType, InsuranceType, PaymentMethod } from '../enums';
import { Insurance } from '../models/Insurance';

export class ConsoleInterface {
  private rl: readline.Interface;
  private customerService: CustomerService;
  private vehicleService: VehicleService;
  private rentalService: RentalService;
  private paymentService: PaymentService;
  private db: InMemoryDatabase;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.customerService = new CustomerService();
    this.vehicleService = new VehicleService();
    this.rentalService = new RentalService();
    this.paymentService = new PaymentService();
    this.db = InMemoryDatabase.getInstance();

    const setupService = new SetupService();
    setupService.initializeSystem();
    setupService.displaySummary();
  }

  public start(): void {
    this.mainMenu();
  }

  private mainMenu(): void {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   CAR RENTAL SYSTEM - MAIN MENU        ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║ 1. Customer Management                 ║');
    console.log('║ 2. Vehicle Management                  ║');
    console.log('║ 3. Book a Car (Create Reservation)     ║');
    console.log('║ 4. Manage Reservations                 ║');
    console.log('║ 5. Payment Management                  ║');
    console.log('║ 6. View System Status                  ║');
    console.log('║ 7. Exit                                ║');
    console.log('╚════════════════════════════════════════╝');

    this.prompt('Select option (1-7): ', input => {
      switch (input.trim()) {
        case '1':
          this.customerMenu();
          break;
        case '2':
          this.vehicleMenu();
          break;
        case '3':
          this.bookCar();
          break;
        case '4':
          this.reservationMenu();
          break;
        case '5':
          this.paymentMenu();
          break;
        case '6':
          this.displaySystemStatus();
          this.mainMenu();
          break;
        case '7':
          this.exit();
          break;
        default:
          console.log('Invalid option. Please try again.');
          this.mainMenu();
      }
    });
  }

  private customerMenu(): void {
    console.log('\n--- Customer Management ---');
    console.log('1. Register New Customer');
    console.log('2. View All Customers');
    console.log('3. View Customer Details');
    console.log('4. Back to Main Menu');

    this.prompt('Select option (1-4): ', input => {
      switch (input.trim()) {
        case '1':
          this.registerCustomer();
          break;
        case '2':
          this.viewAllCustomers();
          break;
        case '3':
          this.viewCustomerDetails();
          break;
        case '4':
          this.mainMenu();
          break;
        default:
          console.log('Invalid option.');
          this.customerMenu();
      }
    });
  }

  private registerCustomer(): void {
    this.prompt('Enter name: ', name => {
      this.prompt('Enter email: ', email => {
        this.prompt('Enter phone: ', phone => {
          this.prompt('Enter driver license: ', license => {
            this.prompt('Enter address: ', address => {
              try {
                const licenseExpiry = new Date();
                licenseExpiry.setFullYear(licenseExpiry.getFullYear() + 5);

                const customer = this.customerService.register(
                  name,
                  email,
                  phone,
                  license,
                  licenseExpiry,
                  address
                );

                if (customer) {
                  console.log(`✓ Customer registered successfully. ID: ${customer.id}`);
                }
              } catch (err) {
                console.log(`✗ Error: ${err instanceof Error ? err.message : 'Registration failed'}`);
              }

              this.customerMenu();
            });
          });
        });
      });
    });
  }

  private viewAllCustomers(): void {
    const customers = this.customerService.getAllCustomers();

    if (customers.length === 0) {
      console.log('No customers found.');
    } else {
      console.log(`\nCustomers (${customers.length}):`);
      customers.forEach((c, idx) => {
        console.log(`${idx + 1}. ${c.getDisplayInfo()}`);
      });
    }

    this.customerMenu();
  }

  private viewCustomerDetails(): void {
    this.prompt('Enter customer email or ID: ', input => {
      let customer = this.customerService.getCustomerByEmail(input);
      if (!customer) {
        customer = this.customerService.getCustomerById(input);
      }

      if (customer) {
        console.log(`\nCustomer Details:`);
        console.log(`  ID: ${customer.id}`);
        console.log(`  Name: ${customer.name}`);
        console.log(`  Email: ${customer.email}`);
        console.log(`  Phone: ${customer.phone}`);
        console.log(`  License: ${customer.driverLicense}`);
        console.log(`  License Valid: ${customer.isLicenseValid() ? 'Yes' : 'No'}`);
        console.log(`  Address: ${customer.address}`);

        const reservations = this.rentalService.getCustomerReservations(customer.id);
        console.log(`  Total Reservations: ${reservations.length}`);
      } else {
        console.log('Customer not found.');
      }

      this.customerMenu();
    });
  }

  private vehicleMenu(): void {
    console.log('\n--- Vehicle Management ---');
    console.log('1. Add New Vehicle');
    console.log('2. View All Vehicles');
    console.log('3. View Available Vehicles');
    console.log('4. View Fleet Status');
    console.log('5. Back to Main Menu');

    this.prompt('Select option (1-5): ', input => {
      switch (input.trim()) {
        case '1':
          this.addVehicle();
          break;
        case '2':
          this.viewAllVehicles();
          break;
        case '3':
          this.viewAvailableVehicles();
          break;
        case '4':
          this.viewFleetStatus();
          break;
        case '5':
          this.mainMenu();
          break;
        default:
          console.log('Invalid option.');
          this.vehicleMenu();
      }
    });
  }

  private addVehicle(): void {
    this.prompt('Enter license plate: ', licensePlate => {
      this.prompt('Enter brand: ', brand => {
        this.prompt('Enter model: ', model => {
          this.prompt('Enter year: ', year => {
            this.prompt('Enter base price per day: ', price => {
              try {
                const car = this.vehicleService.addCar(
                  licensePlate,
                  brand,
                  model,
                  parseInt(year),
                  CarType.SEDAN,
                  FuelType.PETROL,
                  5,
                  'Black',
                  parseFloat(price)
                );

                console.log(`✓ Vehicle added successfully. ID: ${car.id}`);
              } catch (err) {
                console.log(`✗ Error: ${err instanceof Error ? err.message : 'Failed to add vehicle'}`);
              }

              this.vehicleMenu();
            });
          });
        });
      });
    });
  }

  private viewAllVehicles(): void {
    const cars = this.vehicleService.getAllCars();

    if (cars.length === 0) {
      console.log('No vehicles found.');
    } else {
      console.log(`\nVehicles (${cars.length}):`);
      cars.forEach((car, idx) => {
        console.log(`${idx + 1}. ${car.getDisplayInfo()}`);
      });
    }

    this.vehicleMenu();
  }

  private viewAvailableVehicles(): void {
    const cars = this.vehicleService.getAvailableCars();

    if (cars.length === 0) {
      console.log('No available vehicles.');
    } else {
      console.log(`\nAvailable Vehicles (${cars.length}):`);
      cars.forEach((car, idx) => {
        console.log(`${idx + 1}. ${car.getDisplayInfo()}`);
      });
    }

    this.vehicleMenu();
  }

  private viewFleetStatus(): void {
    console.log(`\n${this.vehicleService.getFleetStatus()}`);
    this.vehicleMenu();
  }

  private bookCar(): void {
    this.prompt('Enter customer email: ', email => {
      const customer = this.customerService.getCustomerByEmail(email);

      if (!customer) {
        console.log('Customer not found.');
        this.mainMenu();
        return;
      }

      const cars = this.vehicleService.getAvailableCars();
      if (cars.length === 0) {
        console.log('No available vehicles.');
        this.mainMenu();
        return;
      }

      console.log('\nAvailable Vehicles:');
      cars.forEach((car, idx) => {
        console.log(`${idx + 1}. ${car.getDisplayInfo()}`);
      });

      this.prompt('Select vehicle (number): ', selectionStr => {
        const idx = parseInt(selectionStr) - 1;
        if (idx < 0 || idx >= cars.length) {
          console.log('Invalid selection.');
          this.mainMenu();
          return;
        }

        const selectedCar = cars[idx];

        this.prompt('Enter number of days: ', daysStr => {
          const days = parseInt(daysStr);
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + days);

          try {
            const locations = this.db.getAllLocations();
            const pickupLocation = locations.length > 0 ? locations[0].name : 'Downtown';
            const dropoffLocation = locations.length > 1 ? locations[1].name : 'Airport';

            const reservation = this.rentalService.createReservation(
              customer.id,
              selectedCar.id,
              startDate,
              endDate,
              pickupLocation,
              dropoffLocation,
              selectedCar.basePrice
            );

            if (reservation) {
              console.log(`✓ Reservation created: ${reservation.reservationNumber}`);
              console.log(`  Total: ₹${reservation.totalPrice.toFixed(2)}`);

              this.rentalService.confirmReservation(reservation.id);

              const payment = this.paymentService.createPayment(
                reservation.id,
                PaymentMethod.CREDIT_CARD,
                reservation.totalPrice
              );

              this.paymentService.processPayment(payment.id);
              console.log(`✓ Payment processed. Transaction: ${payment.transactionId}`);

              const insurance = new Insurance(reservation.id, InsuranceType.BASIC, reservation.totalPrice);
              this.db.saveInsurance(insurance);
              console.log(`✓ Insurance added: ${insurance.getDisplayInfo()}`);
            }
          } catch (err) {
            console.log(`✗ Error: ${err instanceof Error ? err.message : 'Booking failed'}`);
          }

          this.mainMenu();
        });
      });
    });
  }

  private reservationMenu(): void {
    console.log('\n--- Reservation Management ---');
    console.log('1. View All Reservations');
    console.log('2. View Reservation Details');
    console.log('3. Cancel Reservation');
    console.log('4. Back to Main Menu');

    this.prompt('Select option (1-4): ', input => {
      switch (input.trim()) {
        case '1':
          this.viewAllReservations();
          break;
        case '2':
          this.viewReservationDetails();
          break;
        case '3':
          this.cancelReservation();
          break;
        case '4':
          this.mainMenu();
          break;
        default:
          console.log('Invalid option.');
          this.reservationMenu();
      }
    });
  }

  private viewAllReservations(): void {
    const reservations = this.db.reservationRepository.getAllReservations();

    if (reservations.length === 0) {
      console.log('No reservations found.');
    } else {
      console.log(`\nReservations (${reservations.length}):`);
      reservations.forEach((res, idx) => {
        console.log(`${idx + 1}. ${res.getDisplayInfo()}`);
      });
    }

    this.reservationMenu();
  }

  private viewReservationDetails(): void {
    this.prompt('Enter reservation number: ', resNumber => {
      const reservation = this.rentalService.getReservationByNumber(resNumber);

      if (reservation) {
        const customer = this.customerService.getCustomerById(reservation.customerId);
        const car = this.vehicleService.getCarById(reservation.carId);

        console.log(`\nReservation Details:`);
        console.log(`  Number: ${reservation.reservationNumber}`);
        console.log(`  Customer: ${customer?.name || 'Unknown'}`);
        console.log(`  Vehicle: ${car?.getDisplayInfo() || 'Unknown'}`);
        console.log(`  Period: ${reservation.startDate.toLocaleDateString()} - ${reservation.endDate.toLocaleDateString()}`);
        console.log(`  Total Price: ₹${reservation.totalPrice.toFixed(2)}`);
        console.log(`  Status: ${reservation.status}`);
      } else {
        console.log('Reservation not found.');
      }

      this.reservationMenu();
    });
  }

  private cancelReservation(): void {
    this.prompt('Enter reservation number: ', resNumber => {
      const reservation = this.rentalService.getReservationByNumber(resNumber);

      if (!reservation) {
        console.log('Reservation not found.');
        this.reservationMenu();
        return;
      }

      try {
        this.rentalService.cancelReservation(reservation.id);
        console.log('✓ Reservation cancelled successfully.');
      } catch (err) {
        console.log(`✗ Error: ${err instanceof Error ? err.message : 'Cancellation failed'}`);
      }

      this.reservationMenu();
    });
  }

  private paymentMenu(): void {
    console.log('\n--- Payment Management ---');
    console.log('1. View All Payments');
    console.log('2. View Payment Summary');
    console.log('3. Back to Main Menu');

    this.prompt('Select option (1-3): ', input => {
      switch (input.trim()) {
        case '1':
          this.viewAllPayments();
          break;
        case '2':
          this.viewPaymentSummary();
          break;
        case '3':
          this.mainMenu();
          break;
        default:
          console.log('Invalid option.');
          this.paymentMenu();
      }
    });
  }

  private viewAllPayments(): void {
    const payments = this.paymentService.getAllPayments();

    if (payments.length === 0) {
      console.log('No payments found.');
    } else {
      console.log(`\nPayments (${payments.length}):`);
      payments.forEach((pay, idx) => {
        console.log(`${idx + 1}. ${pay.getDisplayInfo()}`);
      });
    }

    this.paymentMenu();
  }

  private viewPaymentSummary(): void {
    console.log(`\n${this.paymentService.getPaymentSummary()}`);
    this.paymentMenu();
  }

  private displaySystemStatus(): void {
    console.log(`\n${this.db.getSystemStatus()}`);
  }

  private prompt(question: string, callback: (answer: string) => void): void {
    this.rl.question(question, answer => {
      callback(answer);
    });
  }

  private exit(): void {
    console.log('\nThank you for using Car Rental System. Goodbye!');
    this.rl.close();
  }
}
