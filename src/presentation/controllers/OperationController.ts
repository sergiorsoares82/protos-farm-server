import type { Request, Response } from 'express';
import { OperationService } from '../../application/services/OperationService.js';
import type { CreateOperationDTO, UpdateOperationDTO } from '../../application/dtos/OperationDTOs.js';

export class OperationController {
    constructor(private readonly operationService: OperationService) {}

    async getAllOperations(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const items = await this.operationService.getAllOperations(tenantId);
            res.json(items);
        } catch (error) {
            console.error('Error fetching operations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createOperation(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data: CreateOperationDTO = req.body;
            const item = await this.operationService.createOperation(tenantId, data);
            res.status(201).json(item);
        } catch (error) {
            console.error('Error creating operation:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async getOperation(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const item = await this.operationService.getOperation(tenantId, id as string);
            res.json(item);
        } catch (error) {
            console.error('Error fetching operation:', error);
            res.status(404).json({ error: 'Operation not found' });
        }
    }

    async updateOperation(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const data: UpdateOperationDTO = req.body;
            const item = await this.operationService.updateOperation(tenantId, id as string, data);
            res.json(item);
        } catch (error) {
            console.error('Error updating operation:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async deleteOperation(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            await this.operationService.deleteOperation(tenantId, id as string);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting operation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
