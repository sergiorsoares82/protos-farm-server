import type { Request, Response } from 'express';
import { UserRole } from '../../domain/enums/UserRole.js';
import { UnitOfMeasureService } from '../../application/services/UnitOfMeasureService.js';
import type {
  CreateUnitOfMeasureDTO,
  UpdateUnitOfMeasureDTO,
} from '../../application/dtos/UnitOfMeasureDTOs.js';

export class UnitOfMeasureController {
  constructor(private unitOfMeasureService: UnitOfMeasureService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.unitOfMeasureService.getAll(tenantId);
      res.json(items.map((u) => u.toJSON()));
    } catch (error) {
      console.error('Error fetching units of measure:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.unitOfMeasureService.get(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching unit of measure:', error);
      res.status(404).json({ error: 'Unit of measure not found' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const role = user.role as UserRole;
      const tenantId = user.tenantId;
      const data: CreateUnitOfMeasureDTO = req.body;
      const created = await this.unitOfMeasureService.create(role, tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating unit of measure:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('Only Super Admin')) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('own organization')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const role = user.role as UserRole;
      const tenantId = user.tenantId;
      const { id } = req.params;
      const data: UpdateUnitOfMeasureDTO = req.body;
      const updated = await this.unitOfMeasureService.update(
        role,
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating unit of measure:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && (error.message.includes('permission') || error.message.includes('Only Super Admin'))) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const role = user.role as UserRole;
      const tenantId = user.tenantId;
      const { id } = req.params;
      await this.unitOfMeasureService.delete(role, tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting unit of measure:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && (error.message.includes('permission') || error.message.includes('Only Super Admin'))) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
