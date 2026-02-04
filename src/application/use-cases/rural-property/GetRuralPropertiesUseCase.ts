import type { RuralPropertyRepository } from '../../../infrastructure/repositories/RuralPropertyRepository.js';
import type { RuralPropertyResponseDTO } from '../../dtos/RuralPropertyDTOs.js';

export class GetRuralPropertiesUseCase {
  constructor(private ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(tenantId: string): Promise<RuralPropertyResponseDTO[]> {
    return this.ruralPropertyRepository.findAll(tenantId);
  }
}
