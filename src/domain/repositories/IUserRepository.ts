import { User } from '../entities/User.js';

/**
 * Repository interface for User aggregate
 * This abstraction allows the domain layer to remain independent of infrastructure
 */
export interface IUserRepository {
  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Save a user (create or update)
   */
  save(user: User): Promise<User>;

  /**
   * Check if a user with the given email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
