import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';
import { DocumentType } from '../../../domain/entities/DocumentType.js';
import type {
  CreateDocumentTypeRequestDTO,
  DocumentTypeResponseDTO,
} from '../../dtos/DocumentTypeDTOs.js';

export class CreateDocumentTypeUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(request: CreateDocumentTypeRequestDTO): Promise<DocumentTypeResponseDTO> {
    const existing = await this.repository.findByNameAndGroup(request.name, request.group);
    if (existing) {
      throw new Error('Document type with this name and group already exists');
    }

    const docType = new DocumentType({
      name: request.name,
      group: request.group,
      hasAccessKey: request.hasAccessKey,
    });

    const created = await this.repository.create(docType);

    return {
      id: created.getId()!,
      name: created.getName(),
      group: created.getGroup(),
      hasAccessKey: created.getHasAccessKey(),
      createdAt: created.getCreatedAt() ?? new Date(),
      updatedAt: created.getUpdatedAt() ?? new Date(),
    };
  }
}

