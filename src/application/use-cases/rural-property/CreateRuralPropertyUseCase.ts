import type { RuralPropertyRepository } from '../../../infrastructure/repositories/RuralPropertyRepository.js';
import type {
  CreateRuralPropertyRequestDTO,
  RuralPropertyResponseDTO,
} from '../../dtos/RuralPropertyDTOs.js';

export class CreateRuralPropertyUseCase {
  constructor(private ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(
    tenantId: string,
    data: CreateRuralPropertyRequestDTO,
  ): Promise<RuralPropertyResponseDTO> {
    if (!data.nomeImovelIncra?.trim()) {
      throw new Error('Nome do imóvel (INCRA) é obrigatório');
    }
    return this.ruralPropertyRepository.create(tenantId, data);
  }
}
