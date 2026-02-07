import type { Request, Response } from 'express';
import { ActivityTypeService } from '../../application/services/ActivityTypeService.js';
import type {
  CreateActivityTypeDTO,
  UpdateActivityTypeDTO,
} from '../../application/dtos/ActivityTypeDTOs.js';
import { UserRole } from '../../domain/enums/UserRole.js';

export class ActivityTypeController {
  constructor(private activityTypeService: ActivityTypeService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const items = await this.activityTypeService.getAll(tenantId);
      res.json(items.map((t) => t.toJSON()));
    } catch (error) {
      console.error('Error fetching activity types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const { id } = req.params;
      const item = await this.activityTypeService.getById(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching activity type:', error);
      res.status(404).json({ error: 'Activity type not found' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const data: CreateActivityTypeDTO = req.body;
      const created = await this.activityTypeService.create(
        tenantId,
        data,
        isSuperAdmin,
      );
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating activity type:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const { id } = req.params;
      const data: UpdateActivityTypeDTO = req.body;
      const updated = await this.activityTypeService.update(
        tenantId,
        id as string,
        data,
        isSuperAdmin,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating activity type:', error);
      if (error instanceof Error && error.message.includes('cannot be edited')) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof Error && error.message === 'Activity type not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const { id } = req.params;
      await this.activityTypeService.delete(tenantId, id as string, isSuperAdmin);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting activity type:', error);
      if (error instanceof Error && error.message === 'Activity type not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('cannot be deleted')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
