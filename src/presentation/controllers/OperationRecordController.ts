import type { Request, Response } from 'express';
import { OperationRecordService } from '../../application/services/OperationRecordService.js';
import type { CreateOperationRecordDTO, UpdateOperationRecordDTO } from '../../application/dtos/OperationRecordDTOs.js';

export class OperationRecordController {
  constructor(private operationRecordService: OperationRecordService) {}

  async getAllOperationRecords(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.operationRecordService.getAllOperationRecords(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching operation records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createOperationRecord(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateOperationRecordDTO = req.body;
      const created = await this.operationRecordService.createOperationRecord(tenantId, data);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating operation record:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getOperationRecord(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.operationRecordService.getOperationRecord(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching operation record:', error);
      res.status(404).json({ error: 'Operation record not found' });
    }
  }

  async updateOperationRecord(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateOperationRecordDTO = req.body;
      const updated = await this.operationRecordService.updateOperationRecord(
        tenantId,
        id as string,
        data,
      );
      res.json(updated);
    } catch (error) {
      console.error('Error updating operation record:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteOperationRecord(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.operationRecordService.deleteOperationRecord(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting operation record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
