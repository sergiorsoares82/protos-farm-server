import type { Request, Response } from 'express';
import { CreatePersonUseCase } from '../../application/use-cases/person/CreatePersonUseCase.js';
import { GetPersonUseCase } from '../../application/use-cases/person/GetPersonUseCase.js';
import { UpdatePersonUseCase } from '../../application/use-cases/person/UpdatePersonUseCase.js';
import { AssignRoleUseCase } from '../../application/use-cases/person/AssignRoleUseCase.js';
import { RemoveRoleUseCase } from '../../application/use-cases/person/RemoveRoleUseCase.js';
import type { IPersonRepository } from '../../domain/repositories/IPersonRepository.js';
import type { CreatePersonRequestDTO, UpdatePersonRequestDTO, AssignRoleRequestDTO } from '../../application/dtos/PersonDTOs.js';
import { PersonRole } from '../../domain/enums/PersonRole.js';

export class PersonController {
  private createPersonUseCase: CreatePersonUseCase;
  private getPersonUseCase: GetPersonUseCase;
  private updatePersonUseCase: UpdatePersonUseCase;
  private assignRoleUseCase: AssignRoleUseCase;
  private removeRoleUseCase: RemoveRoleUseCase;

  constructor(personRepository: IPersonRepository) {
    this.createPersonUseCase = new CreatePersonUseCase(personRepository);
    this.getPersonUseCase = new GetPersonUseCase(personRepository);
    this.updatePersonUseCase = new UpdatePersonUseCase(personRepository);
    this.assignRoleUseCase = new AssignRoleUseCase(personRepository);
    this.removeRoleUseCase = new RemoveRoleUseCase(personRepository);
  }

  /**
   * Get all persons
   * GET /api/persons
   */
  async getAllPersons(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const persons = await this.getPersonUseCase.executeAll(tenantId);

      res.status(200).json({
        success: true,
        data: persons,
      });
    } catch (error) {
      console.error('Get all persons error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get persons';

      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Create a new person
   * POST /api/persons
   */
  async createPerson(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const requestData: CreatePersonRequestDTO = req.body;
      const person = await this.createPersonUseCase.execute(requestData, tenantId);

      res.status(201).json({
        success: true,
        data: person,
        message: 'Person created successfully',
      });
    } catch (error) {
      console.error('Create person error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create person';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Get person by ID
   * GET /api/persons/:id
   */
  async getPerson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      const tenantId = req.tenant!.tenantId;
      const person = await this.getPersonUseCase.execute(id, tenantId);

      res.status(200).json({
        success: true,
        data: person,
      });
    } catch (error) {
      console.error('Get person error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get person';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Update person basic info
   * PUT /api/persons/:id
   */
  async updatePerson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      const tenantId = req.tenant!.tenantId;
      const requestData: UpdatePersonRequestDTO = req.body;
      const person = await this.updatePersonUseCase.execute(id, requestData, tenantId);

      res.status(200).json({
        success: true,
        data: person,
        message: 'Person updated successfully',
      });
    } catch (error) {
      console.error('Update person error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update person';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Assign a role to a person
   * POST /api/persons/:id/roles
   */
  async assignRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }
      
      const tenantId = req.tenant!.tenantId;
      const requestData: AssignRoleRequestDTO = req.body;
      const person = await this.assignRoleUseCase.execute(id, requestData, tenantId);

      res.status(200).json({
        success: true,
        data: person,
        message: `Role ${requestData.role} assigned successfully`,
      });
    } catch (error) {
      console.error('Assign role error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign role';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Remove a role from a person
   * DELETE /api/persons/:id/roles/:role
   */
  async removeRole(req: Request, res: Response): Promise<void> {
    try {
      const { id, role } = req.params;

      // Validate parameters are strings
      if (!id || typeof id !== 'string' || !role || typeof role !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid parameters',
        });
        return;
      }

      // Validate role
      if (!Object.values(PersonRole).includes(role as PersonRole)) {
        res.status(400).json({
          success: false,
          error: `Invalid role: ${role}`,
        });
        return;
      }

      const tenantId = req.tenant!.tenantId;
      const person = await this.removeRoleUseCase.execute(id, role as PersonRole, tenantId);

      res.status(200).json({
        success: true,
        data: person,
        message: `Role ${role} removed successfully`,
      });
    } catch (error) {
      console.error('Remove role error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove role';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Delete a person
   * DELETE /api/persons/:id
   */
  async deletePerson(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid ID parameter',
        });
        return;
      }

      const tenantId = req.tenant!.tenantId;
      // Note: This will delete the person and cascade to all roles
      await this.createPersonUseCase['personRepository'].delete(id, tenantId);

      res.status(200).json({
        success: true,
        message: 'Person deleted successfully',
      });
    } catch (error) {
      console.error('Delete person error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete person';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}
