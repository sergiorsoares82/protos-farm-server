import type { Request, Response } from 'express';
import { MachineTypeService } from '../../application/services/MachineTypeService.js';
import type {
  CreateMachineTypeDTO,
  UpdateMachineTypeDTO,
} from '../../application/dtos/MachineTypeDTOs.js';

export class MachineTypeController {
  constructor(private machineTypeService: MachineTypeService) {}

  async getAllMachineTypes(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.machineTypeService.getAllMachineTypes(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching machine types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createMachineType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateMachineTypeDTO = req.body;
      const created = await this.machineTypeService.createMachineType(tenantId, data);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating machine type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getMachineType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.machineTypeService.getMachineType(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching machine type:', error);
      res.status(404).json({ error: 'Machine type not found' });
    }
  }

  async updateMachineType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateMachineTypeDTO = req.body;
      const updated = await this.machineTypeService.updateMachineType(
        tenantId,
        id as string,
        data,
      );
      res.json(updated);
    } catch (error) {
      console.error('Error updating machine type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteMachineType(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.machineTypeService.deleteMachineType(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting machine type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
