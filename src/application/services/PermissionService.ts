import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import type { IRolePermissionRepository } from '../../domain/repositories/IRolePermissionRepository.js';
import { Permission } from '../../domain/entities/Permission.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

export class PermissionService {
  private permissionCache: Map<string, CacheEntry>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(
    private permissionRepository: IPermissionRepository,
    private rolePermissionRepository: IRolePermissionRepository
  ) {
    this.permissionCache = new Map();
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(
    role: UserRole,
    entity: EntityType,
    action: PermissionAction,
    tenantId?: string
  ): Promise<boolean> {
    // Create cache key
    const cacheKey = this.getCacheKey(role, entity, action, tenantId);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Find the permission
    const permission = await this.permissionRepository.findByEntityAndAction(entity, action);
    if (!permission) {
      // Permission doesn't exist, deny access
      this.setCache(cacheKey, false);
      return false;
    }

    // Check if role has this permission
    const hasAccess = await this.rolePermissionRepository.hasPermission(
      role,
      permission.getId(),
      tenantId
    );

    // Cache the result
    this.setCache(cacheKey, hasAccess);
    return hasAccess;
  }

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(role: UserRole, tenantId?: string): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.findByRole(role, tenantId);
    
    // Get all permission IDs
    const permissionIds = rolePermissions.map(rp => rp.getPermissionId());
    
    // Fetch all permissions
    const allPermissions = await this.permissionRepository.findAll();
    
    // Filter to only include permissions this role has
    return allPermissions.filter(p => permissionIds.includes(p.getId()));
  }

  /**
   * Get role permissions grouped by entity
   */
  async getRolePermissionsGrouped(
    role: UserRole,
    tenantId?: string
  ): Promise<Map<EntityType, PermissionAction[]>> {
    const permissions = await this.getRolePermissions(role, tenantId);
    
    const grouped = new Map<EntityType, PermissionAction[]>();
    
    for (const permission of permissions) {
      const entity = permission.getEntity();
      const action = permission.getAction();
      
      if (!grouped.has(entity)) {
        grouped.set(entity, []);
      }
      
      grouped.get(entity)!.push(action);
    }
    
    return grouped;
  }

  /**
   * Get all permissions for a specific entity and role
   */
  async getEntityPermissions(
    role: UserRole,
    entity: EntityType,
    tenantId?: string
  ): Promise<PermissionAction[]> {
    const rolePermissions = await this.rolePermissionRepository.findByRoleAndEntity(
      role,
      entity,
      tenantId
    );
    
    // Get permission IDs
    const permissionIds = rolePermissions.map(rp => rp.getPermissionId());
    
    // Get all permissions for this entity
    const entityPermissions = await this.permissionRepository.findByEntity(entity);
    
    // Filter and map to actions
    return entityPermissions
      .filter(p => permissionIds.includes(p.getId()))
      .map(p => p.getAction());
  }

  /**
   * Clear the permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Clear cache for a specific role
   */
  clearCacheForRole(role: UserRole): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${role}:`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.permissionCache.delete(key);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(
    role: UserRole,
    entity: EntityType,
    action: PermissionAction,
    tenantId?: string
  ): string {
    const tenant = tenantId || 'system';
    return `${role}:${tenant}:${entity}:${action}`;
  }

  /**
   * Get value from cache
   */
  private getFromCache(key: string): boolean | null {
    const entry = this.permissionCache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.permissionCache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  private setCache(key: string, value: boolean): void {
    this.permissionCache.set(key, {
      value,
      expiresAt: Date.now() + this.CACHE_TTL,
    });
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.permissionCache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.permissionCache.delete(key);
    }
  }
}
