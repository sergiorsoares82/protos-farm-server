import type { Request, Response } from 'express';
import { StockMovementService } from '../../application/services/StockMovementService.js';
import type {
  CreateStockMovementDTO,
  UpdateStockMovementDTO,
} from '../../application/dtos/StockMovementDTOs.js';

export class StockMovementController {
  constructor(private stockMovementService: StockMovementService) {}

  async getAllMovements(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.stockMovementService.getAllMovements(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createMovement(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateStockMovementDTO = req.body;
      const created = await this.stockMovementService.createMovement(tenantId, data);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      const msg = error instanceof Error ? error.message : 'Invalid request';
      if (msg.includes('not found')) {
        res.status(404).json({ error: msg });
      } else {
        res.status(400).json({ error: msg });
      }
    }
  }

  async getMovement(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.stockMovementService.getMovement(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching stock movement:', error);
      res.status(404).json({ error: 'Stock movement not found' });
    }
  }

  async updateMovement(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateStockMovementDTO = req.body;
      const updated = await this.stockMovementService.updateMovement(
        tenantId,
        id as string,
        data,
      );
      res.json(updated);
    } catch (error) {
      console.error('Error updating stock movement:', error);
      const msg = error instanceof Error ? error.message : 'Invalid request';
      if (msg.includes('not found')) {
        res.status(404).json({ error: msg });
      } else {
        res.status(400).json({ error: msg });
      }
    }
  }

  async deleteMovement(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.stockMovementService.deleteMovement(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting stock movement:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
