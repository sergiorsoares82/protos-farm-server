import type { IOrganizationRepository } from '../../../domain/repositories/IOrganizationRepository.js';
import type { UpdateOrganizationRequestDTO, OrganizationResponseDTO } from '../../dtos/OrganizationDTOs.js';

export class UpdateOrganizationUseCase {
  constructor(private organizationRepository: IOrganizationRepository) {}

  async execute(id: string, request: UpdateOrganizationRequestDTO): Promise<OrganizationResponseDTO> {
    // Get organization
    const organization = await this.organizationRepository.findById(id);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // Update name and slug if provided
    if (request.name || request.slug) {
      const newName = request.name || organization.getName();
      const newSlug = request.slug || organization.getSlug();
      
      // Check for conflicts if name is changing
      if (newName !== organization.getName()) {
        const nameExists = await this.organizationRepository.existsByName(newName);
        if (nameExists) {
          throw new Error('Organization with this name already exists');
        }
      }
      
      // Check for conflicts if slug is changing
      if (newSlug !== organization.getSlug()) {
        const slugExists = await this.organizationRepository.existsBySlug(newSlug);
        if (slugExists) {
          throw new Error('Organization with this slug already exists');
        }
      }
      
      organization.updateDetails(newName, newSlug);
    }
    
    // Update active status if provided
    if (request.isActive !== undefined) {
      if (request.isActive) {
        organization.activate();
      } else {
        organization.deactivate();
      }
    }
    
    // Save updated organization
    const updatedOrganization = await this.organizationRepository.save(organization);
    
    return {
      id: updatedOrganization.getId(),
      name: updatedOrganization.getName(),
      slug: updatedOrganization.getSlug(),
      isActive: updatedOrganization.getIsActive(),
      createdAt: updatedOrganization.getCreatedAt(),
      updatedAt: updatedOrganization.getUpdatedAt(),
    };
  }
}
