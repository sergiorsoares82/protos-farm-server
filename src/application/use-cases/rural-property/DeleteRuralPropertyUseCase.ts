import type { RuralPropertyRepository } from '../../../infrastructure/repositories/RuralPropertyRepository.js';

export class DeleteRuralPropertyUseCase {
  constructor(private ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    await this.ruralPropertyRepository.delete(id, tenantId);
  }
}

