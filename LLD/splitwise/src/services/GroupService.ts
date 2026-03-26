import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { Group } from "../models/Group";
import { GroupMember } from "../models/GroupMember";
import { User } from "../models/User";
import { IdGenerator } from "../utils/IdGenerator";
import { UserRole } from "../enums";

export class GroupService {
  private database: InMemoryDatabase;

  constructor() {
    this.database = InMemoryDatabase.getInstance();
  }

  createGroup(
    name: string,
    description: string,
    creatorId: string
  ): Group {
    const user = this.database.userRepository.findById(creatorId);
    if (!user) {
      throw new Error("User not found");
    }

    const groupId = IdGenerator.generateUUID();
    const group = new Group(groupId, name, description, creatorId);

    this.database.groupRepository.save(group);

    // Add creator as ADMIN
    const memberId = IdGenerator.generateUUID();
    const member = new GroupMember(
      memberId,
      groupId,
      creatorId,
      UserRole.ADMIN
    );
    this.database.groupMemberRepository.save(member);

    return group;
  }

  addMemberToGroup(
    groupId: string,
    userId: string,
    role: UserRole = UserRole.MEMBER
  ): GroupMember {
    const group = this.database.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const user = this.database.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already a member
    const existingMember = this.database.groupMemberRepository.findByGroupAndUser(
      groupId,
      userId
    );
    if (existingMember) {
      throw new Error("User is already a member of this group");
    }

    const memberId = IdGenerator.generateUUID();
    const member = new GroupMember(memberId, groupId, userId, role);
    return this.database.groupMemberRepository.save(member);
  }

  removeMemberFromGroup(groupId: string, userId: string): void {
    const member = this.database.groupMemberRepository.findByGroupAndUser(
      groupId,
      userId
    );
    if (!member) {
      throw new Error("Member not found in group");
    }

    this.database.groupMemberRepository.delete(member.groupMemberId);
  }

  getGroupMembers(groupId: string): GroupMember[] {
    return this.database.groupMemberRepository.getGroupMembers(groupId);
  }

  getGroupDetails(groupId: string): Group | null {
    return this.database.groupRepository.findById(groupId);
  }

  updateGroupInfo(
    groupId: string,
    name: string,
    description: string
  ): Group {
    const group = this.database.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    group.groupName = name;
    group.description = description;
    return this.database.groupRepository.update(group);
  }

  getGroupBalance(groupId: string): Map<string, number> {
    const balances = new Map<string, number>();
    const members = this.getGroupMembers(groupId);

    for (const member of members) {
      const userId = member.userId;
      let balance = 0;

      // Get expenses paid by this user in the group
      const groupExpenses = this.database.expenseRepository.getGroupExpenses(groupId);
      for (const expense of groupExpenses) {
        if (expense.paidBy === userId) {
          balance += expense.amount;
        }
      }

      // Get splits for this user in the group
      const userSplits = this.database.expenseSplitRepository.getUserSplits(userId);
      for (const split of userSplits) {
        const expense = this.database.expenseRepository.findById(split.expenseId);
        if (expense && expense.groupId === groupId) {
          balance -= split.amount;
        }
      }

      balances.set(userId, Math.round(balance * 100) / 100);
    }

    return balances;
  }

  getUsersInGroup(groupId: string): User[] {
    const members = this.getGroupMembers(groupId);
    return members
      .map((member) =>
        this.database.userRepository.findById(member.userId)
      )
      .filter((user) => user !== null) as User[];
  }
}
