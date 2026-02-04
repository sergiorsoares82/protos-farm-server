import type { LandRegistryRepository } from '../../../infrastructure/repositories/LandRegistryRepository.js';
import type {
  CreateLandRegistryRequestDTO,
  LandRegistryResponseDTO,
} from '../../dtos/LandRegistryDTOs.js';

export class CreateLandRegistryUseCase {
  constructor(private landRegistryRepository: LandRegistryRepository) {}

  async execute(
    tenantId: string,
    data: CreateLandRegistryRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    if (!data.numeroMatricula?.trim()) {
      throw new Error('Número da matrícula é obrigatório');
    }
    if (!data.cartorio?.trim()) {
      throw new Error('Cartório é obrigatório');
    }
    return this.landRegistryRepository.create(tenantId, data);
  }
}
