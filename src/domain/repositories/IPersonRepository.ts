import { Person } from '../entities/Person.js';
import { PersonRole } from '../enums/PersonRole.js';
import type { Client } from '../value-objects/roles/Client.js';
import type { Supplier } from '../value-objects/roles/Supplier.js';
import type { Worker } from '../value-objects/roles/Worker.js';
import type { FarmOwner } from '../value-objects/roles/FarmOwner.js';

/**
 * Repository interface for Person aggregate
 * Manages persistence of Person entities and their roles
 */
export interface IPersonRepository {
  /**
   * Find a person by their ID
   */
  findById(id: string): Promise<Person | null>;

  /**
   * Find a person by their email
   */
  findByEmail(email: string): Promise<Person | null>;

  /**
   * Find a person by their user ID
   */
  findByUserId(userId: string): Promise<Person | null>;

  /**
   * Find all persons with a specific role
   */
  findByRole(role: PersonRole): Promise<Person[]>;

  /**
   * Save a person (create or update)
   */
  save(person: Person): Promise<Person>;

  /**
   * Assign a role to a person
   */
  assignRole(
    personId: string,
    role: PersonRole,
    roleData: Client | Supplier | Worker | FarmOwner
  ): Promise<void>;

  /**
   * Remove a role from a person
   */
  removeRole(personId: string, role: PersonRole): Promise<void>;

  /**
   * Delete a person (and all their roles)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email is already taken
   */
  existsByEmail(email: string): Promise<boolean>;
}
