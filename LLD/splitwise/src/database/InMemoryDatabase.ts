import { UserRepository } from "../repositories/UserRepository";
import { GroupRepository } from "../repositories/GroupRepository";
import { GroupMemberRepository } from "../repositories/GroupMemberRepository";
import { ExpenseRepository } from "../repositories/ExpenseRepository";
import { ExpenseSplitRepository } from "../repositories/ExpenseSplitRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { CommentRepository } from "../repositories/CommentRepository";
import { TransactionHistoryRepository } from "../repositories/TransactionHistoryRepository";

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;

  userRepository: UserRepository;
  groupRepository: GroupRepository;
  groupMemberRepository: GroupMemberRepository;
  expenseRepository: ExpenseRepository;
  expenseSplitRepository: ExpenseSplitRepository;
  paymentRepository: PaymentRepository;
  commentRepository: CommentRepository;
  transactionHistoryRepository: TransactionHistoryRepository;

  private constructor() {
    this.userRepository = new UserRepository();
    this.groupRepository = new GroupRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.expenseRepository = new ExpenseRepository();
    this.expenseSplitRepository = new ExpenseSplitRepository();
    this.paymentRepository = new PaymentRepository();
    this.commentRepository = new CommentRepository();
    this.transactionHistoryRepository = new TransactionHistoryRepository();
  }

  static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  getSystemStatus(): string {
    return `
    ===== Splitwise System Status =====
    Users: ${this.userRepository.getAllUsers().length}
    Groups: ${this.groupRepository.getAllGroups().length}
    ===================================
    `;
  }

  displaySummary(): void {
    console.log("\n===== System Summary =====");
    console.log(
      `Total Users: ${this.userRepository.getAllUsers().length}`
    );
    console.log(
      `Total Groups: ${this.groupRepository.getAllGroups().length}`
    );
    console.log("===========================\n");
  }
}
