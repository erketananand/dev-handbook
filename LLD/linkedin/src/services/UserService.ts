/**
 * UserService - Business logic for user management
 */

import { UserRepository } from "../repositories";
import { User } from "../models";
import { UUID, isValidEmail, isValidPassword, NotFoundError, ValidationError } from "../utils";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Register a new user
   */
  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    headline: string
  ): Promise<User> {
    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (!isValidPassword(password)) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    const user = new User(email, firstName, lastName);
    user.headline = headline;

    await this.userRepository.save(user);
    return user;
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: UUID): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: UUID, firstName: string, lastName: string, headline: string): Promise<User> {
    const user = await this.getUserProfile(userId);
    user.updateProfile(firstName, lastName, headline);
    await this.userRepository.update(user);
    return user;
  }

  /**
   * Verify user account
   */
  async verifyUser(userId: UUID): Promise<User> {
    const user = await this.getUserProfile(userId);
    user.verify();
    await this.userRepository.update(user);
    return user;
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: UUID): Promise<User> {
    const user = await this.getUserProfile(userId);
    user.deactivate();
    await this.userRepository.update(user);
    return user;
  }

  /**
   * Search users by name
   */
  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await this.userRepository.findActiveUsers();
    const lowerQuery = query.toLowerCase();

    return allUsers.filter(
      user =>
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all active users
   */
  async getActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }
}
