import type { Request, Response } from 'express';
import { GetAllPermissionsUseCase } from '../../application/use-cases/GetAllPermissionsUseCase.js';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase.js';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/UpdateRolePermissionsUseCase.js';
import { GetCustomRolePermissionsUseCase } from '../../application/use-cases/GetCustomRolePermissionsUseCase.js';
import { UpdateCustomRolePermissionsUseCase } from '../../application/use-cases/UpdateCustomRolePermissionsUseCase.js';
import { CheckPermissionUseCase } from '../../application/use-cases/CheckPermissionUseCase.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';

export class PermissionController {
  constructor(
    private getAllPermissionsUseCase: GetAllPermissionsUseCase,
    private getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
    private getCustomRolePermissionsUseCase: GetCustomRolePermissionsUseCase,
    private updateCustomRolePermissionsUseCase: UpdateCustomRolePermissionsUseCase,
    private checkPermissionUseCase: CheckPermissionUseCase
  ) {}

  /**
   * GET /api/permissions
   * Get all available permissions
   */
  async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = await this.getAllPermissionsUseCase.execute();

      res.json({
        success: true,
        data: permissions.map(p => p.toJSON()),
      });
    } catch (error) {
      console.error('Error getting all permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get permissions',
      });
    }
  }

  /**
   * GET /api/permissions/roles/:role
   * Get permissions for a specific role
   * Query params: 
   *   - tenantId (optional, SUPER_ADMIN only): get permissions for specific tenant
   */
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const { tenantId: queryTenantId } = req.query;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role',
        });
        return;
      }

      // Determine which tenant's permissions to retrieve
      let targetTenantId: string | undefined;
      
      if (user.role === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN can view permissions for any tenant or system-wide
        targetTenantId = queryTenantId ? (queryTenantId as string) : undefined;
      } else if (user.role === UserRole.ORG_ADMIN) {
        // ORG_ADMIN can only view their own organization's permissions
        targetTenantId = tenant?.id;
        
        // Prevent ORG_ADMIN from accessing other tenants
        if (queryTenantId && queryTenantId !== tenant?.id) {
          res.status(403).json({
            success: false,
            error: 'Cannot view permissions for other organizations',
          });
          return;
        }
      } else {
        // Regular users cannot manage permissions
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view role permissions',
        });
        return;
      }

      const permissions = await this.getRolePermissionsUseCase.execute(
        role as UserRole,
        targetTenantId
      );

      res.json({
        success: true,
        data: {
          role,
          tenantId: targetTenantId || null,
          permissions: permissions.map(p => p.toJSON()),
        },
      });
    } catch (error) {
      console.error('Error getting role permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get role permissions',
      });
    }
  }

  /**
   * PUT /api/permissions/roles/:role
   * Update permissions for a specific role
   * Body:
   *   - permissionIds: string[] - Array of permission IDs to assign
   *   - tenantId (optional, SUPER_ADMIN only): update permissions for specific tenant
   */
  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const { permissionIds, tenantId: bodyTenantId } = req.body;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role',
        });
        return;
      }

      // Validate permissionIds
      if (!Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          error: 'permissionIds must be an array',
        });
        return;
      }

      // Determine which tenant's permissions to update
      let targetTenantId: string | undefined;
      
      if (user.role === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN can update permissions for any tenant or system-wide
        targetTenantId = bodyTenantId || undefined;
      } else if (user.role === UserRole.ORG_ADMIN) {
        // ORG_ADMIN can only update their own organization's permissions
        targetTenantId = tenant?.id;
        
        // Prevent ORG_ADMIN from updating other tenants
        if (bodyTenantId && bodyTenantId !== tenant?.id) {
          res.status(403).json({
            success: false,
            error: 'Cannot update permissions for other organizations',
          });
          return;
        }
        
        // ORG_ADMIN cannot update SUPER_ADMIN or ORG_ADMIN roles
        if (role === UserRole.SUPER_ADMIN || role === UserRole.ORG_ADMIN) {
          res.status(403).json({
            success: false,
            error: 'ORG_ADMIN can only manage USER role permissions',
          });
          return;
        }
      } else {
        // Regular users cannot manage permissions
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update role permissions',
        });
        return;
      }

      await this.updateRolePermissionsUseCase.execute({
        role: role as UserRole,
        permissionIds,
        tenantId: targetTenantId,
      });

      res.json({
        success: true,
        message: `Permissions updated for role ${role}${targetTenantId ? ` in tenant ${targetTenantId}` : ' (system-wide)'}`,
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      const message = error instanceof Error ? error.message : 'Failed to update role permissions';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/permissions/roles/custom/:roleId
   * Get permissions for a custom role (by role entity id)
   */
  async getCustomRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = typeof req.params.roleId === 'string' ? req.params.roleId : req.params.roleId?.[0];
      const { tenantId: queryTenantId } = req.query;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      if (!roleId || typeof roleId !== 'string') {
        res.status(400).json({ success: false, error: 'Role ID is required' });
        return;
      }

      let targetTenantId: string | undefined;
      if (user.role === UserRole.SUPER_ADMIN) {
        targetTenantId = queryTenantId ? (queryTenantId as string) : undefined;
      } else if (user.role === UserRole.ORG_ADMIN) {
        targetTenantId = tenant?.id;
        if (queryTenantId && queryTenantId !== tenant?.id) {
          res.status(403).json({
            success: false,
            error: 'Cannot view permissions for other organizations',
          });
          return;
        }
      } else {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to view custom role permissions',
        });
        return;
      }

      const permissions = await this.getCustomRolePermissionsUseCase.execute(
        roleId,
        targetTenantId
      );

      res.json({
        success: true,
        data: {
          roleId,
          tenantId: targetTenantId ?? null,
          permissions: permissions.map(p => p.toJSON()),
        },
      });
    } catch (error) {
      console.error('Error getting custom role permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get custom role permissions',
      });
    }
  }

  /**
   * PUT /api/permissions/roles/custom/:roleId
   * Update permissions for a custom role
   * Body: { permissionIds: string[], tenantId?: string }
   */
  async updateCustomRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = typeof req.params.roleId === 'string' ? req.params.roleId : req.params.roleId?.[0];
      const { permissionIds, tenantId: bodyTenantId } = req.body;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      if (!roleId || typeof roleId !== 'string') {
        res.status(400).json({ success: false, error: 'Role ID is required' });
        return;
      }
      if (!Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          error: 'permissionIds must be an array',
        });
        return;
      }

      let targetTenantId: string | undefined;
      if (user.role === UserRole.SUPER_ADMIN) {
        targetTenantId = bodyTenantId ?? undefined;
      } else if (user.role === UserRole.ORG_ADMIN) {
        targetTenantId = tenant?.id;
        if (bodyTenantId && bodyTenantId !== tenant?.id) {
          res.status(403).json({
            success: false,
            error: 'Cannot update permissions for other organizations',
          });
          return;
        }
      } else {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update custom role permissions',
        });
        return;
      }

      await this.updateCustomRolePermissionsUseCase.execute({
        roleId,
        permissionIds,
        tenantId: targetTenantId,
      });

      res.json({
        success: true,
        message: `Permissions updated for custom role ${roleId}`,
      });
    } catch (error) {
      console.error('Error updating custom role permissions:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update custom role permissions';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/permissions/check
   * Check if current user has a specific permission
   */
  async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { entity, action } = req.query;
      const user = (req as any).user;
      const tenant = (req as any).tenant;

      // Validate entity
      if (!entity || !Object.values(EntityType).includes(entity as EntityType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing entity',
        });
        return;
      }

      // Validate action
      if (!action || !Object.values(PermissionAction).includes(action as PermissionAction)) {
        res.status(400).json({
          success: false,
          error: 'Invalid or missing action',
        });
        return;
      }

      const result = await this.checkPermissionUseCase.execute({
        role: user.role,
        entity: entity as EntityType,
        action: action as PermissionAction,
        tenantId: tenant?.id,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check permission',
      });
    }
  }
}
