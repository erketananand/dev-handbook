import { ATMService } from '../services/ATMService';
import { SetupService } from '../services/SetupService';
import { CashDispenser } from '../models/CashDispenser';

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════╗');
  console.log('║        Welcome to ATM System              ║');
  console.log('║    Low Level Design Implementation        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const setupService = new SetupService();
  const atmService = new ATMService();

  // Initialize sample data
  const { atm } = setupService.setupSampleData();

  // Initialize cash dispenser
  const cashDispenser = new CashDispenser(atm);

  // Main ATM loop
  let running = true;
  while (running) {
    // Display main menu
    const shouldContinue = await atmService.displayMainMenu();

    if (!shouldContinue) {
      running = false;
      break;
    }

    // User inserts card
    const session = await atmService.login(atm);

    if (!session) {
      console.log('❌ Card insertion failed. Please try again.\n');
      continue;
    }

    // Transaction menu loop
    let inTransaction = true;
    while (inTransaction && session.isActive()) {
      const choice = await atmService.displayTransactionMenu();

      switch (choice) {
        case '1':
          // Withdraw
          await atmService.handleWithdrawal(session, cashDispenser);
          break;

        case '2':
          // Deposit
          await atmService.handleDeposit(session, cashDispenser);
          break;

        case '3':
          // Check balance
          await atmService.handleBalanceEnquiry(session);
          break;

        case '4':
          // Mini statement
          await atmService.handleMiniStatement(session);
          break;

        case '5':
          // Change PIN
          await atmService.handlePinChange(session);
          break;

        case '6':
          // Logout
          atmService.logout(session);
          inTransaction = false;
          break;

        default:
          console.log('❌ Invalid choice. Please try again.');
          break;
      }
    }
  }

  atmService.close();
  console.log('\nApplication closed successfully.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
