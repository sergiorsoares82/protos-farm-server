import { Organization } from '../entities/Organization.js';

export interface IOrganizationRepository {
  /**
   * Find all organizations
   */
  findAll(): Promise<Organization[]>;

  /**
   * Find organization by ID
   */
  findById(id: string): Promise<Organization | null>;

  /**
   * Find organization by slug
   */
  findBySlug(slug: string): Promise<Organization | null>;

  /**
   * Save organization (create or update)
   */
  save(organization: Organization): Promise<Organization>;

  /**
   * Delete organization
   */
  delete(id: string): Promise<void>;

  /**
   * Check if organization exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Check if organization exists by slug
   */
  existsBySlug(slug: string): Promise<boolean>;
}
