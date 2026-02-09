import type { Request, Response } from 'express';
import { CostCenterService } from '../../application/services/CostCenterService.js';
import type { CreateCostCenterDTO, UpdateCostCenterDTO, CreateMachineWithCostCenterDTO } from '../../application/dtos/CostCenterDTOs.js';
import type { CreateBuildingWithCostCenterDTO } from '../../application/dtos/BuildingDTOs.js';

export class CostCenterController {
    constructor(private costCenterService: CostCenterService) { }

    async getAllCostCenters(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const items = await this.costCenterService.getAllCostCenters(tenantId);
            res.json(items);
        } catch (error) {
            console.error('Error fetching cost centers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /** Centros de custo por categoria (ex: AGR = Agricultura). Usado no cadastro de safra para talhões. */
    async getCostCentersByCategory(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const categoryCode = (req.params.categoryCode ?? '').toUpperCase();
            if (!categoryCode) {
                res.status(400).json({ error: 'Category code is required' });
                return;
            }
            const items = await this.costCenterService.getCostCentersByCategoryCode(tenantId, categoryCode);
            res.json(items);
        } catch (error) {
            console.error('Error fetching cost centers by category:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data: CreateCostCenterDTO = req.body;
            const newItem = await this.costCenterService.createCostCenter(tenantId, data);
            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error creating cost center:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async getCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const item = await this.costCenterService.getCostCenter(tenantId, id as string);
            res.json(item);
        } catch (error) {
            console.error('Error fetching cost center:', error);
            res.status(404).json({ error: 'Cost Center not found' });
        }
    }

    async updateCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const data: UpdateCostCenterDTO = req.body;
            const updatedItem = await this.costCenterService.updateCostCenter(tenantId, id as string, data);
            res.json(updatedItem);
        } catch (error) {
            console.error('Error updating cost center:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async deleteCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            await this.costCenterService.deleteCostCenter(tenantId, id as string);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting cost center:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createMachineWithCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data: CreateMachineWithCostCenterDTO = req.body;
            const result = await this.costCenterService.createMachineWithCostCenter(tenantId, data);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating machine with cost center:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async createBuildingWithCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data: CreateBuildingWithCostCenterDTO = req.body;
            const result = await this.costCenterService.createBuildingWithCostCenter(tenantId, data);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating building with cost center:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }
}
