import type { LandRegistryRepository } from '../../../infrastructure/repositories/LandRegistryRepository.js';
import type { LandRegistryResponseDTO } from '../../dtos/LandRegistryDTOs.js';

export class GetLandRegistriesUseCase {
  constructor(private landRegistryRepository: LandRegistryRepository) {}

  async execute(tenantId: string): Promise<LandRegistryResponseDTO[]> {
    return this.landRegistryRepository.findAll(tenantId);
  }
}
