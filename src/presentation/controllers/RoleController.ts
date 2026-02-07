import type { Request, Response } from 'express';
import { GetAllRolesUseCase } from '../../application/use-cases/GetAllRolesUseCase.js';
import { CreateRoleUseCase } from '../../application/use-cases/CreateRoleUseCase.js';
import { UpdateRoleUseCase } from '../../application/use-cases/UpdateRoleUseCase.js';
import { DeleteRoleUseCase } from '../../application/use-cases/DeleteRoleUseCase.js';
import { GetRoleStatsUseCase } from '../../application/use-cases/GetRoleStatsUseCase.js';

export class RoleController {
  constructor(
    private getAllRolesUseCase: GetAllRolesUseCase,
    private createRoleUseCase: CreateRoleUseCase,
    private updateRoleUseCase: UpdateRoleUseCase,
    private deleteRoleUseCase: DeleteRoleUseCase,
    private getRoleStatsUseCase: GetRoleStatsUseCase
  ) {}

  /**
   * GET /api/roles
   * Get all roles
   */
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.getAllRolesUseCase.execute();

      res.json({
        success: true,
        data: roles.map(r => r.toJSON()),
      });
    } catch (error) {
      console.error('Error getting all roles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get roles',
      });
    }
  }

  /**
   * POST /api/roles
   * Create a new role
   */
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, displayName, description } = req.body;

      // Validate required fields
      if (!name || !displayName) {
        res.status(400).json({
          success: false,
          error: 'name and displayName are required',
        });
        return;
      }

      const role = await this.createRoleUseCase.execute({
        name,
        displayName,
        description: description || '',
      });

      res.status(201).json({
        success: true,
        data: role.toJSON(),
        message: `Role ${role.getName()} created successfully`,
      });
    } catch (error) {
      console.error('Error creating role:', error);
      const message = error instanceof Error ? error.message : 'Failed to create role';
      const status = message.includes('already exists') ? 409 : 500;
      res.status(status).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * PUT /api/roles/:id
   * Update a role
   */
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { displayName, description } = req.body;

      const role = await this.updateRoleUseCase.execute({
        id,
        displayName,
        description,
      });

      res.json({
        success: true,
        data: role.toJSON(),
        message: `Role ${role.getName()} updated successfully`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      const message = error instanceof Error ? error.message : 'Failed to update role';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * DELETE /api/roles/:id
   * Delete a role
   */
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.deleteRoleUseCase.execute({ id });

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete role';
      
      let status = 500;
      if (message.includes('not found')) {
        status = 404;
      } else if (message.includes('cannot be deleted') || message.includes('assigned to')) {
        status = 400;
      }
      
      res.status(status).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/roles/:id/stats
   * Get role statistics (user count, can be deleted, etc.)
   */
  async getRoleStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await this.getRoleStatsUseCase.execute({ roleId: id });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting role stats:', error);
      const message = error instanceof Error ? error.message : 'Failed to get role stats';
      const status = message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        error: message,
      });
    }
  }
}
