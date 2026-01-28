import type { Request, Response } from 'express';
import { FieldService } from '../../application/services/FieldService.js';
import type { CreateFieldDTO, UpdateFieldDTO } from '../../application/dtos/FieldDTOs.js';

export class FieldController {
  constructor(private fieldService: FieldService) {}

  async getAllFields(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.fieldService.getAllFields(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching fields:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createField(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateFieldDTO = req.body;
      const newItem = await this.fieldService.createField(tenantId, data);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating field:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    }
  }

  async getField(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.fieldService.getField(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching field:', error);
      res.status(404).json({ error: 'Field not found' });
    }
  }

  async updateField(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateFieldDTO = req.body;
      const updatedItem = await this.fieldService.updateField(tenantId, id as string, data);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating field:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    }
  }

  async deleteField(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.fieldService.deleteField(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

