import { RolePermission } from '../entities/RolePermission.js';
import { UserRole } from '../enums/UserRole.js';
import { EntityType } from '../enums/EntityType.js';

export interface IRolePermissionRepository {
  /**
   * Find all role permissions for a specific role
   * @param role - User role
   * @param tenantId - Optional tenant ID (null returns system-wide only, undefined returns all)
   */
  findByRole(role: UserRole, tenantId?: string): Promise<RolePermission[]>;

  /**
   * Find role permissions for a specific role and entity
   */
  findByRoleAndEntity(
    role: UserRole,
    entity: EntityType,
    tenantId?: string
  ): Promise<RolePermission[]>;

  /**
   * Find a specific role permission by role and permission ID
   */
  findByRoleAndPermission(
    role: UserRole,
    permissionId: string,
    tenantId?: string
  ): Promise<RolePermission | null>;

  /**
   * Save a role permission
   */
  save(rolePermission: RolePermission): Promise<RolePermission>;

  /**
   * Save multiple role permissions
   */
  saveMany(rolePermissions: RolePermission[]): Promise<void>;

  /**
   * Delete all role permissions for a specific role
   */
  deleteByRole(role: UserRole, tenantId?: string): Promise<void>;

  /**
   * Delete a specific role permission
   */
  delete(id: string): Promise<void>;

  /**
   * Delete role permissions by role and permission IDs
   */
  deleteByRoleAndPermissions(
    role: UserRole,
    permissionIds: string[],
    tenantId?: string
  ): Promise<void>;

  /**
   * Check if a role has a specific permission
   */
  hasPermission(
    role: UserRole,
    permissionId: string,
    tenantId?: string
  ): Promise<boolean>;

  // --- Custom role (by role entity id) ---

  /**
   * Find all role permissions for a custom role (by role entity id)
   */
  findByRoleId(roleId: string, tenantId?: string): Promise<RolePermission[]>;

  /**
   * Delete all role permissions for a custom role
   */
  deleteByRoleId(roleId: string, tenantId?: string): Promise<void>;

  /**
   * Check if a custom role has a specific permission
   */
  hasPermissionForRoleId(
    roleId: string,
    permissionId: string,
    tenantId?: string
  ): Promise<boolean>;
}
