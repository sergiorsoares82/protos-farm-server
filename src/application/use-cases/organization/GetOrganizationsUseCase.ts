import type { IOrganizationRepository } from '../../../domain/repositories/IOrganizationRepository.js';
import type { OrganizationResponseDTO } from '../../dtos/OrganizationDTOs.js';

export class GetOrganizationsUseCase {
  constructor(private organizationRepository: IOrganizationRepository) {}

  /**
   * Get all organizations (Super admin only)
   */
  async executeAll(): Promise<OrganizationResponseDTO[]> {
    const organizations = await this.organizationRepository.findAll();
    
    return organizations.map(org => ({
      id: org.getId(),
      name: org.getName(),
      slug: org.getSlug(),
      isActive: org.getIsActive(),
      createdAt: org.getCreatedAt(),
      updatedAt: org.getUpdatedAt(),
    }));
  }

  /**
   * Get single organization by ID
   */
  async execute(id: string): Promise<OrganizationResponseDTO> {
    const organization = await this.organizationRepository.findById(id);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    return {
      id: organization.getId(),
      name: organization.getName(),
      slug: organization.getSlug(),
      isActive: organization.getIsActive(),
      createdAt: organization.getCreatedAt(),
      updatedAt: organization.getUpdatedAt(),
    };
  }

  /**
   * Get organization by slug
   */
  async executeBySlug(slug: string): Promise<OrganizationResponseDTO> {
    const organization = await this.organizationRepository.findBySlug(slug);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    return {
      id: organization.getId(),
      name: organization.getName(),
      slug: organization.getSlug(),
      isActive: organization.getIsActive(),
      createdAt: organization.getCreatedAt(),
      updatedAt: organization.getUpdatedAt(),
    };
  }
}
