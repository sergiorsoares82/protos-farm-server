import type { LandRegistryRepository } from '../../../infrastructure/repositories/LandRegistryRepository.js';
import type {
  LandRegistryResponseDTO,
  UpdateLandRegistryRequestDTO,
} from '../../dtos/LandRegistryDTOs.js';

export class UpdateLandRegistryUseCase {
  constructor(private landRegistryRepository: LandRegistryRepository) {}

  async execute(
    tenantId: string,
    id: string,
    data: UpdateLandRegistryRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    return this.landRegistryRepository.update(tenantId, id, data);
  }
}

