import { Repository } from 'typeorm';
import type { IFieldRepository } from '../../domain/repositories/IFieldRepository.js';
import { Field } from '../../domain/entities/Field.js';
import { FieldEntity } from '../database/entities/FieldEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class FieldRepository implements IFieldRepository {
  private repo: Repository<FieldEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(FieldEntity);
  }

  async findAll(tenantId: string): Promise<Field[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { code: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string, tenantId: string): Promise<Field | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByCode(code: string, tenantId: string): Promise<Field | null> {
    const entity = await this.repo.findOne({
      where: { code, tenantId },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(field: Field): Promise<Field> {
    const entity = new FieldEntity();
    entity.id = field.getId();
    entity.tenantId = field.getTenantId();
    entity.code = field.getCode();
    entity.name = field.getName();
    entity.areaHectares = field.getAreaHectares().toString();
    entity.isActive = field.getIsActive();

    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: FieldEntity): Field {
    return new Field({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      areaHectares: Number(entity.areaHectares),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

