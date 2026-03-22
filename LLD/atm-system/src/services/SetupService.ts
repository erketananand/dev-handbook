import { Card } from '../models/Card';
import { Account } from '../models/Account';
import { ATM } from '../models/ATM';
import { CardRepository } from '../repositories/CardRepository';
import { AccountRepository } from '../repositories/AccountRepository';
import { ATMRepository } from '../repositories/ATMRepository';
import { IdGenerator } from '../utils/IdGenerator';

export class SetupService {
  private cardRepository: CardRepository;
  private accountRepository: AccountRepository;
  private atmRepository: ATMRepository;

  constructor() {
    this.cardRepository = new CardRepository();
    this.accountRepository = new AccountRepository();
    this.atmRepository = new ATMRepository();
  }

  public setupSampleData(): { atm: ATM; card: Card; account: Account } {
    // Create sample accounts
    const account1 = new Account(IdGenerator.generateAccountNumber(), 50000);
    const account2 = new Account(IdGenerator.generateAccountNumber(), 100000);
    const account3 = new Account(IdGenerator.generateAccountNumber(), 75000);

    this.accountRepository.save(account1);
    this.accountRepository.save(account2);
    this.accountRepository.save(account3);

    // Create sample cards
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);

    const card1 = new Card(
      IdGenerator.generateCardNumber(),
      account1.id,
      '1234',
      expiryDate
    );
    const card2 = new Card(
      IdGenerator.generateCardNumber(),
      account2.id,
      '5678',
      expiryDate
    );
    const card3 = new Card(
      IdGenerator.generateCardNumber(),
      account3.id,
      '9012',
      expiryDate
    );

    this.cardRepository.save(card1);
    this.cardRepository.save(card2);
    this.cardRepository.save(card3);

    // Create sample ATM
    const atm = new ATM(
      IdGenerator.generateAtmId(),
      '123 Main Street, Downtown',
      500000
    );

    // Stock the ATM with cash (denominations: 2000, 500, 100)
    atm.addDenomination(2000, 100); // 200,000
    atm.addDenomination(500, 200); // 100,000
    atm.addDenomination(100, 500); // 50,000
    // Total: 350,000

    this.atmRepository.save(atm);

    // Print sample data for testing
    console.log('\n==================== Sample Data Initialized ====================');
    console.log('\n--- Sample Accounts ---');
    console.log(`1. ${account1.getDisplayInfo()}`);
    console.log(`2. ${account2.getDisplayInfo()}`);
    console.log(`3. ${account3.getDisplayInfo()}`);

    console.log('\n--- Sample Cards ---');
    console.log(`1. Card: ${card1.getDisplayInfo()}`);
    console.log(`   PIN: 1234 | Account: ${account1.accountNumber}`);
    console.log(`2. Card: ${card2.getDisplayInfo()}`);
    console.log(`   PIN: 5678 | Account: ${account2.accountNumber}`);
    console.log(`3. Card: ${card3.getDisplayInfo()}`);
    console.log(`   PIN: 9012 | Account: ${account3.accountNumber}`);

    console.log('\n--- ATM Details ---');
    console.log(`${atm.getDisplayInfo()}`);

    console.log('\n==============================================================\n');

    return { atm, card: card1, account: account1 };
  }

  public getATM(atmId: string): ATM | undefined {
    return this.atmRepository.findByAtmId(atmId);
  }

  public getAllATMs(): ATM[] {
    return this.atmRepository.getAll();
  }
}
