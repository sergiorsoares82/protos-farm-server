import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';
import type { DocumentTypeResponseDTO } from '../../dtos/DocumentTypeDTOs.js';

export class GetDocumentTypesUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(): Promise<DocumentTypeResponseDTO[]> {
    const all = await this.repository.findAll();
    return all.map((dt) => ({
      id: dt.getId()!,
      name: dt.getName(),
      group: dt.getGroup(),
      hasAccessKey: dt.getHasAccessKey(),
      createdAt: dt.getCreatedAt() ?? new Date(),
      updatedAt: dt.getUpdatedAt() ?? new Date(),
    }));
  }
}

