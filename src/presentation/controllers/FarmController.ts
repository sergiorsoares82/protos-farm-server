import type { Request, Response } from 'express';
import type { FarmRepository } from '../../infrastructure/repositories/FarmRepository.js';
import type { ProductionSiteRepository } from '../../infrastructure/repositories/ProductionSiteRepository.js';
import { GetFarmsUseCase } from '../../application/use-cases/farm/GetFarmsUseCase.js';
import { GetFarmUseCase } from '../../application/use-cases/farm/GetFarmUseCase.js';
import { CreateFarmUseCase } from '../../application/use-cases/farm/CreateFarmUseCase.js';
import { UpdateFarmUseCase } from '../../application/use-cases/farm/UpdateFarmUseCase.js';
import { DeleteFarmUseCase } from '../../application/use-cases/farm/DeleteFarmUseCase.js';

export class FarmController {
  private getFarms: GetFarmsUseCase;
  private getFarm: GetFarmUseCase;
  private createFarm: CreateFarmUseCase;
  private updateFarm: UpdateFarmUseCase;
  private deleteFarm: DeleteFarmUseCase;
  private productionSiteRepository: ProductionSiteRepository;

  constructor(
    farmRepository: FarmRepository,
    productionSiteRepository: ProductionSiteRepository,
  ) {
    this.getFarms = new GetFarmsUseCase(farmRepository);
    this.getFarm = new GetFarmUseCase(farmRepository);
    this.createFarm = new CreateFarmUseCase(farmRepository);
    this.updateFarm = new UpdateFarmUseCase(farmRepository);
    this.deleteFarm = new DeleteFarmUseCase(farmRepository);
    this.productionSiteRepository = productionSiteRepository;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const list = await this.getFarms.execute(tenantId);
      res.json({ success: true, data: list });
    } catch (e) {
      console.error('FarmController.getAll', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = req.params.id as string;
      const farm = await this.getFarm.execute(tenantId, id);
      res.json({ success: true, data: farm });
    } catch (e) {
      if (e instanceof Error && e.message === 'Farm not found') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('FarmController.getById', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getProductionSites(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const farmId = req.params.id as string;
      await this.getFarm.execute(tenantId, farmId);
      const list = await this.productionSiteRepository.findByFarmId(tenantId, farmId);
      res.json({ success: true, data: list });
    } catch (e) {
      if (e instanceof Error && e.message === 'Farm not found') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('FarmController.getProductionSites', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const body = req.body as Parameters<CreateFarmUseCase['execute']>[1];
      const farm = await this.createFarm.execute(tenantId, body);
      res.status(201).json({ success: true, data: farm });
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes('obrigatório')) {
          res.status(400).json({ success: false, error: e.message });
          return;
        }
      }
      console.error('FarmController.create', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = req.params.id as string;
      const body = req.body as Parameters<UpdateFarmUseCase['execute']>[2];
      const farm = await this.updateFarm.execute(tenantId, id, body);
      res.json({ success: true, data: farm });
    } catch (e) {
      if (e instanceof Error && e.message === 'Farm not found') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      if (e instanceof Error && e.message.includes('não pode ser vazio')) {
        res.status(400).json({ success: false, error: e.message });
        return;
      }
      console.error('FarmController.update', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = req.params.id as string;
      await this.deleteFarm.execute(tenantId, id);
      res.status(204).send();
    } catch (e) {
      if (e instanceof Error && e.message === 'Farm not found') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('FarmController.delete', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
