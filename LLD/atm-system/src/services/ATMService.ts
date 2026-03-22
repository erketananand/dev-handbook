import * as readline from 'readline';
import { Card } from '../models/Card';
import { Account } from '../models/Account';
import { ATM } from '../models/ATM';
import { Session } from '../models/Session';
import { CashDispenser } from '../models/CashDispenser';
import { BankingService } from './BankingService';
import { ATMRepository } from '../repositories/ATMRepository';
import { ValidationUtil } from '../utils/ValidationUtil';
import { Transaction } from '../models/Transaction';

export class ATMService {
  private bankingService: BankingService;
  private atmRepository: ATMRepository;
  private currentSession: Session | null;
  private readline: readline.Interface;

  constructor() {
    this.bankingService = new BankingService();
    this.atmRepository = new ATMRepository();
    this.currentSession = null;
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.readline.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  public async displayMainMenu(): Promise<boolean> {
    console.log('\n==================== ATM Menu ====================');
    console.log('1. Insert Card');
    console.log('2. Exit');
    console.log('==============================================\n');

    const choice = await this.askQuestion('Enter your choice: ');

    if (choice === '1') {
      return true;
    } else if (choice === '2') {
      console.log('Thank you for using our ATM. Goodbye!');
      return false;
    } else {
      console.log('Invalid choice. Please try again.');
      return true;
    }
  }

  public async login(atm: ATM): Promise<Session | null> {
    const cardNumber = await this.askQuestion('Enter card number: ');
    const pin = await this.askQuestion('Enter PIN: ');

    const account = this.bankingService.authenticateCard(cardNumber, pin, atm.atmId);

    if (!account) {
      console.log('❌ Invalid card number or PIN. Authentication failed.');
      return null;
    }

    // Find the card to create session
    const cardRepo = new (require('../repositories/CardRepository').CardRepository)();
    const card = cardRepo.findByCardNumber(cardNumber);

    if (!card) {
      console.log('❌ Card not found.');
      return null;
    }

    const session = new Session(card, account, atm);
    this.currentSession = session;
    console.log('✓ Authentication successful. Welcome!');
    return session;
  }

  public async displayTransactionMenu(): Promise<string> {
    console.log('\n============== Transaction Menu ==============');
    console.log('1. Withdraw Cash');
    console.log('2. Deposit Cash');
    console.log('3. Check Balance');
    console.log('4. Mini Statement');
    console.log('5. Change PIN');
    console.log('6. Logout');
    console.log('==============================================\n');

    const choice = await this.askQuestion('Enter your choice: ');
    return choice;
  }

  public async handleWithdrawal(session: Session, cashDispenser: CashDispenser): Promise<void> {
    if (!session.isActive()) {
      console.log('❌ Session is not active.');
      return;
    }

    const amountStr = await this.askQuestion(
      `Enter amount to withdraw (max: ₹${ValidationUtil.getMaxWithdrawalPerTransaction()}): `
    );
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount)) {
      console.log('❌ Invalid amount. Please enter a valid number.');
      return;
    }

    console.log('Processing withdrawal...');
    const transaction = this.bankingService.withdrawal(
      session.card,
      session.account,
      amount,
      cashDispenser,
      session.atm.atmId
    );

    if (transaction && this.bankingService.validateTransaction(transaction)) {
      console.log('✓ Withdrawal successful!');
      console.log(`Amount withdrawn: ₹${amount.toFixed(2)}`);
      console.log(`Current balance: ₹${session.account.getBalance().toFixed(2)}`);
    } else {
      console.log('❌ Withdrawal failed. Please check your balance or try later.');
    }
  }

  public async handleDeposit(session: Session, cashDispenser: CashDispenser): Promise<void> {
    if (!session.isActive()) {
      console.log('❌ Session is not active.');
      return;
    }

    const amountStr = await this.askQuestion(
      `Enter amount to deposit (max: ₹${ValidationUtil.getMaxDepositPerTransaction()}): `
    );
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount)) {
      console.log('❌ Invalid amount. Please enter a valid number.');
      return;
    }

    console.log('Processing deposit...');
    const transaction = this.bankingService.deposit(
      session.card,
      session.account,
      amount,
      cashDispenser,
      session.atm.atmId
    );

    if (transaction && this.bankingService.validateTransaction(transaction)) {
      console.log('✓ Deposit successful!');
      console.log(`Amount deposited: ₹${amount.toFixed(2)}`);
      console.log(`Current balance: ₹${session.account.getBalance().toFixed(2)}`);
    } else {
      console.log('❌ Deposit failed. Please try again.');
    }
  }

  public async handleBalanceEnquiry(session: Session): Promise<void> {
    if (!session.isActive()) {
      console.log('❌ Session is not active.');
      return;
    }

    const balance = this.bankingService.getBalance(session.account);
    console.log('\n============== Balance Enquiry ==============');
    console.log(`Account Number: ${session.account.accountNumber}`);
    console.log(`Current Balance: ₹${balance.toFixed(2)}`);
    console.log('============================================\n');
  }

  public async handleMiniStatement(session: Session): Promise<void> {
    if (!session.isActive()) {
      console.log('❌ Session is not active.');
      return;
    }

    const transactions = this.bankingService.getMiniStatement(session.account, 5);

    console.log('\n============== Mini Statement ==============');
    console.log(`Account: ${session.account.accountNumber}`);
    console.log('Last 5 Transactions:');

    if (transactions.length === 0) {
      console.log('No transactions found.');
    } else {
      transactions.forEach((txn, index) => {
        console.log(
          `${index + 1}. ${txn.getDescription()} | Status: ${txn.status}`
        );
      });
    }

    console.log('===========================================\n');
  }

  public async handlePinChange(session: Session): Promise<void> {
    if (!session.isActive()) {
      console.log('❌ Session is not active.');
      return;
    }

    const oldPin = await this.askQuestion('Enter current PIN: ');
    const newPin = await this.askQuestion('Enter new PIN (4-6 digits): ');
    const confirmPin = await this.askQuestion('Confirm new PIN: ');

    if (newPin !== confirmPin) {
      console.log('❌ PIN mismatch. PIN change failed.');
      return;
    }

    if (!ValidationUtil.isValidPin(newPin)) {
      console.log('❌ Invalid PIN format. PIN must be 4-6 digits.');
      return;
    }

    if (this.bankingService.changePin(session.card, oldPin, newPin)) {
      console.log('✓ PIN changed successfully!');
    } else {
      console.log('❌ PIN change failed. Incorrect current PIN.');
    }
  }

  public logout(session: Session): void {
    session.close();
    this.currentSession = null;
    console.log('✓ Thank you for using ATM. Please don\'t forget your card!');
  }

  public close(): void {
    this.readline.close();
  }
}
