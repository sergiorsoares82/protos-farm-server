import { IsNull } from 'typeorm';
import { AppDataSource } from '../database/typeorm.config.js';
import { DocumentTypeEntity } from '../database/entities/DocumentTypeEntity.js';
import { DocumentType } from '../../domain/entities/DocumentType.js';
import type { IDocumentTypeRepository } from '../../domain/repositories/IDocumentTypeRepository.js';

export class DocumentTypeRepository implements IDocumentTypeRepository {
  // Use entity class directly; this matches metadata registered in AppDataSource.entities
  private repository = AppDataSource.getRepository(DocumentTypeEntity);

  private toDomain(entity: DocumentTypeEntity): DocumentType {
    return new DocumentType({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      group: entity.group,
      hasAccessKey: entity.hasAccessKey,
      isSystem: entity.isSystem,
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
    entity.tenantId = docType.getTenantId();
    entity.name = docType.getName();
    entity.group = docType.getGroup();
    entity.hasAccessKey = docType.getHasAccessKey();
    entity.isSystem = docType.getIsSystem();
    entity.createdAt = docType.getCreatedAt() ?? new Date();
    entity.updatedAt = docType.getUpdatedAt() ?? new Date();
    return entity;
  }

  async findAll(): Promise<DocumentType[]> {
    // Return both system types (tenantId = null) and all organization types
    const entities = await this.repository.find({ 
      order: { isSystem: 'DESC', name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAllByTenant(tenantId: string | null): Promise<DocumentType[]> {
    // Return system types (tenantId = null) + organization types (tenantId = provided)
    const where =
      tenantId != null
        ? [{ tenantId: IsNull() }, { tenantId }]
        : [{ tenantId: IsNull() }];
    const entities = await this.repository.find({
      where,
      order: { isSystem: 'DESC', name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<DocumentType | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByNameAndGroup(name: string, group: string, tenantId?: string | null): Promise<DocumentType | null> {
    const where: any = { name, group };
    if (tenantId !== undefined) {
      where.tenantId = tenantId;
    }
    const entity = await this.repository.findOne({ where });
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

