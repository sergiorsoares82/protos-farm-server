import type { Request, Response } from 'express';
import { AssetService } from '../../application/services/AssetService.js';
import type { CreateAssetDTO, UpdateAssetDTO } from '../../application/dtos/AssetDTOs.js';

export class AssetController {
  constructor(private assetService: AssetService) {}

  async getAllAssets(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.assetService.getAllAssets(tenantId);
      res.json(items.map((a) => a.toJSON()));
    } catch (error) {
      console.error('Error fetching assets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createAsset(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateAssetDTO = req.body;
      const created = await this.assetService.createAsset(tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating asset:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  async getAsset(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.assetService.getAsset(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching asset:', error);
      res.status(404).json({ error: 'Asset not found' });
    }
  }

  async updateAsset(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateAssetDTO = req.body;
      const updated = await this.assetService.updateAsset(
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating asset:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }

  async deleteAsset(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.assetService.deleteAsset(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
