import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';
import type { CreateFarmRequestDTO, FarmResponseDTO } from '../../dtos/FarmDTOs.js';
import { mapFarmEntityToDTO } from './mapFarmToDTO.js';

export class CreateFarmUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string, data: CreateFarmRequestDTO): Promise<FarmResponseDTO> {
    if (!data.name?.trim()) throw new Error('Nome da fazenda é obrigatório');
    const entity = await this.farmRepository.create(tenantId, {
      name: data.name.trim(),
      location: data.location,
      totalArea: data.totalArea,
      ownerIds: data.ownerIds ?? [],
      ownershipTypeByPersonId: data.ownershipTypeByPersonId,
    });
    return mapFarmEntityToDTO(entity);
  }
}
