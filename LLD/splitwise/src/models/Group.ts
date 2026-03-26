export class Group {
  groupId: string;
  groupName: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;

  constructor(
    groupId: string,
    groupName: string,
    description: string,
    createdBy: string,
    createdAt: Date = new Date(),
    isActive: boolean = true
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.description = description;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.isActive = isActive;
  }

  getGroupDetails() {
    return {
      groupId: this.groupId,
      groupName: this.groupName,
      description: this.description,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      isActive: this.isActive,
    };
  }
}
