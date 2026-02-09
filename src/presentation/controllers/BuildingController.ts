import type { Request, Response } from 'express';
import { BuildingService } from '../../application/services/BuildingService.js';
import type { CreateBuildingDTO, UpdateBuildingDTO } from '../../application/dtos/BuildingDTOs.js';

export class BuildingController {
  constructor(private buildingService: BuildingService) {}

  async getAllBuildings(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.buildingService.getAllBuildings(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createBuilding(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateBuildingDTO = req.body;
      const newItem = await this.buildingService.createBuilding(tenantId, data);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating building:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async getBuilding(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.buildingService.getBuilding(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching building:', error);
      res.status(404).json({ error: 'Building not found' });
    }
  }

  async updateBuilding(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateBuildingDTO = req.body;
      const updatedItem = await this.buildingService.updateBuilding(tenantId, id as string, data);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating building:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async deleteBuilding(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.buildingService.deleteBuilding(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting building:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
