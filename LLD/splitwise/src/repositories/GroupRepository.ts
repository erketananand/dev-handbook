import { Group } from "../models/Group";

export class GroupRepository {
  private groups: Map<string, Group> = new Map();

  save(group: Group): Group {
    this.groups.set(group.groupId, group);
    return group;
  }

  findById(groupId: string): Group | null {
    return this.groups.get(groupId) || null;
  }

  findByCreator(createdBy: string): Group[] {
    return Array.from(this.groups.values()).filter(
      (group) => group.createdBy === createdBy && group.isActive
    );
  }

  getAllGroups(): Group[] {
    return Array.from(this.groups.values()).filter((group) => group.isActive);
  }

  update(group: Group): Group {
    this.groups.set(group.groupId, group);
    return group;
  }

  delete(groupId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.isActive = false;
    }
  }
}
