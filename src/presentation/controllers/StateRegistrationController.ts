import type { Request, Response } from 'express';
import type { StateRegistrationRepository } from '../../infrastructure/repositories/StateRegistrationRepository.js';
import { GetStateRegistriesUseCase } from '../../application/use-cases/state-registration/GetStateRegistriesUseCase.js';
import { GetStateRegistrationByIdUseCase } from '../../application/use-cases/state-registration/GetStateRegistrationByIdUseCase.js';
import { CreateStateRegistrationUseCase } from '../../application/use-cases/state-registration/CreateStateRegistrationUseCase.js';
import { UpdateStateRegistrationUseCase } from '../../application/use-cases/state-registration/UpdateStateRegistrationUseCase.js';

export class StateRegistrationController {
  private getStateRegistries: GetStateRegistriesUseCase;
  private getStateRegistrationById: GetStateRegistrationByIdUseCase;
  private createStateRegistration: CreateStateRegistrationUseCase;
  private updateStateRegistration: UpdateStateRegistrationUseCase;

  constructor(stateRegistrationRepository: StateRegistrationRepository) {
    this.getStateRegistries = new GetStateRegistriesUseCase(stateRegistrationRepository);
    this.getStateRegistrationById = new GetStateRegistrationByIdUseCase(stateRegistrationRepository);
    this.createStateRegistration = new CreateStateRegistrationUseCase(stateRegistrationRepository);
    this.updateStateRegistration = new UpdateStateRegistrationUseCase(stateRegistrationRepository);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const list = await this.getStateRegistries.execute(tenantId);
      res.json({ success: true, data: list });
    } catch (e) {
      console.error('StateRegistrationController.getAll', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const item = await this.getStateRegistrationById.execute(tenantId, id);
      if (!item) {
        res.status(404).json({ success: false, error: 'Inscrição estadual não encontrada' });
        return;
      }
      res.json({ success: true, data: item });
    } catch (e) {
      console.error('StateRegistrationController.getById', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const body = req.body;
      const created = await this.createStateRegistration.execute(tenantId, body);
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      if (e instanceof Error && (e.message.includes('obrigatório') || e.message.includes('obrigatória'))) {
        res.status(400).json({ success: false, error: e.message });
        return;
      }
      console.error('StateRegistrationController.create', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const body = req.body;
      const updated = await this.updateStateRegistration.execute(tenantId, id, body);
      res.json({ success: true, data: updated });
    } catch (e) {
      if (e instanceof Error && e.message === 'Inscrição estadual não encontrada') {
        res.status(404).json({ success: false, error: e.message });
        return;
      }
      console.error('StateRegistrationController.update', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
