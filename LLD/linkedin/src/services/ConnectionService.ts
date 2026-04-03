/**
 * ConnectionService - Business logic for user connections
 */

import { ConnectionRepository } from "../repositories";
import { Connection } from "../models";
import { UUID, NotFoundError, ValidationError } from "../utils";
import { ConnectionStatus } from "../enums";

export class ConnectionService {
  constructor(private connectionRepository: ConnectionRepository) {}

  /**
   * Send a connection request
   */
  async sendConnectionRequest(userId: UUID, targetUserId: UUID): Promise<Connection> {
    if (userId === targetUserId) {
      throw new ValidationError("Cannot send connection request to yourself");
    }

    const existingConnection = await this.connectionRepository.findBetweenUsers(userId, targetUserId);
    if (existingConnection) {
      throw new ValidationError("Connection already exists between these users");
    }

    const connection = new Connection(userId, targetUserId);
    await this.connectionRepository.save(connection);
    return connection;
  }

  /**
   * Accept a connection request
   */
  async acceptConnectionRequest(userId: UUID, connectionId: UUID): Promise<Connection> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError(`Connection with ID ${connectionId} not found`);
    }

    if (connection.connectedUserId !== userId) {
      throw new ValidationError("You cannot accept this connection request");
    }

    connection.accept();
    await this.connectionRepository.update(connection);
    return connection;
  }

  /**
   * Reject a connection request
   */
  async rejectConnectionRequest(userId: UUID, connectionId: UUID): Promise<Connection> {
    const connection = await this.connectionRepository.findById(connectionId);
    if (!connection) {
      throw new NotFoundError(`Connection with ID ${connectionId} not found`);
    }

    if (connection.connectedUserId !== userId) {
      throw new ValidationError("You cannot reject this connection request");
    }

    connection.reject();
    await this.connectionRepository.update(connection);
    return connection;
  }

  /**
   * Block a user
   */
  async blockUser(userId: UUID, targetUserId: UUID): Promise<Connection> {
    const connection = await this.connectionRepository.findBetweenUsers(userId, targetUserId);
    if (!connection) {
      throw new NotFoundError("No connection found between these users");
    }

    connection.block();
    await this.connectionRepository.update(connection);
    return connection;
  }

  /**
   * Get user's connections
   */
  async getUserConnections(userId: UUID): Promise<Connection[]> {
    const connections = await this.connectionRepository.findByUserId(userId);
    return connections.filter(c => c.isAccepted());
  }

  /**
   * Get pending connection requests
   */
  async getPendingRequests(userId: UUID): Promise<Connection[]> {
    return this.connectionRepository.findByUserIdAndStatus(userId, ConnectionStatus.PENDING);
  }

  /**
   * Get all connections for a user
   */
  async getAllConnectionsForUser(userId: UUID): Promise<Connection[]> {
    return this.connectionRepository.findByUserId(userId);
  }
}
