/**
 * ConnectionFactory - Factory for creating and validating Connection instances
 */

import { Connection } from "../../models";
import { UUID } from "../../utils";
import { ValidationError } from "../../utils";

export class ConnectionFactory {
  /**
   * Create a new connection request
   */
  static createConnectionRequest(userId: UUID, targetUserId: UUID): Connection {
    this.validateConnectionRequest(userId, targetUserId);
    return new Connection(userId, targetUserId);
  }

  /**
   * Validate connection request parameters
   */
  private static validateConnectionRequest(userId: UUID, targetUserId: UUID): void {
    if (userId === targetUserId) {
      throw new ValidationError("Cannot connect with yourself");
    }

    if (!userId || !targetUserId) {
      throw new ValidationError("Valid user IDs are required");
    }
  }

  /**
   * Create bidirectional connection (for testing/admin purposes)
   */
  static createBidirectionalConnection(userId: UUID, targetUserId: UUID): Connection[] {
    this.validateConnectionRequest(userId, targetUserId);

    const connection1 = new Connection(userId, targetUserId);
    connection1.accept();

    const connection2 = new Connection(targetUserId, userId);
    connection2.accept();

    return [connection1, connection2];
  }

  /**
   * Create a blocked connection
   */
  static createBlockedConnection(userId: UUID, targetUserId: UUID): Connection {
    this.validateConnectionRequest(userId, targetUserId);
    const connection = new Connection(userId, targetUserId);
    connection.block();
    return connection;
  }
}
