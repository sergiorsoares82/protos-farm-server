import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';
import type { UpdateFarmRequestDTO, FarmResponseDTO } from '../../dtos/FarmDTOs.js';
import { mapFarmEntityToDTO } from './mapFarmToDTO.js';

export class UpdateFarmUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string, id: string, data: UpdateFarmRequestDTO): Promise<FarmResponseDTO> {
    if (data.name !== undefined && !data.name.trim()) throw new Error('Nome da fazenda não pode ser vazio');
    const entity = await this.farmRepository.update(id, tenantId, data);
    return mapFarmEntityToDTO(entity);
  }
}
