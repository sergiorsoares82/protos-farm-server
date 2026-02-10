import { Repository } from 'typeorm';
import type { ICostCenterKindCategoryRepository } from '../../domain/repositories/ICostCenterKindCategoryRepository.js';
import { CostCenterKindCategory } from '../../domain/entities/CostCenterKindCategory.js';
import type { CostCenterKindCategoryType } from '../../domain/enums/CostCenterKindCategoryType.js';
import { CostCenterKindCategoryEntity } from '../database/entities/CostCenterKindCategoryEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class CostCenterKindCategoryRepository implements ICostCenterKindCategoryRepository {
  private repo: Repository<CostCenterKindCategoryEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(CostCenterKindCategoryEntity);
  }

  async findAllByTenant(tenantId: string): Promise<CostCenterKindCategory[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<CostCenterKindCategory | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<CostCenterKindCategory | null> {
    const entity = await this.repo.findOne({ where: { code, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(category: CostCenterKindCategory): Promise<CostCenterKindCategory> {
    const entity = new CostCenterKindCategoryEntity();
    (entity as any).id = category.getId();
    entity.tenantId = category.getTenantId();
    entity.code = category.getCode();
    entity.name = category.getName();
    entity.type = category.getType();
    entity.sortOrder = category.getSortOrder();
    entity.isActive = category.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: CostCenterKindCategoryEntity): CostCenterKindCategory {
    return new CostCenterKindCategory({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      type: entity.type as CostCenterKindCategoryType,
      sortOrder: entity.sortOrder,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
