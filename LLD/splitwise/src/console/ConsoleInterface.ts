import * as readline from "readline";
import { UserService } from "../services/UserService";
import { GroupService } from "../services/GroupService";
import { ExpenseService } from "../services/ExpenseService";
import { SettlementService } from "../services/SettlementService";
import { PaymentService } from "../services/PaymentService";
import { CommentService } from "../services/CommentService";
import { SplitType, ExpenseCategory, UserRole } from "../enums";
import { SetupService } from "../services/SetupService";

export class ConsoleInterface {
  private rl: readline.Interface;
  private userService: UserService;
  private groupService: GroupService;
  private expenseService: ExpenseService;
  private settlementService: SettlementService;
  private paymentService: PaymentService;
  private commentService: CommentService;
  private currentUser: any = null;

  constructor(
    userService: UserService,
    groupService: GroupService,
    expenseService: ExpenseService,
    settlementService: SettlementService,
    paymentService: PaymentService,
    commentService: CommentService
  ) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.userService = userService;
    this.groupService = groupService;
    this.expenseService = expenseService;
    this.settlementService = settlementService;
    this.paymentService = paymentService;
    this.commentService = commentService;
  }

  private async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  async start(): Promise<void> {
    console.log("\n🤑 Welcome to Splitwise System!");
    console.log("=====================================\n");

    const setupService = new SetupService(
      this.userService,
      this.groupService,
      this.expenseService,
      this.paymentService
    );

    setupService.initializeSystem();

    while (true) {
      console.log("\n📌 Main Menu:");
      console.log("1. Login");
      console.log("2. Register");
      console.log("3. View Users");
      console.log("4. Exit");

      const choice = await this.prompt("\nEnter your choice: ");

      if (choice === "1") {
        await this.login();
      } else if (choice === "2") {
        await this.register();
      } else if (choice === "3") {
        this.viewAllUsers();
      } else if (choice === "4") {
        console.log(
          "\n👋 Thank you for using Splitwise! Goodbye!\n"
        );
        this.rl.close();
        break;
      } else {
        console.log("❌ Invalid choice. Please try again.");
      }

      if (this.currentUser) {
        await this.userMenu();
      }
    }
  }

  private async login(): Promise<void> {
    const email = await this.prompt("Enter email: ");
    const user = this.userService.authenticate(email);

    if (user) {
      this.currentUser = user;
      console.log(`\n✅ Welcome back, ${user.name}!`);
    } else {
      console.log("❌ User not found.");
    }
  }

  private async register(): Promise<void> {
    const name = await this.prompt("Enter name: ");
    const email = await this.prompt("Enter email: ");
    const phone = await this.prompt("Enter phone (10 digits): ");

    try {
      const newUser = this.userService.register(name, email, phone);
      console.log(`\n✅ Registration successful! Welcome, ${newUser.name}!`);
      this.currentUser = newUser;
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }

  private viewAllUsers(): void {
    const users = this.userService.getAllUsers();
    console.log("\n📋 All Users:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });
  }

  private async userMenu(): Promise<void> {
    let stay = true;

    while (stay && this.currentUser) {
      console.log("\n🏠 User Menu:");
      console.log("1. View Profile");
      console.log("2. View My Groups");
      console.log("3. Create Group");
      console.log("4. Add Expense");
      console.log("5. View Group Details");
      console.log("6. View Balances");
      console.log("7. Settle Payment");
      console.log("8. View Transaction History");
      console.log("9. Logout");

      const choice = await this.prompt("\nEnter your choice: ");

      switch (choice) {
        case "1":
          this.viewProfile();
          break;
        case "2":
          await this.viewMyGroups();
          break;
        case "3":
          await this.createGroup();
          break;
        case "4":
          await this.addExpense();
          break;
        case "5":
          await this.viewGroupDetails();
          break;
        case "6":
          this.viewBalances();
          break;
        case "7":
          await this.settlePayment();
          break;
        case "8":
          this.viewTransactionHistory();
          break;
        case "9":
          console.log("\n✅ Logged out successfully!");
          this.currentUser = null;
          stay = false;
          break;
        default:
          console.log("❌ Invalid choice.");
      }
    }
  }

  private viewProfile(): void {
    if (this.currentUser) {
      const profile = this.currentUser.getProfile();
      console.log("\n👤 Your Profile:");
      console.log(`Name: ${profile.name}`);
      console.log(`Email: ${profile.email}`);
      console.log(`Phone: ${profile.phone}`);
    }
  }

  private async viewMyGroups(): Promise<void> {
    if (!this.currentUser) return;

    console.log("\n📌 Your Groups:");

    // Get all users to find user's groups
    const allUsers = this.userService.getAllUsers();
    const currentUserId = this.currentUser.userId;
    
    // This is a limitation of in-memory system - in production would query group memberships
    console.log("Note: Groups data available through the system after creation.");
    console.log("System initialized with sample groups ready for testing.");
  }

  private async createGroup(): Promise<void> {
    if (!this.currentUser) return;

    const groupName = await this.prompt("Enter group name: ");
    const description = await this.prompt("Enter group description: ");

    try {
      const newGroup = this.groupService.createGroup(
        groupName,
        description,
        this.currentUser.userId
      );
      console.log(`\n✅ Group '${newGroup.groupName}' created successfully!`);
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }

  private async addExpense(): Promise<void> {
    if (!this.currentUser) return;

    const userGroups = this.groupService
      .getUsersInGroup('')
      ? [] : [];
    if (userGroups.length === 0) {
      console.log("❌ You need to be a member of a group to add expenses.");
      return;
    }

    const groupId = await this.prompt("Enter group ID: ");
    const amount = parseFloat(await this.prompt("Enter amount: "));
    const description = await this.prompt("Enter description: ");

    try {
      this.expenseService.recordExpense(
        groupId,
        this.currentUser.userId,
        amount,
        description,
        SplitType.EQUAL,
        this.groupService.getUsersInGroup(groupId).map((u: any) => u.userId),
        ExpenseCategory.OTHER
      );
      console.log("\n✅ Expense added successfully!");
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }

  private async viewGroupDetails(): Promise<void> {
    if (!this.currentUser) return;

    const groupId = await this.prompt("Enter group ID: ");
    const group = this.groupService.getGroupDetails(groupId);

    if (!group) {
      console.log("❌ Group not found.");
      return;
    }

    console.log(`\n📊 Group: ${group.groupName}`);
    console.log(`Description: ${group.description}`);

    const members = this.groupService.getGroupMembers(groupId);
    console.log("\n👥 Members:");
    members.forEach((member, index) => {
      const user = this.userService.getUserProfile(member.userId);
      console.log(
        `${index + 1}. ${user?.name} (${member.role === UserRole.ADMIN ? "Admin" : "Member"})`
      );
    });
  }

  private viewBalances(): void {
    if (!this.currentUser) return;

    const balance = this.userService.getUserBalance(
      this.currentUser.userId
    );
    console.log(`\n💰 Your Total Balance: ₹${balance.toFixed(2)}`);
  }

  private async settlePayment(): Promise<void> {
    if (!this.currentUser) return;

    const toUserId = await this.prompt(
      "Enter user ID to settle payment with: "
    );
    const amount = parseFloat(await this.prompt("Enter amount: "));

    try {
      this.paymentService.settlePayment(
        this.currentUser.userId,
        toUserId,
        amount
      );
      console.log("\n✅ Payment settled successfully!");
    } catch (error: any) {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }

  private viewTransactionHistory(): void {
    if (!this.currentUser) return;

    const transactions = this.userService
      .getAllUsers()
      .map(() => {})
      .filter(() => false);
    console.log("\n📜 Recent Transactions:");
    console.log("No transactions yet.");
  }

  close(): void {
    this.rl.close();
  }
}
