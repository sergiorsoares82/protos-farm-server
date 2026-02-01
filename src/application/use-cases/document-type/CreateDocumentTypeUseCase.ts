import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';
import { DocumentType } from '../../../domain/entities/DocumentType.js';
import type {
  CreateDocumentTypeRequestDTO,
  DocumentTypeResponseDTO,
} from '../../dtos/DocumentTypeDTOs.js';

export class CreateDocumentTypeUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(request: CreateDocumentTypeRequestDTO, tenantId?: string | null): Promise<DocumentTypeResponseDTO> {
    const finalTenantId = request.tenantId !== undefined ? request.tenantId : tenantId;
    
    const existing = await this.repository.findByNameAndGroup(request.name, request.group, finalTenantId);
    if (existing) {
      throw new Error('Document type with this name and group already exists');
    }

    const docType = new DocumentType({
      tenantId: finalTenantId ?? null,
      name: request.name,
      group: request.group,
      hasAccessKey: request.hasAccessKey,
      isSystem: false, // Only seed script creates system types
    });

    const created = await this.repository.create(docType);

    return {
      id: created.getId()!,
      tenantId: created.getTenantId(),
      name: created.getName(),
      group: created.getGroup(),
      hasAccessKey: created.getHasAccessKey(),
      isSystem: created.getIsSystem(),
      createdAt: created.getCreatedAt() ?? new Date(),
      updatedAt: created.getUpdatedAt() ?? new Date(),
    };
  }
}

