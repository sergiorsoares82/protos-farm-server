import type { Request, Response } from 'express';
import type { LandRegistryRepository } from '../../infrastructure/repositories/LandRegistryRepository.js';
import { GetLandRegistriesUseCase } from '../../application/use-cases/land-registry/GetLandRegistriesUseCase.js';
import { CreateLandRegistryUseCase } from '../../application/use-cases/land-registry/CreateLandRegistryUseCase.js';
import { UpsertLandRegistryOwnersUseCase } from '../../application/use-cases/land-registry/UpsertLandRegistryOwnersUseCase.js';
import { UpdateLandRegistryUseCase } from '../../application/use-cases/land-registry/UpdateLandRegistryUseCase.js';

export class LandRegistryController {
  private getLandRegistries: GetLandRegistriesUseCase;
  private createLandRegistry: CreateLandRegistryUseCase;
  private upsertLandRegistryOwners: UpsertLandRegistryOwnersUseCase;
  private updateLandRegistry: UpdateLandRegistryUseCase;

  constructor(landRegistryRepository: LandRegistryRepository) {
    this.getLandRegistries = new GetLandRegistriesUseCase(landRegistryRepository);
    this.createLandRegistry = new CreateLandRegistryUseCase(landRegistryRepository);
    this.upsertLandRegistryOwners = new UpsertLandRegistryOwnersUseCase(landRegistryRepository);
    this.updateLandRegistry = new UpdateLandRegistryUseCase(landRegistryRepository);
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

  async upsertOwners(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const landRegistryId = req.params.id as string;
      const body = req.body as { owners: { personId: string; percentualPosse?: number; dataAquisicao?: string; tipoAquisicao?: string }[] };
      const updated = await this.upsertLandRegistryOwners.execute(tenantId, landRegistryId, body);
      res.json({ success: true, data: updated });
    } catch (e) {
      if (e instanceof Error && e.message === 'Matrícula não encontrada') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('LandRegistryController.upsertOwners', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = req.params.id as string;
      const body = req.body;
      const updated = await this.updateLandRegistry.execute(tenantId, id, body);
      res.json({ success: true, data: updated });
    } catch (e) {
      if (e instanceof Error && e.message === 'Matrícula não encontrada') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('LandRegistryController.update', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
