import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';
import type { DocumentTypeResponseDTO } from '../../dtos/DocumentTypeDTOs.js';

export class GetDocumentTypesUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(tenantId?: string | null): Promise<DocumentTypeResponseDTO[]> {
    const all = tenantId !== undefined 
      ? await this.repository.findAllByTenant(tenantId)
      : await this.repository.findAll();
    return all.map((dt) => ({
      id: dt.getId()!,
      tenantId: dt.getTenantId(),
      name: dt.getName(),
      group: dt.getGroup(),
      hasAccessKey: dt.getHasAccessKey(),
      isSystem: dt.getIsSystem(),
      createdAt: dt.getCreatedAt() ?? new Date(),
      updatedAt: dt.getUpdatedAt() ?? new Date(),
    }));
  }
}

