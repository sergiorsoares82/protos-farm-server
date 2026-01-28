import type { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository.js';

export class DeleteDocumentTypeUseCase {
  constructor(private repository: IDocumentTypeRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Document type not found');
    }
    await this.repository.delete(id);
  }
}

