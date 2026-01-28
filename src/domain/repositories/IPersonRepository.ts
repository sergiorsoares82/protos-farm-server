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
   * Find all persons for a tenant
   */
  findAll(tenantId: string): Promise<Person[]>;

  /**
   * Find a person by their ID within a tenant
   */
  findById(id: string, tenantId: string): Promise<Person | null>;

  /**
   * Find a person by their email within a tenant
   */
  findByEmail(email: string, tenantId: string): Promise<Person | null>;

  /**
   * Find a person by their user ID within a tenant
   */
  findByUserId(userId: string, tenantId: string): Promise<Person | null>;

  /**
   * Find all persons with a specific role within a tenant
   */
  findByRole(role: PersonRole, tenantId: string): Promise<Person[]>;

  /**
   * Save a person (create or update) within a tenant
   */
  save(person: Person, tenantId: string): Promise<Person>;

  /**
   * Assign a role to a person within a tenant
   */
  assignRole(
    personId: string,
    role: PersonRole,
    roleData: Client | Supplier | Worker | FarmOwner,
    tenantId: string
  ): Promise<void>;

  /**
   * Remove a role from a person
   */
  removeRole(personId: string, role: PersonRole, tenantId: string): Promise<void>;

  /**
   * Delete a person (and all their roles) within a tenant
   */
  delete(id: string, tenantId: string): Promise<void>;

  /**
   * Check if email is already taken within a tenant
   */
  existsByEmail(email: string, tenantId: string): Promise<boolean>;
}
