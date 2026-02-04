import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';
import type { FarmResponseDTO } from '../../dtos/FarmDTOs.js';
import { mapFarmEntityToDTO } from './mapFarmToDTO.js';

export class GetFarmsUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string): Promise<FarmResponseDTO[]> {
    const entities = await this.farmRepository.findAll(tenantId);
    return entities.map(mapFarmEntityToDTO);
  }
}
