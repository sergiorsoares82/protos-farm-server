import type { StateRegistrationRepository } from '../../../infrastructure/repositories/StateRegistrationRepository.js';
import type { StateRegistrationResponseDTO } from '../../dtos/StateRegistrationDTOs.js';

export class GetStateRegistriesUseCase {
  constructor(private stateRegistrationRepository: StateRegistrationRepository) {}

  async execute(tenantId: string): Promise<StateRegistrationResponseDTO[]> {
    return this.stateRegistrationRepository.findAll(tenantId);
  }
}
