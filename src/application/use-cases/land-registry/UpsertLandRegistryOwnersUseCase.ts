import type { LandRegistryRepository } from '../../../infrastructure/repositories/LandRegistryRepository.js';
import type {
  LandRegistryResponseDTO,
  UpsertLandRegistryOwnersRequestDTO,
} from '../../dtos/LandRegistryDTOs.js';

export class UpsertLandRegistryOwnersUseCase {
  constructor(private landRegistryRepository: LandRegistryRepository) {}

  async execute(
    tenantId: string,
    landRegistryId: string,
    data: UpsertLandRegistryOwnersRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    return this.landRegistryRepository.upsertOwners(tenantId, landRegistryId, data);
  }
}
