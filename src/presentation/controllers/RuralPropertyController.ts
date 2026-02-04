import type { Request, Response } from 'express';
import type { RuralPropertyRepository } from '../../infrastructure/repositories/RuralPropertyRepository.js';
import { GetRuralPropertiesUseCase } from '../../application/use-cases/rural-property/GetRuralPropertiesUseCase.js';
import { CreateRuralPropertyUseCase } from '../../application/use-cases/rural-property/CreateRuralPropertyUseCase.js';

export class RuralPropertyController {
  private getRuralProperties: GetRuralPropertiesUseCase;
  private createRuralProperty: CreateRuralPropertyUseCase;

  constructor(ruralPropertyRepository: RuralPropertyRepository) {
    this.getRuralProperties = new GetRuralPropertiesUseCase(ruralPropertyRepository);
    this.createRuralProperty = new CreateRuralPropertyUseCase(ruralPropertyRepository);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const list = await this.getRuralProperties.execute(tenantId);
      res.json({ success: true, data: list });
    } catch (e) {
      console.error('RuralPropertyController.getAll', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const body = req.body;
      const created = await this.createRuralProperty.execute(tenantId, body);
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      if (e instanceof Error && e.message.includes('obrigatório')) {
        res.status(400).json({ success: false, error: e.message });
        return;
      }
      console.error('RuralPropertyController.create', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
