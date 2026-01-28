import type { IOrganizationRepository } from '../../../domain/repositories/IOrganizationRepository.js';

export class DeleteOrganizationUseCase {
  constructor(private organizationRepository: IOrganizationRepository) {}

  async execute(id: string): Promise<void> {
    // Check if organization exists
    const organization = await this.organizationRepository.findById(id);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // TODO: Add check for existing users/data before deletion
    // For now, TypeORM will handle cascading based on foreign key constraints
    
    // Delete organization
    await this.organizationRepository.delete(id);
  }
}
