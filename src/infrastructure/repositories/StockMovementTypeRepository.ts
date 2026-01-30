import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IStockMovementTypeRepository } from '../../domain/repositories/IStockMovementTypeRepository.js';
import { StockMovementType } from '../../domain/entities/StockMovementType.js';
import type { StockMovementDirection } from '../../domain/enums/StockMovementDirection.js';
import { StockMovementTypeEntity } from '../database/entities/StockMovementTypeEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class StockMovementTypeRepository implements IStockMovementTypeRepository {
  private repo: Repository<StockMovementTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(StockMovementTypeEntity);
  }

  async findAll(tenantId: string): Promise<StockMovementType[]> {
    const entities = await this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
      order: { code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<StockMovementType | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<StockMovementType | null> {
    const entities = await this.repo.find({
      where: [{ code, tenantId: IsNull() }, { code, tenantId }],
      order: { tenantId: 'ASC' },
      take: 1,
    });
    const entity = entities[0] ?? null;
    return entity ? this.toDomain(entity) : null;
  }

  async findSystemByCode(code: string): Promise<StockMovementType | null> {
    const entity = await this.repo.findOne({
      where: { code, tenantId: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(type: StockMovementType): Promise<StockMovementType> {
    const entity = new StockMovementTypeEntity();
    (entity as { id: string }).id = type.getId();
    entity.tenantId = type.getTenantId();
    entity.code = type.getCode();
    entity.name = type.getName();
    entity.direction = type.getDirection();
    entity.isSystem = type.getIsSystem();
    entity.isActive = type.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: StockMovementTypeEntity): StockMovementType {
    return new StockMovementType({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      direction: entity.direction as StockMovementDirection,
      isSystem: entity.isSystem,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
