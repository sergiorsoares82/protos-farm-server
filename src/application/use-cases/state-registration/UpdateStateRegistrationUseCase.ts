import type { StateRegistrationRepository } from '../../../infrastructure/repositories/StateRegistrationRepository.js';
import type {
  StateRegistrationResponseDTO,
  UpdateStateRegistrationRequestDTO,
} from '../../dtos/StateRegistrationDTOs.js';

export class UpdateStateRegistrationUseCase {
  constructor(private stateRegistrationRepository: StateRegistrationRepository) {}

  async execute(
    tenantId: string,
    id: string,
    data: UpdateStateRegistrationRequestDTO,
  ): Promise<StateRegistrationResponseDTO> {
    return this.stateRegistrationRepository.update(id, tenantId, data);
  }
}
