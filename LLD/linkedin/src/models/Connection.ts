/**
 * Connection model - Represents connection between users
 */

import { UUID, generateUUID } from "../utils";
import { ConnectionStatus, ConnectionLevel } from "../enums";

export class Connection {
  readonly connectionId: UUID;
  userId: UUID;
  connectedUserId: UUID;
  status: ConnectionStatus;
  connectionLevel: ConnectionLevel;
  connectedAt: Date | null;
  createdAt: Date;

  constructor(userId: UUID, connectedUserId: UUID) {
    this.connectionId = generateUUID();
    this.userId = userId;
    this.connectedUserId = connectedUserId;
    this.status = ConnectionStatus.PENDING;
    this.connectionLevel = ConnectionLevel.THIRD_DEGREE_PLUS;
    this.connectedAt = null;
    this.createdAt = new Date();
  }

  public accept(): void {
    this.status = ConnectionStatus.ACCEPTED;
    this.connectedAt = new Date();
    this.connectionLevel = ConnectionLevel.FIRST_DEGREE;
  }

  public reject(): void {
    this.status = ConnectionStatus.REJECTED;
  }

  public block(): void {
    this.status = ConnectionStatus.BLOCKED;
  }

  public isPending(): boolean {
    return this.status === ConnectionStatus.PENDING;
  }

  public isAccepted(): boolean {
    return this.status === ConnectionStatus.ACCEPTED;
  }
}
