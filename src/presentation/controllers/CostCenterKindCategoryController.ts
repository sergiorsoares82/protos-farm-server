import type { Request, Response } from 'express';
import { CostCenterKindCategoryService } from '../../application/services/CostCenterKindCategoryService.js';
import type {
  CreateCostCenterKindCategoryDTO,
  UpdateCostCenterKindCategoryDTO,
} from '../../application/dtos/CostCenterKindCategoryDTOs.js';

export class CostCenterKindCategoryController {
  constructor(private readonly service: CostCenterKindCategoryService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const items = await this.service.getAll(tenantId);
      res.json({ success: true, data: items.map((c) => c.toJSON()) });
    } catch (error) {
      console.error('Error fetching cost center kind categories:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const category = await this.service.getById(tenantId, id);
      res.json({ success: true, data: category.toJSON() });
    } catch (error) {
      if (error instanceof Error && error.message === 'Cost center kind category not found') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      console.error('Error fetching cost center kind category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const data = req.body as CreateCostCenterKindCategoryDTO;
      const created = await this.service.create(tenantId, data);
      res.status(201).json({ success: true, data: created.toJSON() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create kind category';
      if (message.includes('already exists') || message.includes('Only one kind category')) {
        res.status(400).json({ success: false, error: message });
        return;
      }
      console.error('Error creating cost center kind category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const data = req.body as UpdateCostCenterKindCategoryDTO;
      const updated = await this.service.update(tenantId, id, data);
      res.json({ success: true, data: updated.toJSON() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update kind category';
      if (message.includes('already exists') || message.includes('Only one kind category')) {
        res.status(400).json({ success: false, error: message });
        return;
      }
      console.error('Error updating cost center kind category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      await this.service.delete(tenantId, id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete';
      if (message.includes('Cannot delete')) {
        res.status(400).json({ success: false, error: message });
        return;
      }
      console.error('Error deleting cost center kind category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
