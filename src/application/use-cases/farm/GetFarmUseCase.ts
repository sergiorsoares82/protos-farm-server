import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';
import type { FarmResponseDTO } from '../../dtos/FarmDTOs.js';
import { mapFarmEntityToDTO } from './mapFarmToDTO.js';

export class GetFarmUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string, id: string): Promise<FarmResponseDTO> {
    const entity = await this.farmRepository.findById(id, tenantId);
    if (!entity) throw new Error('Farm not found');
    return mapFarmEntityToDTO(entity);
  }
}
