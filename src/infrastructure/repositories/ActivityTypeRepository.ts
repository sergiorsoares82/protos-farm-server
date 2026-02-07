import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IActivityTypeRepository } from '../../domain/repositories/IActivityTypeRepository.js';
import { ActivityType } from '../../domain/entities/ActivityType.js';
import { ActivityTypeEntity } from '../database/entities/ActivityTypeEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class ActivityTypeRepository implements IActivityTypeRepository {
  private repo: Repository<ActivityTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ActivityTypeEntity);
  }

  async findAll(tenantId: string | null): Promise<ActivityType[]> {
    const where =
      tenantId != null
        ? [{ tenantId: IsNull() }, { tenantId }]
        : [{ tenantId: IsNull() }];
    const entities = await this.repo.find({
      where,
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<ActivityType | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdAny(id: string): Promise<ActivityType | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(activityType: ActivityType): Promise<ActivityType> {
    const entity = new ActivityTypeEntity();
    (entity as any).id = activityType.getId();
    entity.tenantId = activityType.getTenantId();
    entity.name = activityType.getName();
    entity.isActive = activityType.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string | null): Promise<void> {
    const where =
      tenantId != null ? { id, tenantId } : { id, tenantId: IsNull() };
    await this.repo.delete(where);
  }

  private toDomain(entity: ActivityTypeEntity): ActivityType {
    return new ActivityType({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
