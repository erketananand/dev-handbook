import { UserService } from "./UserService";
import { GroupService } from "./GroupService";
import { ExpenseService } from "./ExpenseService";
import { PaymentService } from "./PaymentService";
import { SplitType, ExpenseCategory, UserRole } from "../enums";

export class SetupService {
  private userService: UserService;
  private groupService: GroupService;
  private expenseService: ExpenseService;
  private paymentService: PaymentService;

  constructor(
    userService: UserService,
    groupService: GroupService,
    expenseService: ExpenseService,
    paymentService: PaymentService
  ) {
    this.userService = userService;
    this.groupService = groupService;
    this.expenseService = expenseService;
    this.paymentService = paymentService;
  }

  initializeSystem(): void {
    console.log("\n📊 Initializing Splitwise System with Sample Data...\n");

    // Create sample users
    const user1 = this.userService.register(
      "Rajesh Kumar",
      "rajesh@email.com",
      "9876543210"
    );
    const user2 = this.userService.register(
      "Priya Singh",
      "priya@email.com",
      "9876543211"
    );
    const user3 = this.userService.register(
      "Amit Patel",
      "amit@email.com",
      "9876543212"
    );
    const user4 = this.userService.register(
      "Kavya Sharma",
      "kavya@email.com",
      "9876543213"
    );

    console.log("✅ Created 4 sample users");

    // Create sample groups
    const group1 = this.groupService.createGroup(
      "Friends Trip",
      "Goa trip with friends",
      user1.userId
    );

    this.groupService.addMemberToGroup(group1.groupId, user2.userId);
    this.groupService.addMemberToGroup(group1.groupId, user3.userId);

    const group2 = this.groupService.createGroup(
      "Apartment Rent",
      "Shared apartment expenses",
      user2.userId
    );

    this.groupService.addMemberToGroup(group2.groupId, user3.userId);
    this.groupService.addMemberToGroup(group2.groupId, user4.userId);

    console.log("✅ Created 2 sample groups");

    // Create sample expenses
    // Group 1 - Friends Trip
    this.expenseService.recordExpense(
      group1.groupId,
      user1.userId,
      3000,
      "Hotel booking",
      SplitType.EQUAL,
      [user1.userId, user2.userId, user3.userId],
      ExpenseCategory.TRAVEL
    );

    this.expenseService.recordExpense(
      group1.groupId,
      user2.userId,
      1200,
      "Food for group",
      SplitType.EQUAL,
      [user1.userId, user2.userId, user3.userId],
      ExpenseCategory.FOOD
    );

    this.expenseService.recordExpense(
      group1.groupId,
      user3.userId,
      600,
      "Beach activities",
      SplitType.EQUAL,
      [user1.userId, user2.userId, user3.userId],
      ExpenseCategory.ENTERTAINMENT
    );

    // Group 2 - Apartment Rent
    this.expenseService.recordExpense(
      group2.groupId,
      user2.userId,
      15000,
      "Monthly rent",
      SplitType.EQUAL,
      [user2.userId, user3.userId, user4.userId],
      ExpenseCategory.UTILITIES
    );

    this.expenseService.recordExpense(
      group2.groupId,
      user3.userId,
      2000,
      "Internet and utilities",
      SplitType.EQUAL,
      [user2.userId, user3.userId, user4.userId],
      ExpenseCategory.UTILITIES
    );

    console.log("✅ Created 5 sample expenses");

    // Create sample payments
    this.paymentService.recordPayment(user1.userId, user2.userId, 1500);
    this.paymentService.recordPayment(user3.userId, user2.userId, 2000);

    console.log("✅ Created 2 sample payments");

    console.log("\n🎉 Sample data initialization complete!\n");
  }
}
