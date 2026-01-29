import type { Request, Response } from 'express';
import { MachineService } from '../../application/services/MachineService.js';
import type { CreateMachineDTO, UpdateMachineDTO } from '../../application/dtos/MachineDTOs.js';

export class MachineController {
  constructor(private machineService: MachineService) {}

  async getAllMachines(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.machineService.getAllMachines(tenantId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching machines:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createMachine(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateMachineDTO = req.body;
      const created = await this.machineService.createMachine(tenantId, data);
      res.status(201).json(created);
    } catch (error) {
      console.error('Error creating machine:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getMachine(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.machineService.getMachine(tenantId, id as string);
      res.json(item);
    } catch (error) {
      console.error('Error fetching machine:', error);
      res.status(404).json({ error: 'Machine not found' });
    }
  }

  async updateMachine(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateMachineDTO = req.body;
      const updated = await this.machineService.updateMachine(
        tenantId,
        id as string,
        data,
      );
      res.json(updated);
    } catch (error) {
      console.error('Error updating machine:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteMachine(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.machineService.deleteMachine(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting machine:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
