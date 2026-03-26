import { UserService } from "./services/UserService";
import { GroupService } from "./services/GroupService";
import { ExpenseService } from "./services/ExpenseService";
import { SettlementService } from "./services/SettlementService";
import { PaymentService } from "./services/PaymentService";
import { CommentService } from "./services/CommentService";
import { ConsoleInterface } from "./console/ConsoleInterface";

async function main() {
  // Initialize all services
  const userService = new UserService();
  const groupService = new GroupService();
  const expenseService = new ExpenseService();
  const settlementService = new SettlementService();
  const paymentService = new PaymentService();
  const commentService = new CommentService();

  // Initialize console interface
  const consoleInterface = new ConsoleInterface(
    userService,
    groupService,
    expenseService,
    settlementService,
    paymentService,
    commentService
  );

  // Start the application
  await consoleInterface.start();
}

main().catch(console.error);
