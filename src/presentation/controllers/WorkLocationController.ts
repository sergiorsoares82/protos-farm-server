import type { Request, Response } from 'express';
import { WorkLocationService } from '../../application/services/WorkLocationService.js';
import type { IFieldSeasonRepository } from '../../domain/repositories/IFieldSeasonRepository.js';
import type { SeasonService } from '../../application/services/SeasonService.js';
import type {
  CreateWorkLocationDTO,
  UpdateWorkLocationDTO,
} from '../../application/dtos/WorkLocationDTOs.js';

export class WorkLocationController {
  constructor(
    private workLocationService: WorkLocationService,
    private fieldSeasonRepository?: IFieldSeasonRepository,
    private seasonService?: SeasonService,
  ) {}

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

  async getLatestSeason(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      
      if (!this.fieldSeasonRepository) {
        res.status(404).json({ error: 'Field season repository not available' });
        return;
      }

      const link = await this.fieldSeasonRepository.getLatestSeasonForField(id as string, tenantId);
      
      if (!link) {
        res.status(404).json({ error: 'No season found for this field' });
        return;
      }

      res.json(link);
    } catch (error) {
      console.error('Error fetching latest season:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /** Contexto de operação: cultura/safra ativa no talhão na data (para exibir em readonly no formulário). */
  async getOperationContext(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const workLocationId = req.params.id as string;
      const date = req.query.date as string;
      if (!workLocationId || !date) {
        res.status(400).json({ error: 'Work location ID and query parameter date (YYYY-MM-DD) are required' });
        return;
      }
      if (!this.seasonService) {
        res.status(503).json({ error: 'Operation context not available' });
        return;
      }
      const context = await this.seasonService.getOperationContext(tenantId, workLocationId, date);
      if (!context) {
        res.json({ costCenterId: null, message: 'Nenhuma cultura ativa nesta data neste talhão' });
        return;
      }
      res.json(context);
    } catch (error) {
      console.error('Error fetching operation context:', error);
      res.status(500).json({ error: 'Internal server error' });
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
