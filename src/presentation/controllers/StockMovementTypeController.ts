import type { Request, Response } from 'express';
import { StockMovementTypeService } from '../../application/services/StockMovementTypeService.js';
import type {
  CreateStockMovementTypeDTO,
  UpdateStockMovementTypeDTO,
} from '../../application/dtos/StockMovementTypeDTOs.js';

export class StockMovementTypeController {
  constructor(private stockMovementTypeService: StockMovementTypeService) {}

  async getAllTypes(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.stockMovementTypeService.getAllTypes(tenantId);
      res.json(items.map((t) => t.toJSON()));
    } catch (error) {
      console.error('Error fetching stock movement types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateStockMovementTypeDTO = req.body;
      const created = await this.stockMovementTypeService.createType(tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating stock movement type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('reserved')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.stockMovementTypeService.getType(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching stock movement type:', error);
      res.status(404).json({ error: 'Stock movement type not found' });
    }
  }

  async updateType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateStockMovementTypeDTO = req.body;
      const updated = await this.stockMovementTypeService.updateType(
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating stock movement type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.stockMovementTypeService.deleteType(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting stock movement type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
