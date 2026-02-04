import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';

export class DeleteFarmUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string, id: string): Promise<void> {
    await this.farmRepository.delete(id, tenantId);
  }
}
