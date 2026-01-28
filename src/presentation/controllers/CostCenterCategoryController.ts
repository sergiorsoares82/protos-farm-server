import type { Request, Response } from 'express';
import { CostCenterCategoryService } from '../../application/services/CostCenterCategoryService.js';
import type {
  CreateCostCenterCategoryDTO,
  UpdateCostCenterCategoryDTO,
} from '../../application/dtos/CostCenterCategoryDTOs.js';

export class CostCenterCategoryController {
  constructor(private categoryService: CostCenterCategoryService) {}

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const items = await this.categoryService.getAllCategories(tenantId);
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching cost center categories:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const data = req.body as CreateCostCenterCategoryDTO;
      const created = await this.categoryService.createCategory(tenantId, data);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error('Error creating cost center category:', error);
      const message =
        error instanceof Error && error.message.includes('already exists')
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to create category';
      res.status(400).json({ success: false, error: message });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const { id } = req.params as { id?: string };
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      const data = req.body as UpdateCostCenterCategoryDTO;
      const updated = await this.categoryService.updateCategory(tenantId, id, data);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating cost center category:', error);
      const message =
        error instanceof Error && error.message.includes('already exists')
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Failed to update category';
      res.status(400).json({ success: false, error: message });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user!.tenantId as string;
      const { id } = req.params as { id?: string };
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid id' });
        return;
      }
      await this.categoryService.deleteCategory(tenantId, id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting cost center category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

