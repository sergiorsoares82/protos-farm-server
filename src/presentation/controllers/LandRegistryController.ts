import type { Request, Response } from 'express';
import type { LandRegistryRepository } from '../../infrastructure/repositories/LandRegistryRepository.js';
import { GetLandRegistriesUseCase } from '../../application/use-cases/land-registry/GetLandRegistriesUseCase.js';
import { CreateLandRegistryUseCase } from '../../application/use-cases/land-registry/CreateLandRegistryUseCase.js';

export class LandRegistryController {
  private getLandRegistries: GetLandRegistriesUseCase;
  private createLandRegistry: CreateLandRegistryUseCase;

  constructor(landRegistryRepository: LandRegistryRepository) {
    this.getLandRegistries = new GetLandRegistriesUseCase(landRegistryRepository);
    this.createLandRegistry = new CreateLandRegistryUseCase(landRegistryRepository);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const list = await this.getLandRegistries.execute(tenantId);
      res.json({ success: true, data: list });
    } catch (e) {
      console.error('LandRegistryController.getAll', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const body = req.body;
      const created = await this.createLandRegistry.execute(tenantId, body);
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      if (e instanceof Error && e.message.includes('obrigatório')) {
        res.status(400).json({ success: false, error: e.message });
        return;
      }
      console.error('LandRegistryController.create', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
