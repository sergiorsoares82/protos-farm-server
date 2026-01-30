import type { Request, Response } from 'express';
import { WorkLocationService } from '../../application/services/WorkLocationService.js';
import type {
  CreateWorkLocationDTO,
  UpdateWorkLocationDTO,
} from '../../application/dtos/WorkLocationDTOs.js';

export class WorkLocationController {
  constructor(private workLocationService: WorkLocationService) {}

  async getAllWorkLocations(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.workLocationService.getAllWorkLocations(tenantId);
      res.json(items.map((w) => w.toJSON()));
    } catch (error) {
      console.error('Error fetching work locations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createWorkLocation(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateWorkLocationDTO = req.body;
      const newItem = await this.workLocationService.createWorkLocation(tenantId, data);
      res.status(201).json(newItem.toJSON());
    } catch (error) {
      console.error('Error creating work location:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getWorkLocation(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.workLocationService.getWorkLocation(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching work location:', error);
      res.status(404).json({ error: 'Work location not found' });
    }
  }

  async updateWorkLocation(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateWorkLocationDTO = req.body;
      const updatedItem = await this.workLocationService.updateWorkLocation(
        tenantId,
        id as string,
        data,
      );
      res.json(updatedItem.toJSON());
    } catch (error) {
      console.error('Error updating work location:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteWorkLocation(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.workLocationService.deleteWorkLocation(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting work location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
