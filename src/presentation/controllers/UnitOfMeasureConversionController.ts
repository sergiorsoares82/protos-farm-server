import type { Request, Response } from 'express';
import { UserRole } from '../../domain/enums/UserRole.js';
import { UnitOfMeasureConversionService } from '../../application/services/UnitOfMeasureConversionService.js';
import type {
  CreateUnitOfMeasureConversionDTO,
  UpdateUnitOfMeasureConversionDTO,
} from '../../application/dtos/UnitOfMeasureConversionDTOs.js';

export class UnitOfMeasureConversionController {
  constructor(private conversionService: UnitOfMeasureConversionService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.conversionService.getAll(tenantId);
      res.json(items.map((c) => c.toJSON()));
    } catch (error) {
      console.error('Error fetching unit conversions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.conversionService.get(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching unit conversion:', error);
      res.status(404).json({ error: 'Unit conversion not found' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const role = user.role as UserRole;
      const tenantId = user.tenantId;
      const data: CreateUnitOfMeasureConversionDTO = req.body;
      const created = await this.conversionService.create(role, tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating unit conversion:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof Error && (error.message.includes('Only Super Admin') || error.message.includes('own organization'))) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
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
      const data: UpdateUnitOfMeasureConversionDTO = req.body;
      const updated = await this.conversionService.update(
        role,
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating unit conversion:', error);
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
      await this.conversionService.delete(role, tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting unit conversion:', error);
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
