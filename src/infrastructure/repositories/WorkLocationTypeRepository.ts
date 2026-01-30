import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IWorkLocationTypeRepository } from '../../domain/repositories/IWorkLocationTypeRepository.js';
import { WorkLocationType } from '../../domain/entities/WorkLocationType.js';
import { WorkLocationTypeEntity } from '../database/entities/WorkLocationTypeEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class WorkLocationTypeRepository implements IWorkLocationTypeRepository {
  private repo: Repository<WorkLocationTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(WorkLocationTypeEntity);
  }

  async findAll(tenantId: string): Promise<WorkLocationType[]> {
    const entities = await this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
      order: { code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<WorkLocationType | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<WorkLocationType | null> {
    const entities = await this.repo.find({
      where: [{ code, tenantId: IsNull() }, { code, tenantId }],
      order: { tenantId: 'ASC' }, // system (null) first
      take: 1,
    });
    const entity = entities[0] ?? null;
    return entity ? this.toDomain(entity) : null;
  }

  async findSystemByCode(code: string): Promise<WorkLocationType | null> {
    const entity = await this.repo.findOne({
      where: { code, tenantId: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(type: WorkLocationType): Promise<WorkLocationType> {
    const entity = new WorkLocationTypeEntity();
    (entity as any).id = type.getId();
    entity.tenantId = type.getTenantId();
    entity.code = type.getCode();
    entity.name = type.getName();
    entity.isTalhao = type.getIsTalhao();
    entity.isSystem = type.getIsSystem();
    entity.isActive = type.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: WorkLocationTypeEntity): WorkLocationType {
    return new WorkLocationType({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      isTalhao: entity.isTalhao,
      isSystem: entity.isSystem,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
