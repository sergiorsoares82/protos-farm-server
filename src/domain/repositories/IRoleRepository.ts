import { Role } from '../entities/Role.js';

export interface IRoleRepository {
  /**
   * Find all roles
   */
  findAll(): Promise<Role[]>;

  /**
   * Find role by ID
   */
  findById(id: string): Promise<Role | null>;

  /**
   * Find role by name
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * Save a role (create or update)
   */
  save(role: Role): Promise<Role>;

  /**
   * Delete a role by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if role exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Check if role has users assigned
   */
  hasUsers(roleId: string): Promise<boolean>;

  /**
   * Count users with this role
   */
  countUsers(roleId: string): Promise<number>;

  /**
   * Get system roles only
   */
  findSystemRoles(): Promise<Role[]>;

  /**
   * Get custom roles only
   */
  findCustomRoles(): Promise<Role[]>;
}
