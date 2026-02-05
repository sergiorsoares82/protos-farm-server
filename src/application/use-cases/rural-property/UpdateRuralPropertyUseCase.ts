import type { RuralPropertyRepository } from '../../../infrastructure/repositories/RuralPropertyRepository.js';
import type {
  RuralPropertyResponseDTO,
  UpdateRuralPropertyRequestDTO,
} from '../../dtos/RuralPropertyDTOs.js';

export class UpdateRuralPropertyUseCase {
  constructor(private ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(
    id: string,
    tenantId: string,
    data: UpdateRuralPropertyRequestDTO,
  ): Promise<RuralPropertyResponseDTO> {
    if (data.nomeImovelIncra !== undefined && !data.nomeImovelIncra.trim()) {
      throw new Error('Nome do imóvel (INCRA) é obrigatório');
    }
    return this.ruralPropertyRepository.update(id, tenantId, data);
  }
}

