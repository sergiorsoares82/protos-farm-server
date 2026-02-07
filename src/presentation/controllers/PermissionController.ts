import type { Request, Response } from 'express';
import { GetAllPermissionsUseCase } from '../../application/use-cases/GetAllPermissionsUseCase.js';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase.js';
import { UpdateRolePermissionsUseCase } from '../../application/use-cases/UpdateRolePermissionsUseCase.js';
import { CheckPermissionUseCase } from '../../application/use-cases/CheckPermissionUseCase.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';

export class PermissionController {
  constructor(
    private getAllPermissionsUseCase: GetAllPermissionsUseCase,
    private getRolePermissionsUseCase: GetRolePermissionsUseCase,
    private updateRolePermissionsUseCase: UpdateRolePermissionsUseCase,
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
   */
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
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

      // Only SUPER_ADMIN can view any role's permissions
      // ORG_ADMIN can only view their own role's permissions
      if (user.role !== UserRole.SUPER_ADMIN && user.role !== role) {
        res.status(403).json({
          success: false,
          error: 'Cannot view permissions for other roles',
        });
        return;
      }

      const permissions = await this.getRolePermissionsUseCase.execute(
        role as UserRole,
        tenant?.id
      );

      res.json({
        success: true,
        data: {
          role,
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
   */
  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;
      const { permissionIds } = req.body;
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

      await this.updateRolePermissionsUseCase.execute({
        role: role as UserRole,
        permissionIds,
        tenantId: tenant?.id,
      });

      res.json({
        success: true,
        message: `Permissions updated for role ${role}`,
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
