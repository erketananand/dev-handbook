import { UserRole } from "../enums";

export class GroupMember {
  groupMemberId: string;
  groupId: string;
  userId: string;
  role: UserRole;
  joinedAt: Date;
  isActive: boolean;

  constructor(
    groupMemberId: string,
    groupId: string,
    userId: string,
    role: UserRole = UserRole.MEMBER,
    joinedAt: Date = new Date(),
    isActive: boolean = true
  ) {
    this.groupMemberId = groupMemberId;
    this.groupId = groupId;
    this.userId = userId;
    this.role = role;
    this.joinedAt = joinedAt;
    this.isActive = isActive;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  getRole(): string {
    return this.role;
  }
}
