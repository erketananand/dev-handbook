/**
 * ConnectionRepository - Data access layer for Connection entities
 */

import { IRepository, UUID } from "../utils";
import { Connection } from "../models";
import { ConnectionStatus } from "../enums";

export class ConnectionRepository implements IRepository<Connection> {
  private connections: Map<UUID, Connection> = new Map();

  async save(connection: Connection): Promise<void> {
    this.connections.set(connection.connectionId, connection);
  }

  async findById(id: UUID): Promise<Connection | null> {
    return this.connections.get(id) || null;
  }

  async findAll(): Promise<Connection[]> {
    return Array.from(this.connections.values());
  }

  async update(connection: Connection): Promise<void> {
    if (this.connections.has(connection.connectionId)) {
      this.connections.set(connection.connectionId, connection);
    }
  }

  async delete(id: UUID): Promise<void> {
    this.connections.delete(id);
  }

  async findByUserId(userId: UUID): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      c => c.userId === userId || c.connectedUserId === userId
    );
  }

  async findByUserIdAndStatus(userId: UUID, status: ConnectionStatus): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      c => (c.userId === userId || c.connectedUserId === userId) && c.status === status
    );
  }

  async findBetweenUsers(userId: UUID, otherUserId: UUID): Promise<Connection | null> {
    for (const conn of this.connections.values()) {
      if (
        (conn.userId === userId && conn.connectedUserId === otherUserId) ||
        (conn.userId === otherUserId && conn.connectedUserId === userId)
      ) {
        return conn;
      }
    }
    return null;
  }
}
