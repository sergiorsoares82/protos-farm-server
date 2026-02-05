import type { StateRegistrationRepository } from '../../../infrastructure/repositories/StateRegistrationRepository.js';
import type {
  CreateStateRegistrationRequestDTO,
  StateRegistrationResponseDTO,
} from '../../dtos/StateRegistrationDTOs.js';

export class CreateStateRegistrationUseCase {
  constructor(private stateRegistrationRepository: StateRegistrationRepository) {}

  async execute(
    tenantId: string,
    data: CreateStateRegistrationRequestDTO,
  ): Promise<StateRegistrationResponseDTO> {
    if (!data.numeroIe?.trim()) {
      throw new Error('Número da inscrição estadual é obrigatório');
    }
    if (!data.uf?.trim()) {
      throw new Error('UF é obrigatória');
    }
    if (!data.personId?.trim()) {
      throw new Error('Responsável (pessoa) é obrigatório');
    }
    return this.stateRegistrationRepository.create(tenantId, data);
  }
}
