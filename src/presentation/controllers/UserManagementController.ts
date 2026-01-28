import type { Request, Response } from 'express';
import { GetUsersUseCase } from '../../application/use-cases/user/GetUsersUseCase.js';
import { CreateUserUseCase } from '../../application/use-cases/user/CreateUserUseCase.js';
import { UpdateUserUseCase } from '../../application/use-cases/user/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../application/use-cases/user/DeleteUserUseCase.js';
import { LinkPersonToUserUseCase } from '../../application/use-cases/user/LinkPersonToUserUseCase.js';
import { UnlinkPersonFromUserUseCase } from '../../application/use-cases/user/UnlinkPersonFromUserUseCase.js';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { IPersonRepository } from '../../domain/repositories/IPersonRepository.js';
import type { CreateUserRequestDTO, UpdateUserRequestDTO, LinkPersonToUserRequestDTO } from '../../application/dtos/UserManagementDTOs.js';
import { UserRole } from '../../domain/enums/UserRole.js';

export class UserManagementController {
  private getUsersUseCase: GetUsersUseCase;
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  private linkPersonToUserUseCase: LinkPersonToUserUseCase;
  private unlinkPersonFromUserUseCase: UnlinkPersonFromUserUseCase;

  constructor(userRepository: IUserRepository, personRepository: IPersonRepository) {
    this.getUsersUseCase = new GetUsersUseCase(userRepository);
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    this.linkPersonToUserUseCase = new LinkPersonToUserUseCase(personRepository, userRepository);
    this.unlinkPersonFromUserUseCase = new UnlinkPersonFromUserUseCase(personRepository);
  }

  /**
   * Get users (filtered based on role)
   * GET /api/users
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      
      // Super admin can filter by tenant, org admin gets their own tenant only
      let tenantId: string | undefined;
      
      if (user.role === UserRole.SUPER_ADMIN) {
        tenantId = req.query.tenantId as string | undefined;
      } else {
        tenantId = user.tenantId;
      }
      
      const users = await this.getUsersUseCase.execute(tenantId);
      
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Get users error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get users';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUser(req: Request, res: Response): Promise<void> {
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
      
      const targetUser = await this.getUsersUseCase.executeById(id);
      
      // Check permissions: org admin can only view users in their org
      if (user.role === UserRole.ORG_ADMIN && targetUser.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot view users from other organizations',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: targetUser,
      });
    } catch (error) {
      console.error('Get user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Create new user
   * POST /api/users
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const requestData: CreateUserRequestDTO = req.body;
      
      // Validation: org admin can only create users in their own org
      if (user.role === UserRole.ORG_ADMIN && requestData.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot create users in other organizations',
        });
        return;
      }
      
      // Validation: org admin cannot create super admins
      if (user.role === UserRole.ORG_ADMIN && requestData.role === UserRole.SUPER_ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Cannot create super admin users',
        });
        return;
      }
      
      const newUser = await this.createUserUseCase.execute(requestData);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const requestData: UpdateUserRequestDTO = req.body;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      // Get target user to check permissions
      const targetUser = await this.getUsersUseCase.executeById(id);
      
      // Validation: org admin can only update users in their own org
      if (user.role === UserRole.ORG_ADMIN && targetUser.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot update users from other organizations',
        });
        return;
      }
      
      const updatedUser = await this.updateUserUseCase.execute(id, requestData, user.role);
      
      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
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
      
      // Get target user to check permissions
      const targetUser = await this.getUsersUseCase.executeById(id);
      
      // Validation: org admin can only delete users in their own org
      if (user.role === UserRole.ORG_ADMIN && targetUser.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot delete users from other organizations',
        });
        return;
      }
      
      // Prevent users from deleting themselves
      if (id === user.userId) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
        });
        return;
      }
      
      await this.deleteUserUseCase.execute(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Link person to user
   * POST /api/users/:id/link-person
   */
  async linkPerson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { personId }: LinkPersonToUserRequestDTO = req.body;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID parameter',
        });
        return;
      }

      if (!personId) {
        res.status(400).json({
          success: false,
          error: 'Person ID is required',
        });
        return;
      }
      
      // Get target user to check permissions
      const targetUser = await this.getUsersUseCase.executeById(id);
      
      // Validation: org admin can only link persons in their own org
      if (user.role === UserRole.ORG_ADMIN && targetUser.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot link persons to users from other organizations',
        });
        return;
      }
      
      await this.linkPersonToUserUseCase.execute(personId, id, targetUser.tenantId);
      
      res.status(200).json({
        success: true,
        message: 'Person linked to user successfully',
      });
    } catch (error) {
      console.error('Link person to user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to link person to user';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Unlink person from user
   * DELETE /api/users/:userId/persons/:personId
   */
  async unlinkPerson(req: Request, res: Response): Promise<void> {
    try {
      const { userId, personId } = req.params;
      const user = (req as any).user;
      
      if (!userId || typeof userId !== 'string' || !personId || typeof personId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameters',
        });
        return;
      }
      
      // Get target user to check permissions
      const targetUser = await this.getUsersUseCase.executeById(userId);
      
      // Validation: org admin can only unlink persons in their own org
      if (user.role === UserRole.ORG_ADMIN && targetUser.tenantId !== user.tenantId) {
        res.status(403).json({
          success: false,
          error: 'Cannot unlink persons from users in other organizations',
        });
        return;
      }
      
      await this.unlinkPersonFromUserUseCase.execute(personId, targetUser.tenantId);
      
      res.status(200).json({
        success: true,
        message: 'Person unlinked from user successfully',
      });
    } catch (error) {
      console.error('Unlink person from user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink person from user';
      
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
