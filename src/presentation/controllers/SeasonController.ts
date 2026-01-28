import type { Request, Response } from 'express';
import { SeasonService } from '../../application/services/SeasonService.js';
import type { CreateSeasonDTO, UpdateSeasonDTO } from '../../application/dtos/SeasonDTOs.js';

export class SeasonController {
  constructor(private seasonService: SeasonService) {}

  async getAllSeasons(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.seasonService.getAllSeasons(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createSeason(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateSeasonDTO = req.body;
      const newItem = await this.seasonService.createSeason(tenantId, data);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating season:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    }
  }

  async getSeason(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.seasonService.getSeason(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching season:', error);
      res.status(404).json({ error: 'Season not found' });
    }
  }

  async updateSeason(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateSeasonDTO = req.body;
      const updatedItem = await this.seasonService.updateSeason(tenantId, id as string, data);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating season:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    }
  }

  async deleteSeason(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.seasonService.deleteSeason(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting season:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

