import { AppDataSource } from '../database/typeorm.config.js';
import { DocumentTypeEntity } from '../database/entities/DocumentTypeEntity.js';
import { DocumentType } from '../../domain/entities/DocumentType.js';
import type { IDocumentTypeRepository } from '../../domain/repositories/IDocumentTypeRepository.js';

export class DocumentTypeRepository implements IDocumentTypeRepository {
  private repository = AppDataSource.getRepository(DocumentTypeEntity);

  private toDomain(entity: DocumentTypeEntity): DocumentType {
    return new DocumentType({
      id: entity.id,
      name: entity.name,
      group: entity.group,
      hasAccessKey: entity.hasAccessKey,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(docType: DocumentType): DocumentTypeEntity {
    const entity = new DocumentTypeEntity();
    const id = docType.getId();
    if (id) {
      (entity as any).id = id;
    }
    entity.name = docType.getName();
    entity.group = docType.getGroup();
    entity.hasAccessKey = docType.getHasAccessKey();
    entity.createdAt = docType.getCreatedAt() ?? new Date();
    entity.updatedAt = docType.getUpdatedAt() ?? new Date();
    return entity;
  }

  async findAll(): Promise<DocumentType[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<DocumentType | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByNameAndGroup(name: string, group: string): Promise<DocumentType | null> {
    const entity = await this.repository.findOne({ where: { name, group } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(documentType: DocumentType): Promise<DocumentType> {
    const entity = this.toEntity(documentType);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(documentType: DocumentType): Promise<DocumentType> {
    const entity = this.toEntity(documentType);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

