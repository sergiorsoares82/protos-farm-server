import { Repository } from 'typeorm';
import type { ICostCenterCategoryRepository } from '../../domain/repositories/ICostCenterCategoryRepository.js';
import { CostCenterCategory } from '../../domain/entities/CostCenterCategory.js';
import { CostCenterCategoryEntity } from '../database/entities/CostCenterCategoryEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class CostCenterCategoryRepository implements ICostCenterCategoryRepository {
  private repo: Repository<CostCenterCategoryEntity>;

  constructor() {
    // Use entity name string for compatibility with bundled/serverless builds
    this.repo = AppDataSource.getRepository<CostCenterCategoryEntity>('CostCenterCategoryEntity');
  }

  async findAll(tenantId: string): Promise<CostCenterCategory[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<CostCenterCategory | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<CostCenterCategory | null> {
    const entity = await this.repo.findOne({ where: { code, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(category: CostCenterCategory): Promise<CostCenterCategory> {
    const entity = new CostCenterCategoryEntity();
    (entity as any).id = category.getId();
    entity.tenantId = category.getTenantId();
    entity.code = category.getCode();
    entity.name = category.getName();
    entity.description = category.getDescription() ?? null;
    entity.isActive = category.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: CostCenterCategoryEntity): CostCenterCategory {
    return new CostCenterCategory({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      description: entity.description ?? undefined,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

