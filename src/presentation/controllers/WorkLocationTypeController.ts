import type { Request, Response } from 'express';
import { WorkLocationTypeService } from '../../application/services/WorkLocationTypeService.js';
import type {
  CreateWorkLocationTypeDTO,
  UpdateWorkLocationTypeDTO,
} from '../../application/dtos/WorkLocationTypeDTOs.js';

export class WorkLocationTypeController {
  constructor(private workLocationTypeService: WorkLocationTypeService) {}

  async getAllTypes(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.workLocationTypeService.getAllTypes(tenantId);
      res.json(items.map((t) => t.toJSON()));
    } catch (error) {
      console.error('Error fetching work location types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateWorkLocationTypeDTO = req.body;
      const created = await this.workLocationTypeService.createType(tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating work location type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
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
      const item = await this.workLocationTypeService.getType(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching work location type:', error);
      res.status(404).json({ error: 'Work location type not found' });
    }
  }

  async updateType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateWorkLocationTypeDTO = req.body;
      const updated = await this.workLocationTypeService.updateType(
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating work location type:', error);
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
      await this.workLocationTypeService.deleteType(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting work location type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
