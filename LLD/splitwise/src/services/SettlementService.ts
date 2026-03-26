import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { Payment } from "../models/Payment";
import { PaymentStatus, TransactionType } from "../enums";

export class SettlementService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  calculateBalances(groupId: string): Map<string, Map<string, number>> {
    const balances = new Map<string, Map<string, number>>();
    const members = this.database.groupMemberRepository.getGroupMembers(groupId);

    // Initialize balance matrix
    for (const member of members) {
      balances.set(member.userId, new Map<string, number>());
    }

    // Calculate balances between each pair
    const expenses = this.database.expenseRepository.getGroupExpenses(groupId);
    for (const expense of expenses) {
      const splits = this.database.expenseSplitRepository.getExpenseSplits(
        expense.expenseId
      );

      for (const split of splits) {
        const payer = expense.paidBy;
        const ower = split.userId;

        if (payer !== ower) {
          const amount = split.amount;

          // Update balance: ower owes payer
          if (!balances.get(ower)?.has(payer)) {
            balances.get(ower)?.set(payer, 0);
          }
          const currentBalance = balances.get(ower)?.get(payer) || 0;
          balances.get(ower)?.set(payer, currentBalance + amount);
        }
      }
    }

    return balances;
  }

  getPaymentsBetween(user1Id: string, user2Id: string): Payment[] {
    return this.database.paymentRepository.getPaymentsBetween(user1Id, user2Id);
  }

  optimizeSettlements(groupId: string): Payment[] {
    const balances = this.calculateBalances(groupId);
    const optimizedPayments: Payment[] = [];

    const debtors = new Map<string, number>();
    const creditors = new Map<string, number>();

    // Build debtors and creditors list
    for (const [userId, personalBalances] of balances) {
      let totalDebt = 0;
      for (const amount of personalBalances.values()) {
        totalDebt += amount;
      }

      if (Math.abs(totalDebt) > 0.01) {
        if (totalDebt > 0) {
          debtors.set(userId, totalDebt);
        } else {
          creditors.set(userId, -totalDebt);
        }
      }
    }

    // Greedy settlement algorithm
    while (debtors.size > 0 && creditors.size > 0) {
      const [debtor, debtAmount] = Array.from(debtors.entries())[0];
      const [creditor, creditAmount] = Array.from(creditors.entries())[0];

      const settlementAmount = Math.min(debtAmount, creditAmount);

      const paymentId = `PAY-${Date.now()}-${Math.random()}`;
      const payment = new Payment(
        paymentId,
        debtor,
        creditor,
        settlementAmount,
        PaymentStatus.PENDING
      );
      optimizedPayments.push(payment);

      // Update amounts
      debtors.set(debtor, debtAmount - settlementAmount);
      creditors.set(creditor, creditAmount - settlementAmount);

      // Remove if settled
      if (debtors.get(debtor)! < 0.01) {
        debtors.delete(debtor);
      }
      if (creditors.get(creditor)! < 0.01) {
        creditors.delete(creditor);
      }
    }

    return optimizedPayments;
  }

  getUserBalances(userId: string): Map<string, number> {
    const balances = new Map<string, number>();

    // Get all groups user is in
    const userGroups = this.database.groupMemberRepository.getUserGroups(userId);

    for (const membership of userGroups) {
      const groupBalances = this.calculateBalances(membership.groupId);
      const userGroupBalances = groupBalances.get(userId) || new Map();

      for (const [otherUser, amount] of userGroupBalances) {
        const current = balances.get(otherUser) || 0;
        balances.set(otherUser, current + amount);
      }
    }

    return balances;
  }

  getMinimumPayments(groupId: string): Payment[] {
    return this.optimizeSettlements(groupId);
  }

  settleDebts(userId: string, withUserId: string): void {
    const userBalances = this.getUserBalances(userId);
    const amount = userBalances.get(withUserId) || 0;

    if (amount > 0.01) {
      const paymentId = `PAY-${Date.now()}`;
      const payment = new Payment(
        paymentId,
        userId,
        withUserId,
        amount,
        PaymentStatus.PENDING
      );
      this.database.paymentRepository.save(payment);
    }
  }
}
