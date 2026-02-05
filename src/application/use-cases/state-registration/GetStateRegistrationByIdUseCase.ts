import type { StateRegistrationRepository } from '../../../infrastructure/repositories/StateRegistrationRepository.js';
import type { StateRegistrationResponseDTO } from '../../dtos/StateRegistrationDTOs.js';

export class GetStateRegistrationByIdUseCase {
  constructor(private stateRegistrationRepository: StateRegistrationRepository) {}

  async execute(tenantId: string, id: string): Promise<StateRegistrationResponseDTO | null> {
    const entity = await this.stateRegistrationRepository.findById(id, tenantId);
    if (!entity) return null;
    const { mapStateRegistrationToDTO } = await import('../../../infrastructure/repositories/StateRegistrationRepository.js');
    return mapStateRegistrationToDTO(entity);
  }
}
