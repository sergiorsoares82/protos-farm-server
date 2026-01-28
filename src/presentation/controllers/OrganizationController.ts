import type { Request, Response } from 'express';
import { GetOrganizationsUseCase } from '../../application/use-cases/organization/GetOrganizationsUseCase.js';
import { CreateOrganizationUseCase } from '../../application/use-cases/organization/CreateOrganizationUseCase.js';
import { UpdateOrganizationUseCase } from '../../application/use-cases/organization/UpdateOrganizationUseCase.js';
import { DeleteOrganizationUseCase } from '../../application/use-cases/organization/DeleteOrganizationUseCase.js';
import type { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository.js';
import type { CreateOrganizationRequestDTO, UpdateOrganizationRequestDTO } from '../../application/dtos/OrganizationDTOs.js';
import { UserRole } from '../../domain/enums/UserRole.js';

export class OrganizationController {
  private getOrganizationsUseCase: GetOrganizationsUseCase;
  private createOrganizationUseCase: CreateOrganizationUseCase;
  private updateOrganizationUseCase: UpdateOrganizationUseCase;
  private deleteOrganizationUseCase: DeleteOrganizationUseCase;

  constructor(organizationRepository: IOrganizationRepository) {
    this.getOrganizationsUseCase = new GetOrganizationsUseCase(organizationRepository);
    this.createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
    this.updateOrganizationUseCase = new UpdateOrganizationUseCase(organizationRepository);
    this.deleteOrganizationUseCase = new DeleteOrganizationUseCase(organizationRepository);
  }

  /**
   * Get all organizations (Super admin only)
   * GET /api/organizations
   */
  async getAllOrganizations(req: Request, res: Response): Promise<void> {
    try {
      const organizations = await this.getOrganizationsUseCase.executeAll();
      
      res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      console.error('Get all organizations error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get organizations';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get current user's organization
   * GET /api/organizations/me
   */
  async getMyOrganization(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const organization = await this.getOrganizationsUseCase.execute(tenantId);
      
      res.status(200).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      console.error('Get my organization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get organization';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get organization by ID
   * GET /api/organizations/:id
   */
  async getOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      const organization = await this.getOrganizationsUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      console.error('Get organization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get organization';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Create new organization (Super admin only)
   * POST /api/organizations
   */
  async createOrganization(req: Request, res: Response): Promise<void> {
    try {
      const requestData: CreateOrganizationRequestDTO = req.body;
      const organization = await this.createOrganizationUseCase.execute(requestData);
      
      res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error) {
      console.error('Create organization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Update organization (Super admin or org admin for their own org)
   * PUT /api/organizations/:id
   */
  async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      // Check permissions: super admin can update any org, org admin can only update their own
      if (user.role !== UserRole.SUPER_ADMIN && user.tenantId !== id) {
        res.status(403).json({
          success: false,
          error: 'Cannot update other organizations',
        });
        return;
      }
      
      const requestData: UpdateOrganizationRequestDTO = req.body;
      const organization = await this.updateOrganizationUseCase.execute(id, requestData);
      
      res.status(200).json({
        success: true,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      console.error('Update organization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Delete organization (Super admin only)
   * DELETE /api/organizations/:id
   */
  async deleteOrganization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      await this.deleteOrganizationUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      console.error('Delete organization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete organization';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
