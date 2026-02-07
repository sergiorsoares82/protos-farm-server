import { Permission } from '../entities/Permission.js';
import { EntityType } from '../enums/EntityType.js';
import { PermissionAction } from '../enums/PermissionAction.js';

export interface IPermissionRepository {
  /**
   * Find all permissions
   */
  findAll(): Promise<Permission[]>;

  /**
   * Find permission by ID
   */
  findById(id: string): Promise<Permission | null>;

  /**
   * Find permission by entity and action
   */
  findByEntityAndAction(
    entity: EntityType,
    action: PermissionAction
  ): Promise<Permission | null>;

  /**
   * Find all permissions for a specific entity
   */
  findByEntity(entity: EntityType): Promise<Permission[]>;

  /**
   * Save a permission (create or update)
   */
  save(permission: Permission): Promise<Permission>;

  /**
   * Save multiple permissions
   */
  saveMany(permissions: Permission[]): Promise<void>;

  /**
   * Delete a permission
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a permission exists
   */
  exists(entity: EntityType, action: PermissionAction): Promise<boolean>;
}
