import { UUID, generateUUID } from "../utils";
import { EventStatus } from "../enums";

/**
 * SecurityLog - Audit trail for security events
 */
export class SecurityLog {
  readonly logId: UUID;
  readonly userId: UUID;
  event: string;
  deviceInfo: string;
  ipAddress: string;
  status: EventStatus;
  createdAt: Date;

  constructor(
    userId: UUID,
    event: string,
    deviceInfo: string,
    ipAddress: string,
    status: EventStatus
  ) {
    this.logId = generateUUID();
    this.userId = userId;
    this.event = event;
    this.deviceInfo = deviceInfo;
    this.ipAddress = ipAddress;
    this.status = status;
    this.createdAt = new Date();
  }

  public isSuspicious(): boolean {
    // Logic to detect suspicious activity
    return this.status === EventStatus.FAILED && this.event.includes("Login");
  }
}
