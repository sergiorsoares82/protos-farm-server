import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';
import type {
  DocumentTypeResponseDTO,
  UpdateDocumentTypeRequestDTO,
} from '../../dtos/DocumentTypeDTOs.js';

export class UpdateDocumentTypeUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(id: string, updates: UpdateDocumentTypeRequestDTO): Promise<DocumentTypeResponseDTO> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Document type not found');
    }

    if (typeof updates.name === 'string') {
      existing.setName(updates.name);
    }
    if (typeof updates.group !== 'undefined') {
      existing.setGroup(updates.group);
    }
    if (typeof updates.hasAccessKey === 'boolean') {
      existing.setHasAccessKey(updates.hasAccessKey);
    }

    const saved = await this.repository.update(existing);

    return {
      id: saved.getId()!,
      tenantId: saved.getTenantId(),
      name: saved.getName(),
      group: saved.getGroup(),
      hasAccessKey: saved.getHasAccessKey(),
      isSystem: saved.getIsSystem(),
      createdAt: saved.getCreatedAt() ?? new Date(),
      updatedAt: saved.getUpdatedAt() ?? new Date(),
    };
  }
}

