import type { IOrganizationRepository } from '../../../domain/repositories/IOrganizationRepository.js';
import { Organization } from '../../../domain/entities/Organization.js';
import type { CreateOrganizationRequestDTO, OrganizationResponseDTO } from '../../dtos/OrganizationDTOs.js';

export class CreateOrganizationUseCase {
  constructor(private organizationRepository: IOrganizationRepository) {}

  async execute(request: CreateOrganizationRequestDTO): Promise<OrganizationResponseDTO> {
    // Check if organization with same name exists
    const nameExists = await this.organizationRepository.existsByName(request.name);
    if (nameExists) {
      throw new Error('Organization with this name already exists');
    }
    
    // Check if organization with same slug exists
    const slugExists = await this.organizationRepository.existsBySlug(request.slug);
    if (slugExists) {
      throw new Error('Organization with this slug already exists');
    }
    
    // Create organization
    const organization = Organization.create(request.name, request.slug);
    
    // Save organization
    const savedOrganization = await this.organizationRepository.save(organization);
    
    return {
      id: savedOrganization.getId(),
      name: savedOrganization.getName(),
      slug: savedOrganization.getSlug(),
      isActive: savedOrganization.getIsActive(),
      createdAt: savedOrganization.getCreatedAt(),
      updatedAt: savedOrganization.getUpdatedAt(),
    };
  }
}
