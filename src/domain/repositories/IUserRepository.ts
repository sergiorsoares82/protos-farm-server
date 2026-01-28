import { User } from '../entities/User.js';
import type { UserEntity } from '../../infrastructure/database/entities/UserEntity.js';

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
   * Find all users (optionally filtered by tenant)
   */
  findAll(tenantId?: string): Promise<User[]>;

  /**
   * Find all users in a specific organization
   */
  findByTenant(tenantId: string): Promise<User[]>;

  /**
   * Find user by ID with related person (returns entity for DTO mapping)
   */
  findByIdWithPerson(id: string): Promise<UserEntity | null>;

  /**
   * Find all users with related person (returns entities for DTO mapping)
   */
  findAllWithPerson(tenantId?: string): Promise<UserEntity[]>;

  /**
   * Save a user (create or update)
   */
  save(user: User): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a user with the given email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
