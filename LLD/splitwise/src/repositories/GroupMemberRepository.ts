import { GroupMember } from "../models/GroupMember";

export class GroupMemberRepository {
  private members: Map<string, GroupMember> = new Map();

  save(member: GroupMember): GroupMember {
    this.members.set(member.groupMemberId, member);
    return member;
  }

  findById(memberId: string): GroupMember | null {
    return this.members.get(memberId) || null;
  }

  findByGroupAndUser(groupId: string, userId: string): GroupMember | null {
    for (const member of this.members.values()) {
      if (member.groupId === groupId && member.userId === userId && member.isActive) {
        return member;
      }
    }
    return null;
  }

  getGroupMembers(groupId: string): GroupMember[] {
    return Array.from(this.members.values()).filter(
      (member) => member.groupId === groupId && member.isActive
    );
  }

  getUserGroups(userId: string): GroupMember[] {
    return Array.from(this.members.values()).filter(
      (member) => member.userId === userId && member.isActive
    );
  }

  update(member: GroupMember): GroupMember {
    this.members.set(member.groupMemberId, member);
    return member;
  }

  delete(memberId: string): void {
    const member = this.members.get(memberId);
    if (member) {
      member.isActive = false;
    }
  }
}
